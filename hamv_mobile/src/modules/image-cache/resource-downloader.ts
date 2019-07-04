import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import {
  Observable,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  catchError,
  delay,
  map,
  mergeMap,
  tap,
} from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { defer } from 'rxjs/observable/defer';
import { of } from 'rxjs/observable/of';

const MAXIMUM_CONCURRENT: number = 5;

export interface DownloadRequest {
  url: string;
  filePath: string;
}

export interface DownloadJob {
  request: DownloadRequest;
  delay: number;
}

@Injectable()
export class ResourceDownloader {

  private jobDispatcher: Subject<any> = new Subject<any>();
  private workingTable: Map<string, Subject<any>> = new Map<string, Subject<any>>();

  constructor(
    private http: HTTP,
  ) {
    this.jobDispatcher
      .pipe(
        mergeMap((job: DownloadJob) => of(job.request).pipe(delay(job.delay))),
        mergeMap((request: DownloadRequest) => this.downloadResource(request), MAXIMUM_CONCURRENT)
      )
      .subscribe();
  }

  public download(request: DownloadRequest): Observable<any> {
    if (!this.isValid(request)) return _throw(new Error('invalid source or destination'));

    if (!this.workingTable.has(request.url)) {
      const rpSubject: Subject<any> = new ReplaySubject<any>(1);
      this.workingTable.set(request.url, rpSubject);
      this.jobDispatcher.next({ request, delay: 0, });
    }

    const subject = this.workingTable.get(request.url);
    return subject.asObservable();
  }

  private downloadResource(request: DownloadRequest): Observable<any> {
    const { url, filePath } = request;
    return defer(() => this.http.downloadFile(url, {}, {}, filePath))
      .pipe(
        tap(blob => this.dispatchResult(url, blob)),
        map(() => url),
        catchError(err => {
          if (this.isNetworkError(err)) {
            this.jobDispatcher.next({ request, delay: 10000, });
          } else if (this.isServerError(err)) {
            this.jobDispatcher.next({ request, delay: 30000, });
          } else {
            this.dispatchError(url, err);
          }
          return of(url);
        })
      );
  }

  private dispatchResult(src: string, result: any) {
    const subject = this.workingTable.get(src);
    subject.next(result);
  }

  private dispatchError(src: string, error) {
    const subject = this.workingTable.get(src);
    subject.error(error);
  }

  private isNetworkError(error): boolean {
    const { status } = error;
    return status >= 0 && status < 100;
  }

  private isServerError(error): boolean {
    const { status } = error;
    return status >= 500;
  }

  private isValid(request: DownloadRequest): boolean {
    return !!(request && request.url && request.filePath);
  }
}