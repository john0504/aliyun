import {
  TestBed,
  getTestBed,
} from '@angular/core/testing';
import {
  AppEngine,
  AppTasks,
} from 'app-engine';
import {
  TranslateModule,
  TranslateLoader,
} from '@ngx-translate/core';
import {
  HttpClientModule,
  HttpClient,
} from '@angular/common/http';
import { Platform } from 'ionic-angular';
import { PlatformMock } from 'ionic-mocks';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import cloneDeep from 'lodash/cloneDeep';

import { DeviceCoreInjector } from './device-core-injector';
import { PopupService } from '../../providers/popup-service';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';

import {
  createTranslateLoader,
  DeviceConfigServiceMock,
  DeviceControlServiceMock,
  PopupServiceMock,
} from '../../mocks/providers.mocks';
import {
  InformationModelModule,
  InformationModelService,
} from '../../modules/information-model';
import { AppEngineMock } from '../../mocks/app-engine.mocks';
import {
  rasModel,
  noComponentModel,
  emptyLayoutModel,
} from '../../mocks/information-model.mocks';
import { baseDevice } from '../../mocks/testing-items.mocks';

describe('device core test cases', () => {

  let ims: InformationModelService;
  let configSrv: DeviceConfigService;
  let ctrlSrv: DeviceControlService;
  let dcInjector: DeviceCoreInjector;
  let appEngine: AppEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
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
        { provide: AppEngine, useClass: AppEngineMock },
        AppTasks,
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        DeviceCoreInjector,
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
      ],
    });

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
    configSrv = injector.get(DeviceConfigService);
    ctrlSrv = injector.get(DeviceControlService);
    dcInjector = injector.get(DeviceCoreInjector);
    appEngine = injector.get(AppEngine);
  });

  afterEach(() => {
    getTestBed().resetTestingModule();
  });

  it('test create a new device core', () => {
    const deviceCore = dcInjector.create();

    expect(deviceCore.device).toBeUndefined();
    expect(deviceCore.deviceSn).toEqual('');
    expect(deviceCore.deviceName).toBeUndefined();
    expect(deviceCore.firmwareVersion).toBeUndefined();
    expect(deviceCore.macAddress).toBeUndefined();
    expect(deviceCore.properties).toBeUndefined();
    expect(deviceCore.status).toEqual({});
    expect(deviceCore.isConnected).toBeFalsy();
    expect(deviceCore.isUpdating).toBeFalsy();
    expect(deviceCore.isAvailable).toBeFalsy();
    expect(deviceCore.thumbnail).toBeUndefined();
    expect(deviceCore.banner).toBeUndefined();
    expect(deviceCore.informationModel).toBeUndefined();
    expect(deviceCore.controllers).toEqual([]);
    expect(deviceCore.chartComponents).toEqual([]);
    expect(deviceCore.primaryControllers).toEqual([]);
    expect(deviceCore.secondaryControllers).toEqual([]);
    expect(deviceCore.calendar).toEqual([]);
    expect(deviceCore.actions).toEqual([]);
    expect(deviceCore.primaryActions).toEqual([]);
    expect(deviceCore.secondaryActions).toEqual([]);
  });

  it('bind device, undefined value', () => {
    const deviceCore = dcInjector.bind(dcInjector.create(), undefined);
    deviceCore.selfUpdate();

    expect(deviceCore.device).toBeUndefined();
    expect(deviceCore.deviceSn).toEqual('');
    expect(deviceCore.deviceName).toBeUndefined();
    expect(deviceCore.firmwareVersion).toBeUndefined();
    expect(deviceCore.macAddress).toBeUndefined();
    expect(deviceCore.properties).toBeUndefined();
    expect(deviceCore.status).toEqual({});
    expect(deviceCore.isConnected).toBeFalsy();
    expect(deviceCore.isUpdating).toBeFalsy();
    expect(deviceCore.isAvailable).toBeFalsy();
    expect(deviceCore.thumbnail).toBeFalsy();
    expect(deviceCore.banner).toBeFalsy();
    expect(deviceCore.informationModel).toBeNull();
    expect(deviceCore.controllers).toEqual([]);
    expect(deviceCore.chartComponents).toEqual([]);
    expect(deviceCore.primaryControllers).toEqual([]);
    expect(deviceCore.secondaryControllers).toEqual([]);
    expect(deviceCore.calendar).toEqual([]);
    expect(deviceCore.actions).toEqual([]);
    expect(deviceCore.primaryActions).toEqual([]);
    expect(deviceCore.secondaryActions).toEqual([]);
  });

  it('bind device, with a full content IM', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return cloneDeep(rasModel);
    });
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    expect(deviceCore.device).toEqual(baseDevice);
    expect(deviceCore.deviceSn).toEqual('a device id');
    expect(deviceCore.deviceName).toEqual('AC001');
    expect(deviceCore.firmwareVersion).toEqual('1.0.0');
    expect(deviceCore.macAddress).toEqual('AC123');
    expect(deviceCore.properties).toEqual({
      somePorperty: 'abc',
    });
    expect(deviceCore.status).toEqual({
      H00: 0,
    });
    expect(deviceCore.isConnected).toBeTruthy();
    expect(deviceCore.isUpdating).toBeFalsy();
    expect(deviceCore.isAvailable).toBeTruthy();
    expect(deviceCore.calendar).toEqual([
      {
        name: 'name test',
        start: '12:24',
        end: '13:24',
        days: [1, 2, 3, 4, 5, 6, 7],
        active: 1,
        active_until: 1477377969,
        esh: {
          H00: 1
        }
      },
    ]);
    expect(deviceCore.thumbnail).toEqual({ uri: 'thumbnailUrl' });
    expect(deviceCore.banner).toEqual({ uri: 'bannerUrl' });
    expect(deviceCore.informationModel).toEqual(rasModel);
    expect(deviceCore.controllers.length).toEqual(10);
    expect(deviceCore.chartComponents.length).toEqual(1);
    expect(deviceCore.primaryControllers.length).toEqual(1);
    expect(deviceCore.secondaryControllers.length).toEqual(9);
    expect(deviceCore.actions.length).toEqual(9);
    expect(deviceCore.primaryActions.length).toEqual(7);
    expect(deviceCore.secondaryActions.length).toEqual(2);
  });

  it('bind device, with a empty layout IM', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return cloneDeep(emptyLayoutModel);
    });
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    expect(deviceCore.device).toEqual(baseDevice);
    expect(deviceCore.deviceSn).toEqual('a device id');
    expect(deviceCore.deviceName).toEqual('AC001');
    expect(deviceCore.firmwareVersion).toEqual('1.0.0');
    expect(deviceCore.macAddress).toEqual('AC123');
    expect(deviceCore.properties).toEqual({
      somePorperty: 'abc',
    });
    expect(deviceCore.status).toEqual({
      H00: 0,
    });
    expect(deviceCore.isConnected).toBeTruthy();
    expect(deviceCore.isUpdating).toBeFalsy();
    expect(deviceCore.isAvailable).toBeTruthy();
    expect(deviceCore.calendar).toEqual([
      {
        name: 'name test',
        start: '12:24',
        end: '13:24',
        days: [1, 2, 3, 4, 5, 6, 7],
        active: 1,
        active_until: 1477377969,
        esh: {
          H00: 1
        }
      },
    ]);
    expect(deviceCore.thumbnail).toBeUndefined();
    expect(deviceCore.banner).toBeUndefined();
    expect(deviceCore.informationModel).toEqual(emptyLayoutModel);
    expect(deviceCore.controllers.length).toEqual(0);
    expect(deviceCore.chartComponents.length).toEqual(0);
    expect(deviceCore.primaryControllers.length).toEqual(0);
    expect(deviceCore.secondaryControllers.length).toEqual(0);
    expect(deviceCore.actions.length).toEqual(0);
    expect(deviceCore.primaryActions.length).toEqual(0);
    expect(deviceCore.secondaryActions.length).toEqual(0);
  });

  it('bind device, with a no layout IM', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return cloneDeep(noComponentModel);
    });
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    expect(deviceCore.device).toEqual(baseDevice);
    expect(deviceCore.deviceSn).toEqual('a device id');
    expect(deviceCore.deviceName).toEqual('AC001');
    expect(deviceCore.firmwareVersion).toEqual('1.0.0');
    expect(deviceCore.macAddress).toEqual('AC123');
    expect(deviceCore.properties).toEqual({
      somePorperty: 'abc',
    });
    expect(deviceCore.status).toEqual({
      H00: 0,
    });
    expect(deviceCore.isConnected).toBeTruthy();
    expect(deviceCore.isUpdating).toBeFalsy();
    expect(deviceCore.isAvailable).toBeTruthy();
    expect(deviceCore.calendar).toEqual([
      {
        name: 'name test',
        start: '12:24',
        end: '13:24',
        days: [1, 2, 3, 4, 5, 6, 7],
        active: 1,
        active_until: 1477377969,
        esh: {
          H00: 1
        }
      },
    ]);
    expect(deviceCore.thumbnail).toBeUndefined();
    expect(deviceCore.banner).toBeUndefined();
    expect(deviceCore.informationModel).toEqual(noComponentModel);
    expect(deviceCore.controllers.length).toEqual(0);
    expect(deviceCore.chartComponents.length).toEqual(0);
    expect(deviceCore.primaryControllers.length).toEqual(0);
    expect(deviceCore.secondaryControllers.length).toEqual(0);
    expect(deviceCore.actions.length).toEqual(0);
    expect(deviceCore.primaryActions.length).toEqual(0);
    expect(deviceCore.secondaryActions.length).toEqual(0);
  });

  it('bind device, with a full content IM, bind again', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return cloneDeep(rasModel);
    });
    const testDevice = cloneDeep(baseDevice);
    testDevice.properties['displayName'] = 'test name';
    const deviceCore = dcInjector.bind(dcInjector.create(), testDevice);
    deviceCore.selfUpdate();
    const deviceCore2 = dcInjector.bind(deviceCore, testDevice);
    deviceCore2.selfUpdate();

    expect(deviceCore2.device).toEqual(testDevice);
    expect(deviceCore2.deviceSn).toEqual('a device id');
    expect(deviceCore2.deviceName).toEqual('test name');
    expect(deviceCore2.firmwareVersion).toEqual('1.0.0');
    expect(deviceCore2.macAddress).toEqual('AC123');
    expect(deviceCore2.properties).toEqual({
      somePorperty: 'abc',
      displayName: 'test name',
    });
    expect(deviceCore2.status).toEqual({
      H00: 0,
    });
    expect(deviceCore2.isConnected).toBeTruthy();
    expect(deviceCore2.isUpdating).toBeFalsy();
    expect(deviceCore2.isAvailable).toBeTruthy();
    expect(deviceCore2.calendar).toEqual([
      {
        name: 'name test',
        start: '12:24',
        end: '13:24',
        days: [1, 2, 3, 4, 5, 6, 7],
        active: 1,
        active_until: 1477377969,
        esh: {
          H00: 1
        }
      },
    ]);
    expect(deviceCore2.thumbnail).toEqual({ uri: 'thumbnailUrl' });
    expect(deviceCore2.banner).toEqual({ uri: 'bannerUrl' });
    expect(deviceCore2.informationModel).toEqual(rasModel);
    expect(deviceCore2.controllers.length).toEqual(10);
    expect(deviceCore2.chartComponents.length).toEqual(1);
    expect(deviceCore2.primaryControllers.length).toEqual(1);
    expect(deviceCore2.secondaryControllers.length).toEqual(9);
    expect(deviceCore2.actions.length).toEqual(9);
    expect(deviceCore2.primaryActions.length).toEqual(7);
    expect(deviceCore2.secondaryActions.length).toEqual(2);
  });

  it('request config', () => {
    const newModel = cloneDeep(rasModel);
    newModel['config'] = ['H00', 'H01'];
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return newModel;
    });

    const spy = spyOn(configSrv, 'requestConfig').and.callThrough();
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();
    expect(spy).toHaveBeenCalledWith('a device id', ['H00', 'H01']);
  });

  it('send event', () => {
    const spy = spyOn(ctrlSrv, 'setDevice').and.callThrough();
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    deviceCore.send({ key: 'H00', value: 0 });
    expect(spy).toHaveBeenCalledWith('a device id', { H00: 0 });
    deviceCore.send({ key: 'H01', value: 1 });
    expect(spy).toHaveBeenCalledWith('a device id', { H01: 1 });
    deviceCore.send({ key: 'H00', value: '123' });
    expect(spy).toHaveBeenCalledWith('a device id', { H00: 123 });
  });

  it('send event - illegal values', () => {
    const spy = spyOn(ctrlSrv, 'setDevice').and.callThrough();
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    deviceCore.send({ key: '', value: 1 });
    expect(spy).not.toHaveBeenCalled();
    deviceCore.send({ key: 'HW0', value: 1 });
    expect(spy).not.toHaveBeenCalled();
    deviceCore.send({ key: 'H00', value: 'A123' });
    expect(spy).not.toHaveBeenCalled();
    deviceCore.send({ key: 'H00', value: undefined });
    expect(spy).not.toHaveBeenCalled();
    deviceCore.send(null);
    expect(spy).not.toHaveBeenCalled();
  });

  it('send commands', () => {
    const spy = spyOn(ctrlSrv, 'setDevice').and.callThrough();
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    deviceCore.sendCommands({ H00: 1 });
    expect(spy).toHaveBeenCalledWith('a device id', { H00: 1 });
    deviceCore.sendCommands({ H00: 1, H01: 123 });
    expect(spy).toHaveBeenCalledWith('a device id', { H00: 1, H01: 123 });
  });

  it('send commands - illegal values', () => {
    const spy = spyOn(ctrlSrv, 'setDevice').and.callThrough();
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    deviceCore.sendCommands({ '': 1 });
    expect(spy).not.toHaveBeenCalled();
    deviceCore.sendCommands({ HW0: 1 });
    expect(spy).not.toHaveBeenCalled();
    deviceCore.sendCommands({});
    expect(spy).not.toHaveBeenCalled();
    deviceCore.sendCommands(null);
    expect(spy).not.toHaveBeenCalled();
  });

  it('filter commands', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return cloneDeep(rasModel);
    });
    const spy = spyOn(ctrlSrv, 'filter').and.callThrough();
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    deviceCore.filterActions({ H00: 0, H01: 2 });
    expect(spy).toHaveBeenCalledWith({ H00: 0, H01: 2 }, deviceCore.actions, undefined);
  });

  it('test isOwner', () => {
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    expect(deviceCore.isOwner('notOwner@email.com')).toBeFalsy();
    expect(deviceCore.isOwner('testing@exosite.com')).toBeTruthy();
  });

  it('test check status', () => {
    spyOn(ctrlSrv, 'isAvailable').and.returnValue(false);
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    const testDevice = cloneDeep(baseDevice);
    testDevice.status.H00 = 1;
    const deviceCore2 = dcInjector.bind(deviceCore, testDevice);

    expect(deviceCore2.status).toEqual(deviceCore.status);
    expect(deviceCore2.status.H00).toEqual(0);
  });

  it('test no network - isConnected should be falsy', () => {
    const deviceCore = dcInjector.bind(dcInjector.create(), baseDevice);
    deviceCore.selfUpdate();

    expect(deviceCore.isConnected).toBeTruthy();

    spyOn(appEngine, 'hasCloudConnection').and.returnValue(false);
    deviceCore.selfUpdate();

    expect(deviceCore.isConnected).toBeFalsy();
  });

});
