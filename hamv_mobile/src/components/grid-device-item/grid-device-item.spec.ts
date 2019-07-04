
import { HttpClientModule } from '@angular/common/http';
import { fakeAsync, TestBed, ComponentFixture, getTestBed, tick } from '@angular/core/testing';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { AppEngine, StateStore } from 'app-engine';
import { IonicModule, NavController, NavParams, ViewController } from 'ionic-angular';
import { NavControllerMock, ViewControllerMock } from 'ionic-mocks';

import { AppEngineMock } from '../../mocks/app-engine.mocks';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceConfigServiceMock, DeviceControlServiceMock } from '../../mocks/providers.mocks';
import { DeviceControlService } from '../../providers/device-control-service';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import { InformationModelModule, InformationModelService } from '../../modules/information-model';
import { GridDeviceItemComponent } from './grid-device-item';
import { ImageCacheModule } from '../../modules/image-cache';

describe('Component: medium list item component', () => {
  let component: GridDeviceItemComponent;
  let fixture: ComponentFixture<GridDeviceItemComponent>;
  let ims: InformationModelService;
  let navCtrl;
  let viewCtrl;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    viewCtrl = ViewControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        GridDeviceItemComponent,
      ],
      imports: [
        IonicModule.forRoot(GridDeviceItemComponent),
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

    fixture = TestBed.createComponent(GridDeviceItemComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof GridDeviceItemComponent).toBeTruthy();
  });
});
