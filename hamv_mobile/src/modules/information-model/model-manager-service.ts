import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { defer } from 'rxjs/observable/defer';
import { from } from 'rxjs/observable/from';
import { zip } from 'rxjs/observable/zip';
import { flatMap, map, mergeMap, switchMap } from 'rxjs/operators';
import JsYaml from 'js-yaml';
import cloneDeep from 'lodash/cloneDeep';

import {
  Platform,
} from 'ionic-angular';
import {
  Entry,
  File,
  RemoveResult,
} from '@ionic-native/file';

import { normalizeURL } from 'ionic-angular';

import { retryWithBackoffDelay } from '../../app/app.extends';
import { ContainerModel } from './information-model';
import { ModelDispatchHelper } from './custom/model-dispatch-helper';

@Injectable()
export class ModelManagerService {

  private folderName = 'im';
  private modelDictionaries: Map<string, ContainerModel>;

  private _baseUrl;

  constructor(
    private file: File,
    private modelDispatchHelper: ModelDispatchHelper,
    private platform: Platform,
    private http: HttpClient,
  ) {
    this.modelDictionaries = new Map<string, any>();
  }

  public load(baseUrl: string): Promise<any> {
    this._baseUrl = baseUrl;
    if (!this.platform.is('cordova')) return this.loadDefaultModels().toPromise();

    zip(
      this.listModelsFromLocal(),
      this.listModelsFromCloud(),
    )
      .pipe(
        switchMap(([localFiles, cloudFiles]) => this.syncLocalAndCloud(localFiles, cloudFiles)),
        switchMap(() => this.loadCacheModels()),
      )
      .subscribe(() => { }, () => { }, () => {
        const event = new CustomEvent('model-loaded');
        window.dispatchEvent(event);
      });

    return this.loadCacheModels().toPromise();
  }

  private syncLocalAndCloud(localFiles, cloudFiles): Observable<any> {
    const observables = [];

    for (let familyName in cloudFiles) {
      const cloudFile = cloudFiles[familyName];
      const filename = cloudFile.timestamp + familyName;
      if (!localFiles.find(localFile => localFile.name === filename)) {
        observables.push(this.loadFromCloud(familyName, cloudFile));
      }
    }

    localFiles.forEach(
      localFile => {
        const timestamp = +localFile.name.slice(0, 13);
        const familyName = localFile.name.slice(13);
        const cloudFile = cloudFiles[familyName];

        if (
          !cloudFile ||
          cloudFile.timestamp > timestamp
        ) {
          this.modelDictionaries.clear();
          observables.push(this.removeUnusedModel(localFile.name));
        }
      }
    );

    return zip(...observables);
  }

  private listModelsFromCloud(): Observable<any> {
    return this.http.get(this._baseUrl + '/api:1/info-model')
      .pipe(retryWithBackoffDelay());
  }

  private listModelsFromLocal(): Observable<Entry[]> {
    return defer(
      () => this.file.checkDir(
        this.file.cacheDirectory,
        this.folderName,
      )
        .catch(() => this.file.createDir(
          this.file.cacheDirectory,
          this.folderName,
          true,
        ))
        .then(() => this.file.listDir(
          this.file.cacheDirectory,
          this.folderName,
        ))
    );
  }

  private loadCacheModels(): Observable<any> {
    return this.listModelsFromLocal()
      .pipe(
        switchMap(
          localFiles => {
            if (localFiles.length === 0) {
              return this.loadDefaultModels();
            } else {
              return from(localFiles)
                .pipe(
                  mergeMap(localFile => this.loadFromPath(localFile.nativeURL)),
                );
            }
          }
        ),
      );
  }

  private loadDefaultModels(): Observable<any> {
    return this.http.get('./assets/models/index.json')
      .pipe(
        flatMap((ary: Array<string>) => from(ary)),
        flatMap(path => defer(() => this.loadFromPath('./assets/models/' + path))),
      );
  }

  private loadFromCloud(familyName, cloudFile): Observable<any> {
    const url = this._baseUrl + '/api:1/info-model/' + familyName;
    const filename = cloudFile.timestamp + familyName;

    return this.http.get(url, { responseType: 'text' })
      .pipe(
        switchMap(blob => this.writeFile(filename, blob)),
        retryWithBackoffDelay(),
      );
  }

  private loadFromPath(path: string): Observable<any> {
    return this.http.get(normalizeURL(path), { responseType: 'text' })
      .pipe(
        map((res) => {
          let json;
          try {
            json = JSON.parse(res);
          } catch (error) {
            json = JsYaml.safeLoad(res);
          }

          return this.loadFromJson(json);
        }
        ),
      );
  }

  private loadFromJson(model: any = {}): any {
    if (!model.familyName) {
      console.error('Information Model do not have familyName', model);
      return;
    }
    this.modelDictionaries.set(model.familyName, model);
    return this.generateConfig(model);
  }

  private generateConfig(model: any): any {
    let config = [];
    let { components, hiddenFields } = model;
    if (components) {
      for (let key in components) {
        let { models } = components[key];
        if (models && Array.isArray(models)) {
          models.forEach(controlItem => {
            config.push(controlItem.key);
          });
        }
      }
    }
    if (hiddenFields && Array.isArray(hiddenFields)) {
      config.concat(hiddenFields);
    }
    config = config.filter((v, i, a) => a.indexOf(v) === i);
    model.config = config;
    return model;
  }

  private removeUnusedModel(filename): Observable<RemoveResult> {
    return defer(
      () => this.file.removeFile(
        this.file.cacheDirectory + this.folderName,
        filename,
      )
    );
  }

  private writeFile(filename, text): Observable<any> {
    return defer(
      () => this.file.writeFile(
        this.file.cacheDirectory + this.folderName,
        filename,
        text,
      )
    );
  }

  public getUIModelName(device): string {
    if (!device) return null;
    let modelName = this.modelDispatchHelper.getUIModelViaCustomLogic(device);
    if (!this.modelDictionaries.has(modelName)) {
      this.modelDictionaries.forEach((v, key) => {
        if (modelName) return;
        let match = v.familyMembers.reduce((r, validator: any) => {
          if (r) return r;
          let re = new RegExp(validator);
          if (device.profile && device.profile.esh) {
            let model = device.profile.esh.model;
            return re.test(model);
          }
          return false;
        }, false);
        if (match) {
          modelName = key;
        }
      });
    }
    return modelName;
  }

  public getUIModelFromName(modelName: string): ContainerModel {
    if (!modelName) return null;
    const m = this.modelDictionaries.get(modelName);
    return m ? cloneDeep(m) : null;
  }

  public getUIModel(device): ContainerModel {
    if (!device) return null;
    const modelName = this.getUIModelName(device);
    return this.getUIModelFromName(modelName);
  }
}
