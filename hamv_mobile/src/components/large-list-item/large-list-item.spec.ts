
import { HttpClientModule } from '@angular/common/http';
import { fakeAsync, TestBed, ComponentFixture, getTestBed, tick } from '@angular/core/testing';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { AppEngine, StateStore } from 'app-engine';
import { IonicModule, NavController, NavParams, ViewController } from 'ionic-angular';
import { NavControllerMock, ViewControllerMock } from 'ionic-mocks';
import cloneDeep from 'lodash/cloneDeep';

import { AppEngineMock } from '../../mocks/app-engine.mocks';
import { baseDevice } from '../../mocks/testing-items.mocks';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceConfigServiceMock, DeviceControlServiceMock } from '../../mocks/providers.mocks';
import { DeviceControlService } from '../../providers/device-control-service';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import { InformationModelModule, InformationModelService } from '../../modules/information-model';
import { LargeListItemComponent } from './large-list-item';
import { rasModel } from '../../mocks/information-model.mocks';
import { ImageCacheModule } from '../../modules/image-cache';

describe('Component: medium list item component', () => {
  let component: LargeListItemComponent;
  let fixture: ComponentFixture<LargeListItemComponent>;
  let ims: InformationModelService;
  let navCtrl;
  let viewCtrl;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    viewCtrl = ViewControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        LargeListItemComponent,
      ],
      imports: [
        IonicModule.forRoot(LargeListItemComponent),
        ImageCacheModule.forRoot(),
        InformationModelModule.forRoot(),
        HttpClientModule,
        NgReduxTestingModule,
      ],
      providers: [
        { provide: AppEngine, useClass: AppEngineMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        { provide: File, useClass: FileMock },
        { provide: NavController, useFactory: () => navCtrl },
        { provide: NavParams, useValue: new NavParams({ deviceSn: 'a device id', }) },
        { provide: ViewController, useFactory: () => viewCtrl },
        DeviceCoreInjector,
        StateStore,
      ]
    });

    fixture = TestBed.createComponent(LargeListItemComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof LargeListItemComponent).toBeTruthy();
  });

  it('test component life cycle with valid device', fakeAsync(() => {
    component.deviceSn = 'a device id';
    expect(component.deviceSn).toEqual('a device id');

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.device = 'a device id 2';
    devicesStub.next({
      'a device id': cloneDeep(baseDevice),
      'a device id 2': testDevice2,
    });

    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      const model = cloneDeep(rasModel);
      model['config'] = ['H00', 'H01'];
      return model;
    });

    component.ngOnInit();
    expect(component.deviceCore.deviceSn).toEqual('a device id');
    expect(component.deviceCore.deviceName).toEqual('AC001');
    component.reload(null);
    component.ngOnDestroy();

    component.deviceSn = '';
    expect(component.deviceSn).toBeFalsy();
  }));

  it('test component life cycle with invalid device', fakeAsync(() => {
    component.deviceSn = 'a device id';
    expect(component.deviceSn).toEqual('a device id');

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.device = 'a device id 2';

    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      const model = cloneDeep(rasModel);
      model['config'] = ['H00', 'H01'];
      return model;
    });

    component.ngOnInit();
    component.reload(null);

    devicesStub.next({
      'a device id 2': testDevice2,
    });
    tick(500);
    expect(component.deviceCore.deviceName).toBeUndefined();

    component.ngOnDestroy();

    component.deviceSn = '';
    expect(component.deviceSn).toBeFalsy();
  }));

  it('open pages', () => {
    component.deviceSn = 'a device id';
    expect(component.deviceSn).toEqual('a device id');

    component.goDeviceDetailPage();
    expect(navCtrl.push).toHaveBeenCalledWith('DeviceDetailPage', { deviceSn: 'a device id' });
  });
});

describe('Component: medium list item, open it with no value', () => {
  let component: LargeListItemComponent;
  let fixture: ComponentFixture<LargeListItemComponent>;
  let ims: InformationModelService;
  let navCtrl;
  let viewCtrl;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    navCtrl = NavControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        LargeListItemComponent,
      ],
      imports: [
        HttpClientModule,
        ImageCacheModule.forRoot(),
        InformationModelModule.forRoot(),
        IonicModule.forRoot(LargeListItemComponent),
        NgReduxTestingModule,
      ],
      providers: [
        { provide: AppEngine, useClass: AppEngineMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        { provide: File, useClass: FileMock },
        { provide: NavController, useFactory: () => navCtrl },
        { provide: NavParams, useValue: new NavParams({ deviceSn: null, }) },
        { provide: ViewController, useFactory: () => viewCtrl },
        DeviceCoreInjector,
        StateStore,
      ],
    });

    fixture = TestBed.createComponent(LargeListItemComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof LargeListItemComponent).toBeTruthy();
  });

  it('test component with no value', fakeAsync(() => {
    component.ngOnInit();
    tick(100);

    expect(component.deviceSn).toBeFalsy();
    expect(component.deviceCore.deviceName).toBeFalsy();
  }));
});
