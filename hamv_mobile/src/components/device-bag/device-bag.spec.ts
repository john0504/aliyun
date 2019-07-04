import {
  TestBed,
  ComponentFixture,
} from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import {
  MockNgRedux,
  NgReduxTestingModule,
} from '@angular-redux/store/testing';
import { StateStore } from 'app-engine';
import cloneDeep from 'lodash/cloneDeep';

import { DeviceBagComponent } from './device-bag';
import { baseDevice } from '../../mocks/testing-items.mocks';

describe('Component: device bag', () => {

  let component: DeviceBagComponent;
  let fixture: ComponentFixture<DeviceBagComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        DeviceBagComponent,
      ],
      imports: [
        IonicModule.forRoot(DeviceBagComponent),
        NgReduxTestingModule,
      ],
      providers: [
        StateStore
      ],
    });

    fixture = TestBed.createComponent(DeviceBagComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof DeviceBagComponent).toBeTruthy();
  });

  it('set device id', () => {
    component.deviceId = '';
    expect(component.deviceId).toBeFalsy();
    component.deviceId = 'a device id';
    expect(component.deviceId).toEqual('a device id');
  });

  it('subscribe devices then unsubscribe', () => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const expectedResult = cloneDeep(baseDevice);

    component.deviceId = 'a device id';
    expect(component.deviceId).toEqual('a device id');

    component.ngOnInit();

    devicesStub.next({});
    expect(component._device).toBeFalsy();

    devicesStub.next({
      'a device id': baseDevice,
    });
    expect(component._device).toEqual(expectedResult);

    component.ngOnDestroy();
  });
});