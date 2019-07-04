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
  NgReduxTestingModule,
  MockNgRedux
} from '@angular-redux/store/testing';
import { AlertController } from 'ionic-angular';
import {
  AppTasks,
  AppEngine,
  StateStore,
} from 'app-engine';
import cloneDeep from 'lodash/cloneDeep';

import { OtaUpdatePopup } from './ota-update-popup';
import { createTranslateLoader } from '../mocks/providers.mocks';
import { AppEngineMock } from '../mocks/app-engine.mocks';
import {
  baseAccount,
  baseDevice,
  baseFirmwareList,
} from '../mocks/testing-items.mocks';
import {
  AlertControllerMock,
  AlertMock,
} from '../mocks/ionic-module.mocks';

describe('Check ota update popup service', () => {

  let instance: OtaUpdatePopup;
  let appTasks: AppTasks;
  let alertMock;

  beforeEach(() => {
    alertMock = AlertMock.instance();
    TestBed.configureTestingModule({
      imports: [
        NgReduxTestingModule,
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
        { provide: AlertController, useFactory: () => AlertControllerMock.instance(alertMock) },
        StateStore,
        OtaUpdatePopup,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(OtaUpdatePopup);
    appTasks = injector.get(AppTasks);
  });

  afterEach(() => MockNgRedux.reset());

  it('show ota popup - should show ota popup and simulate clicking \'ok\' button', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'MHV-100';
    devicesStub.next({
      'a device id': testDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve(baseFirmwareList));

    return instance.showOTAPopup()
      .then(() => alertMock.triggerButtonHandler(1));
  });

  it('show ota popup - no firmware list from cloud', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    devicesStub.next({
      'a device id': baseDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve([]));

    return instance.showOTAPopup();
  });

  it('show ota popup - device already up to date', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'MHV-100';
    devicesStub.next({
      'a device id': testDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve([
      {
        name: 'MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
        previousVersion: '0.8.0',
        sha1: '5dfe30c9a409d59b4893014569e4941895e201e0',
        model: 'MHV-100',
        size: 302364,
        url: 'https://smarthome.apps.exosite.io/fw/content/MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
        version: '0.9.0'
      },
      {
        name: 'MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
        previousVersion: '0.9.0',
        sha1: '5dfe30c9a409d59b4893014569e4941895e201e0',
        model: 'MHV-100',
        size: 302364,
        url: 'https://smarthome.apps.exosite.io/fw/content/MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
        version: '1.0.0'
      },
    ]));

    return instance.showOTAPopup();
  });

  it('show ota popup - firmware list from cloud contains \'non-semver\' version', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'MHV-100';
    devicesStub.next({
      'a device id': testDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve([{
      name: 'MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
      previousVersion: '0.9.0',
      sha1: '5dfe30c9a409d59b4893014569e4941895e201e0',
      model: 'MHV-100',
      size: 302364,
      url: 'https://smarthome.apps.exosite.io/fw/content/MC4wLjF8MC4wLjJ8NWRmZTMwYzlhNDA5ZDU5YjQ4OTMwMTQ1NjllNDk0MTg5NWUyMDFlMA',
      version: 'unknown version'
    }]));

    return instance.showOTAPopup();
  });

  it('show ota popup - device firmware version is not a \'semver\' version', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'MHV-100';
    testDevice.profile.module.firmwareVersion = 'unknown version';
    devicesStub.next({
      'a device id': testDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve(baseFirmwareList));

    return instance.showOTAPopup();
  });

  it('show ota popup - device is offline', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'MHV-100';
    testDevice.profile.module.firmwareVersion = 'unknown version';
    testDevice.connected = 0;
    devicesStub.next({
      'a device id': testDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve(baseFirmwareList));

    return instance.showOTAPopup();
  });

  it('show ota popup - no devices', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve(baseFirmwareList));

    return instance.showOTAPopup();
  });

  it('show ota popup - not device\'s owner', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'MHV-100';
    testDevice.users = [
      { email: 'testing@exosite.com', role: 'guest' },
    ];
    devicesStub.next({
      'a device id': testDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve(baseFirmwareList));

    return instance.showOTAPopup();
  });

  it('should show ota popup and simulate clicking \'cancel\' button then clicking \'no thanks\' button', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'MHV-100';
    devicesStub.next({
      'a device id': testDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve(baseFirmwareList));

    return instance.showOTAPopup()
      .then(() => alertMock.triggerButtonHandler(0))
      .then(() => alertMock.triggerButtonHandler(0));
  });

  it('should show ota popup and simulate clicking \'cancel\' button then clicking \'later\' button', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.profile.esh.model = 'MHV-100';
    devicesStub.next({
      'a device id': testDevice,
    });

    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    deviceDisplayListStub.next(['a device id']);

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    spyOn(appTasks, 'getFirmwareList').and.callFake(() => Promise.resolve(baseFirmwareList));

    return instance.showOTAPopup()
      .then(() => alertMock.triggerButtonHandler(0))
      .then(() => alertMock.triggerButtonHandler(1))
      .then(() => instance.showOTAPopup());
  });

});