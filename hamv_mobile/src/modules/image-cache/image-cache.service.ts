import { Injectable } from '@angular/core';
import {
  File,
  FileEntry,
} from '@ionic-native/file';
import { normalizeURL } from 'ionic-angular';
import {
  Observable,
  ReplaySubject,
} from 'rxjs';
import {
  first,
  map,
  mergeMap,
  tap,
  shareReplay,
} from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { defer } from 'rxjs/observable/defer';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';

import { ResourceDownloader } from './resource-downloader';

const CACHE_FOLDER: string = 'image-cache';
const EXTENSIONS_NAME: string = 'jpg';
const HTTP_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

@Injectable()
export class ImageCacheService {

  private initNotifier$: ReplaySubject<string> = new ReplaySubject(1);
  private caches: Map<string, Observable<string>> = new Map<string, Observable<string>>();

  constructor(
    private file: File,
    private downloader: ResourceDownloader,
  ) { }

  public get notifier$(): Observable<string> {
    return this.initNotifier$.asObservable();
  }

  public get cacheFolder() {
    return `${this.file.cacheDirectory}${CACHE_FOLDER}/`;
  }

  public get isNativeAvailable(): boolean {
    return File.installed();
  }

  public initImageCache(): Promise<string> {

    const init$ = fromPromise<string>(this._init());

    return init$
      .pipe(
        first(),
        tap(() => this.initNotifier$.next('init'))
      )
      .toPromise();
  }

  private _init(): Promise<any> {
    if (!this.isNativeAvailable) return Promise.resolve();
    return this.cacheDirectoryExists(this.file.cacheDirectory)
      .then(result => {
        if (!result) this.file.createDir(this.file.cacheDirectory, CACHE_FOLDER, true);
      })
      .catch(() => this.file.createDir(this.file.cacheDirectory, CACHE_FOLDER, true));
  }

  private cacheDirectoryExists(directory: string): Promise<boolean> {
    return this.file.checkDir(directory, CACHE_FOLDER);
  }

  public getImagePath(src: string): Observable<string> {
    if (!src) {
      return _throw(new Error('The image url provided was empty or invalid.'));
    }

    if (!this.isNativeAvailable || !this.isHttpUrl(src)) return of(src);

    if (!this.caches.has(src)) {
      const job = this.processImagePath(src);
      this.caches.set(src, job);
    }

    return this.caches.get(src);
  }

  public isHttpUrl(url: string): boolean {
    return HTTP_REGEX.test(url);
  }

  private processImagePath(src: string): Observable<string> {
    return this.initNotifier$
      .pipe(
        mergeMap(() => this.isCached(src)),
        mergeMap(isCached =>
          isCached
            ? this.getLocalSource(src)
            : this.getHttpSource(src)
        ),
        map(url => normalizeURL(url)),
        shareReplay(1)
      );
  }

  private isCached(src: string): Observable<boolean> {
    const fileName = this.createFileName(src);
    return defer(() =>
      this.file.checkFile(this.cacheFolder, fileName)
        .catch(() => false)
    );
  }

  private getLocalSource(src: string): Observable<string> {
    return this.getCachedFileUrl(src);
  }

  private getHttpSource(src: string): Observable<string> {
    return this.notifier$
      .pipe(
        mergeMap(() => this.cacheFile(src)),
        mergeMap(() => this.getCachedFileUrl(src))
      );
  }

  private getCachedFileUrl(src: string): Observable<string> {
    const fileName = this.createFileName(src);

    return defer(() =>
      this.file.resolveLocalFilesystemUrl(`${this.cacheFolder}${fileName}`)
        .then((tempFileEntry: FileEntry) => tempFileEntry.nativeURL)
    );
  }

  private cacheFile(url: string): Observable<string> {
    const fileName = this.createFileName(url);
    const request = { url, filePath: `${this.cacheFolder}${fileName}` };
    return this.downloader.download(request);
  }

  private createFileName(url: string): string {
    return `${this.hashString(url).toString()}.${this.getExtensionFromFileName(url)}`;
  }

  private hashString(string: string): number {
    let hash = 0;
    if (string.length === 0) return hash;
    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  private getExtensionFromFileName(filename: string) {
    const ext = filename.match(/\.([^\./\?]+)($|\?)/);
    return ext ? ext[1] : EXTENSIONS_NAME;
  }

}