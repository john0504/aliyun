import { DeviceConfigService } from './device-config-service';
import { TestBed, getTestBed } from '@angular/core/testing';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { AppTasks, StateStore } from 'app-engine';

import { AppTasksMock } from '../mocks/app-engine.mocks';
import { baseDevice, baseAccount } from '../mocks/testing-items.mocks';
import cloneDeep from 'lodash/cloneDeep';

describe('Check device config service', () => {

  let instance: DeviceConfigService;
  let appTasks: AppTasks;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        NgReduxTestingModule,
      ],
      providers: [
        { provide: AppTasks, useClass: AppTasksMock },
        StateStore,
        DeviceConfigService,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(DeviceConfigService);
    appTasks = injector.get(AppTasks);
  });

  afterAll(() => {
    MockNgRedux.reset();
  });

  it('configure exist device with normal account', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next(baseAccount);
    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.requestConfig('a device id', ['H01', 'H02', 'H05']);
  });

  it('configure non-exsit device with normal account', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next(baseAccount);
    devicesStub.next({});

    instance.requestConfig('a device id', ['H01', 'H02', 'H05']);
  });

  it('configure device with illegal account', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next({});
    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.requestConfig('a device id', ['H01', 'H02', 'H05']);
  });

  it('configure device with the same configuration on device', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next(baseAccount);
    devicesStub.next({
      'a device id': baseDevice,
    });

    instance.requestConfig('a device id', [
      'H00', 'H01', 'H02', 'H03',
      'H04', 'H05', 'H0E', 'H0F',
      'H10', 'H11', 'H14', 'H17',
      'H20', 'H21', 'H28', 'H29'
    ]);
  });

  it('configure device which there are no properties on it', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next(baseAccount);
    const testDevice = cloneDeep(baseDevice);
    delete testDevice['properties'];
    devicesStub.next({
      'a device id': testDevice,
    });

    instance.requestConfig('a device id', [
      'H00', 'H01', 'H02', 'H03',
      'H04', 'H05', 'H0E', 'H0F',
      'H10', 'H11', 'H14', 'H17',
      'H20', 'H21', 'H28', 'H29'
    ]);
  });

  it('configure device which has been configured', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next(baseAccount);
    const testDevice = cloneDeep(baseDevice);
    testDevice.properties['deviceHasBeenConfigured'] = true;
    devicesStub.next({
      'a device id': testDevice,
    });

    instance.requestConfig('a device id', [
      'H00', 'H01', 'H02', 'H03',
      'H04', 'H05', 'H0E', 'H0F',
      'H10', 'H11', 'H14', 'H17',
      'H20', 'H21', 'H28', 'H29'
    ]);
  });

  it('configure device with error happened', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    spyOn(appTasks, 'requestConfigTask').and.returnValue(Promise.reject(new Error('forced error')));

    accountStub.next(baseAccount);
    devicesStub.next({
      'a device id': baseDevice,
    });

    return instance.requestConfig('a device id', [
      'H01', 'H02', 'H05'
    ])
      .catch(e => {
        expect(e).toBeDefined();
        expect(e.message).toEqual('forced error');
      });
  });
});