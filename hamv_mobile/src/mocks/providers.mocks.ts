import { Subject } from 'rxjs/Subject';
import {
  LoadingOptions,
  ToastOptions,
} from 'ionic-angular';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { Schedule } from 'app-engine';

import { baseSchedule } from './testing-items.mocks';

class LoadingMock {
  public static instance(): any {
    let instance = jasmine.createSpyObj('Loading', ['present', 'dismiss', 'setContent', 'setSpinner']);
    instance.present.and.returnValue(Promise.resolve());

    return instance;
  }
}

class ToastMock {
  public static instance(): any {
    let instance = jasmine.createSpyObj('Toast', ['present', 'dismiss', 'dismissAll', 'setContent', 'setSpinner']);
    instance.present.and.returnValue(Promise.resolve());

    return instance;
  }
}

export class NetworkMock {

  type = 'wifi';
  downlinkMax = 42;

  private disConnSubject;
  private connSubject;
  private onChangeSubject;

  constructor() {
    this.connSubject = new Subject();
    this.disConnSubject = new Subject();
    this.onChangeSubject = new Subject();
  }

  onConnect() { return this.connSubject; }

  onDisconnect() { return this.disConnSubject; }

  onChange() { return this.onChangeSubject; }

  setConnected() {
    this.connSubject.next();
    this.onChangeSubject.next();
  }

  setDisconnected() {
    this.disConnSubject.next();
    this.onChangeSubject.next();
  }

  destory() {
    this.connSubject.unsubscribe();
    this.disConnSubject.unsubscribe();
    this.onChangeSubject.unsubscribe();
  }
}

export class PopupServiceMock {
  loadingPopup(promise: Promise<any>, loadingOptions?: LoadingOptions): Promise<any> {
    return promise.then(() => { }).catch(() => { });
  }
  makeLoading(options: LoadingOptions) { return LoadingMock.instance(); }
  toastPopup(promise: Promise<any>, successToastOptions?: ToastOptions, failureToastOptions?: ToastOptions): Promise<any> {
    return promise.then(() => { }).catch(() => { });
  }
  makeToast(options: ToastOptions) { return ToastMock.instance(); }
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export class DeviceControlServiceMock {
  setDevice(sn: string, commands: Object): void { }
  filter(commands: Object, controllers: Array<any>): Object { return {}; }
  isAvailable(sn: string, commandId?: string): boolean { return true; }
  clear() { }
}

export class DeviceConfigServiceMock {
  requestConfig(sn: string, fields: Array<string>): Promise<any> { return Promise.resolve(); }
}

export class ScheduleAdapterServiceMock {
  toTimezoneSchedule(schedule: Schedule, offset: number): Schedule { return baseSchedule; }
  toUTCSchedule(schedule: Schedule, offset: number): Schedule { return baseSchedule; }
  setScheduleForOneShot(utcSchedule: Schedule, executeNow: boolean): Schedule { return baseSchedule; }
  setActiveUntil(UTCSchedule: Schedule, executeNow: boolean) { return baseSchedule; }
  isOverlapping(utcSchedule: Schedule): boolean { return true; }
  isOutOfDate(schedule: Schedule): boolean { return true; }
  isOneShot(schedule: Schedule): boolean { return true; }
}

export class CheckNetworkServiceMock {
  pause() { }
  resume() { }
  destory() { }
}

export class ThemeServiceMock {
  get baseUrl() { return 'https://baseUrl/'; }
  get config() {
    return {
      primaryColor: '#00baff',
      productName: 'Breezey',
      wifiName: 'Breezey-XXXX',
      wifiNamePattern: 'breezey-.*',
    };
  }
  get configEndpoint() { return this.baseUrl + '/api:1/theme'; }
  get logoEndpoint() { return this.baseUrl + '/theme/logoFilename'; }
  get logoUrl() { return 'logoFile.nativeURL'; }
  get navbarLogoEndpoint() { return this.baseUrl + '/theme/navbarLogoFilename'; }
  get navbarLogoUrl() { return 'navbarLogoFile.nativeURL'; }
  get primaryColor() { return 'primaryColor'; }
  get productName() { return 'productName'; }
  get themeUrl() { return 'themeFile.nativeURL'; }
  get wifiName() { return 'wifiName'; }
  setup(renderer) { }
}
