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
import { PopupService } from './popup-service';
import { StateStore } from 'app-engine';
import cloneDeep from 'lodash/cloneDeep';
import { OtaUpdateResult } from './ota-update-result';

import {
  createTranslateLoader,
  PopupServiceMock,
} from '../mocks/providers.mocks';
import { AppEngineMock } from '../mocks/app-engine.mocks';
import {
  baseAccount,
  baseDevice,
} from '../mocks/testing-items.mocks';
import { delayPromise } from '../mocks/utils.mocks';

describe('Check ota update result', () => {

  let instance: OtaUpdateResult;
  let popupService: PopupService;

  beforeEach(() => {
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
        { provide: PopupService, useClass: PopupServiceMock },
        StateStore,
        OtaUpdateResult,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(OtaUpdateResult);
    popupService = injector.get(PopupService);
  });

  afterEach(() => MockNgRedux.reset());

  it('check there is a device updated firmware success', () => {
    const spy = spyOn(popupService, 'makeToast').and.callThrough();

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.deviceState = 'updating';
    testDevice.profile.module.firmwareVersion = '1.0.0';
    devicesStub.next({
      'a device id': testDevice,
    });

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    const authStub = MockNgRedux.getSelectorStub(['core', 'isAuthenticated']);
    authStub.next(true);

    instance.start();

    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.deviceState = 'idle';
    testDevice2.profile.module.firmwareVersion = '1.1.0';
    devicesStub.next({
      'a device id': testDevice2,
    });

    return delayPromise(5000)
      .then(() => expect(spy).toHaveBeenCalled())
      .then(() => authStub.next(false));
  }, 5200);

  it('check there is a device failed to update firmware', () => {
    const spy = spyOn(popupService, 'makeToast').and.callThrough();

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.deviceState = 'updating';
    testDevice.profile.module.firmwareVersion = '1.0.0';
    devicesStub.next({
      'a device id': testDevice,
    });

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    const authStub = MockNgRedux.getSelectorStub(['core', 'isAuthenticated']);
    authStub.next(true);

    instance.start();

    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.deviceState = 'idle';
    testDevice2.profile.module.firmwareVersion = '1.0.0';
    devicesStub.next({
      'a device id': testDevice2,
    });

    return delayPromise(5000)
      .then(() => expect(spy).toHaveBeenCalled());
  }, 5200);

  it('check there is a device updated firmware mess up', () => {
    const spy = spyOn(popupService, 'makeToast').and.callThrough();

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.deviceState = 'updating';
    testDevice.profile.module.firmwareVersion = '1.0.0';
    devicesStub.next({
      'a device id': testDevice,
    });

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    const authStub = MockNgRedux.getSelectorStub(['core', 'isAuthenticated']);
    authStub.next(true);

    instance.start();

    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.deviceState = 'idle';
    testDevice2.profile.module.firmwareVersion = 'broken_version';
    devicesStub.next({
      'a device id': testDevice2,
    });

    return delayPromise(5000)
      .then(() => expect(spy).toHaveBeenCalled());
  }, 5200);

  it('check there is a device updated firmware success, but not a owned device', () => {
    const spy = spyOn(popupService, 'makeToast').and.callThrough();

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.deviceState = 'updating';
    testDevice.profile.module.firmwareVersion = '1.0.0';
    testDevice.users = [
      { email: 'testing@exosite.com', role: 'guest' },
    ];
    devicesStub.next({
      'a device id': testDevice,
    });

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    const authStub = MockNgRedux.getSelectorStub(['core', 'isAuthenticated']);
    authStub.next(true);

    instance.start();

    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.deviceState = 'idle';
    testDevice2.profile.module.firmwareVersion = '1.1.0';
    testDevice2.users = [
      { email: 'testing@exosite.com', role: 'guest' },
    ];
    devicesStub.next({
      'a device id': testDevice2,
    });

    return delayPromise(5000)
      .then(() => expect(spy).not.toHaveBeenCalled());
  }, 5200);

  it('check when user auth broken in middle', () => {
    const spy = spyOn(popupService, 'makeToast').and.callThrough();

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice = cloneDeep(baseDevice);
    testDevice.deviceState = 'updating';
    testDevice.profile.module.firmwareVersion = '1.0.0';
    devicesStub.next({
      'a device id': testDevice,
    });

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(baseAccount);

    const authStub = MockNgRedux.getSelectorStub(['core', 'isAuthenticated']);
    authStub.next(true);

    instance.start();

    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.deviceState = 'idle';
    testDevice2.profile.module.firmwareVersion = '1.1.0';
    devicesStub.next({
      'a device id': testDevice2,
    });

    authStub.next(false);

    return delayPromise(5000)
      .then(() => expect(spy).not.toHaveBeenCalled());
  }, 5200);
});