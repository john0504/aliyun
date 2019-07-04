import {
  TestBed,
  getTestBed
} from '@angular/core/testing';
import {
  TranslateModule,
  TranslateLoader
} from '@ngx-translate/core';
import {
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import {
  AppTasks,
  StateStore,
  AppEngine,
  NetworkError,
  ResponseError,
  TimeoutError
} from 'app-engine';
// import mixpanel from 'mixpanel-browser';
import {
  NgReduxTestingModule,
  MockNgRedux
} from '@angular-redux/store/testing';
import cloneDeep from 'lodash/cloneDeep';
import { Platform } from 'ionic-angular';
import { PlatformMock } from 'ionic-mocks';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';

import {
  InformationModelModule,
  InformationModelService,
  ModelManagerService,
} from '../modules/information-model';
import { DeviceControlService } from './device-control-service';
import { PopupService } from './popup-service';
import {
  PopupServiceMock,
  createTranslateLoader,
} from '../mocks/providers.mocks';
import {
  AppTasksMock,
  AppEngineMock
} from '../mocks/app-engine.mocks';
import {
  baseDevice,
  testControllers,
} from '../mocks/testing-items.mocks';

describe('Check device control service', () => {

  let instance: DeviceControlService;
  let appTasks: AppTasks;
  let ims: InformationModelService;
  let mms: ModelManagerService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        NgReduxTestingModule,
        InformationModelModule.forRoot(),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: AppEngine, useClass: AppEngineMock },
        AppTasks,
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        StateStore,
        DeviceControlService,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(DeviceControlService);
    appTasks = injector.get(AppTasks);
    ims = injector.get(InformationModelService);
    mms = injector.get(ModelManagerService);

    // prevent mixpanel uninitialized issue
    // mixpanel.init('appConfig.mixpanel.token');

    return mms.load('http://');
  });

  it('test isAvailable() function', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    devicesStub.next({
      'a device id': baseDevice,
    });

    expect(instance.isAvailable('a device id')).toBeTruthy();
    expect(instance.isAvailable('a device id', 'H00')).toBeTruthy();
    expect(instance.isAvailable('a device id', 'H01')).toBeTruthy();

    instance.setDevice('a device id', { H00: 1 });
    expect(instance.isAvailable('a device id')).toBeFalsy();
    expect(instance.isAvailable('a device id', 'H00')).toBeFalsy();
    expect(instance.isAvailable('a device id', 'H01')).toBeTruthy();

    return new Promise(resolve => setTimeout(() => resolve(), 1000));
  });

  it('test setDevice() - normal commands', done => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.setDevice('a device id', { H00: 1 });

    return new Promise(resolve => setTimeout(() => resolve(), 1000))
      .then(() => done());
  });

  it('test setDevice() - multiple commands', done => {

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'RAS-AC';
    devicesStub.next({
      'a device id': testDevice,
    });

    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5, H02: 4 });

    return new Promise(resolve => setTimeout(() => resolve(), 1000))
      .then(() => done());
  });

  it('test setDevice() - multiple commands, no model', done => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5, H02: 4 });

    return new Promise(resolve => setTimeout(() => resolve(), 500))
      .then(() => done());
  });

  it('test setDevice() - multiple commands, empty model', done => {
    spyOn(ims, 'getUIModel').and.returnValue({});
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5, H02: 4 });

    return new Promise(resolve => setTimeout(() => resolve(), 500))
      .then(() => done());
  });

  it('test setDevice() - throwing network error', done => {
    spyOn(appTasks, 'wsRequestSetTask').and.callFake(() => Promise.reject(new NetworkError('network error')));
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5, H02: 4 });

    return new Promise(resolve => setTimeout(() => resolve(), 500))
      .then(() => done());
  });

  it('test setDevice() - throwing response error', done => {
    spyOn(appTasks, 'wsRequestSetTask').and.callFake(() => Promise.reject(new ResponseError(400, 'response error')));
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5, H02: 4 });

    return new Promise(resolve => setTimeout(() => resolve(), 500))
      .then(() => done());
  });

  it('test setDevice() - throwing timeout error', done => {
    spyOn(appTasks, 'wsRequestSetTask').and.callFake(() => Promise.reject(new TimeoutError('timeout error')));
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5, H02: 4 });

    return new Promise(resolve => setTimeout(() => resolve(), 500))
      .then(() => done());
  });

  it('test setDevice() - throwing other error', done => {
    spyOn(appTasks, 'wsRequestSetTask').and.callFake(() => Promise.reject(new Error('other error')));
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5, H02: 4 });

    return new Promise(resolve => setTimeout(() => resolve(), 500))
      .then(() => done());
  });

  it('test filter multiple commands', () => {
    expect(instance.filter({ H01: 0 }, testControllers)).toEqual({ H01: 0, });
    expect(instance.filter({ H01: 1, H03: 17 }, testControllers)).toEqual({ H01: 1, H03: 17 });
    expect(instance.filter({ H01: 2, H03: 17 }, testControllers)).toEqual({ H01: 2 });
    expect(instance.filter({ H01: 2, H03: 17, H02: 4 }, testControllers)).toEqual({ H01: 2, H02: 4 });
    expect(instance.filter({ H00: 0, H01: 0, H03: 17, H02: 4 }, testControllers, { H00: 0 })).toEqual({ H00: 0 });
  });

  it('test clear()', () => {
    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5, H02: 4 });
    instance.setDevice('a device id', { H00: 1, H01: 1, H02: 4 });
    instance.setDevice('a device id', { H00: 1, H03: 5, H02: 4 });
    instance.setDevice('a device id', { H00: 1, H01: 1, H03: 5 });

    instance.clear();
  });

});
