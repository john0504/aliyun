import {
  TestBed,
  getTestBed,
  ComponentFixture,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  MockNgRedux,
  NgReduxTestingModule,
} from '@angular-redux/store/testing';
import {
  TranslateModule,
  TranslateLoader,
} from '@ngx-translate/core';
import {
  HttpClientModule,
  HttpClient,
} from '@angular/common/http';
import {
  AlertController,
  ActionSheetController,
  IonicModule,
  ViewController,
  NavController,
  NavParams,
} from 'ionic-angular';
import {
  AppEngine,
  AppTasks,
  StateStore,
} from 'app-engine';
import {
  ViewControllerMock,
  NavControllerMock,
} from 'ionic-mocks';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { Network } from '@ionic-native/network';
import { NetworkMock } from '@ionic-native-mocks/network';
import cloneDeep from 'lodash/cloneDeep';

import { ImageCacheModule } from '../../modules/image-cache';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { DeviceDetailPage } from './device-detail';
import { PopupService } from '../../providers/popup-service';
import {
  InformationModelModule,
  InformationModelService,
} from '../../modules/information-model';
import { AppEngineMock } from '../../mocks/app-engine.mocks';
import {
  createTranslateLoader,
  DeviceConfigServiceMock,
  DeviceControlServiceMock,
  PopupServiceMock,
} from '../../mocks/providers.mocks';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import {
  baseAccount,
  baseDevice,
} from '../../mocks/testing-items.mocks';
import { rasModel } from '../../mocks/information-model.mocks';
import {
  AlertMock,
  AlertControllerMock,
  ActionSheetControllerMock,
  ActionSheetMock,
} from '../../mocks/ionic-module.mocks';

describe('Page - device detail', () => {

  let component: DeviceDetailPage;
  let fixture: ComponentFixture<DeviceDetailPage>;
  let navParmas: NavParams;
  let ims: InformationModelService;
  let alertMock;
  let alerCtrlMock;
  let actionSheetCtrl;
  let actionSheetMock;
  let viewCtrl;
  let navCtrl;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    navCtrl = NavControllerMock.instance();
    actionSheetMock = ActionSheetMock.instance();
    actionSheetCtrl = ActionSheetControllerMock.instance(actionSheetMock);
    alertMock = AlertMock.instance();
    alerCtrlMock = AlertControllerMock.instance(alertMock);
    TestBed.configureTestingModule({
      declarations: [
        DeviceDetailPage,
      ],
      imports: [
        IonicModule.forRoot(DeviceDetailPage),
        InformationModelModule.forRoot(),
        NgReduxTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
        ImageCacheModule.forRoot(),
      ],
      providers: [
        { provide: AppEngine, useClass: AppEngineMock },
        AppTasks,
        { provide: Network, useClass: NetworkMock },
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        StateStore,
        { provide: ActionSheetController, useFactory: () => actionSheetCtrl },
        { provide: AlertController, useFactory: () => alerCtrlMock },
        { provide: ViewController, useFactory: () => viewCtrl },
        { provide: NavController, useFactory: () => navCtrl },
        { provide: NavParams, useValue: new NavParams({ deviceSn: 'a device id', }) },
        DeviceCoreInjector,
      ],
    });

    fixture = TestBed.createComponent(DeviceDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof DeviceDetailPage).toBeTruthy();
  });

  it('test component life cycle', fakeAsync(() => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next(cloneDeep(baseAccount));

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

    expect(component.deviceSn).toEqual('a device id');
    component.ionViewDidLoad();
    component.ionViewWillEnter();
    expect(component.deviceCore.deviceSn).toEqual('a device id');
    expect(component.account).toEqual(cloneDeep(baseAccount));

    component.reload(null);

    devicesStub.next({
      'a device id 2': testDevice2,
    });
    tick(500);
    expect(viewCtrl.dismiss).toHaveBeenCalled();

    component.ionViewDidLeave();
  }));

  it('open pages', () => {
    expect(component.deviceSn).toEqual('a device id');
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    devicesStub.next({
      'a device id': cloneDeep(baseDevice),
    });
    component.ionViewWillEnter();

    component.openSettings();
    expect(navCtrl.push).toHaveBeenCalledWith('DeviceSettingsPage', { deviceSn: 'a device id' });

    component.openSharing();
    expect(navCtrl.push).toHaveBeenCalledWith('DeviceSharingPage', { deviceSn: 'a device id' });

    component.openSchedules();
    expect(navCtrl.push).toHaveBeenCalledWith('ScheduleListPage', { deviceSn: 'a device id' });

    component.ionViewDidLeave();
  });

  it('open action sheet - owner and with chart components', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return cloneDeep(rasModel);
    });
    expect(component.deviceSn).toEqual('a device id');
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next(cloneDeep(baseAccount));
    devicesStub.next({
      'a device id': cloneDeep(baseDevice),
    });
    component.ionViewDidLoad();
    component.ionViewWillEnter();

    component.presentActions();
    expect(actionSheetCtrl.create).toHaveBeenCalled();
    expect(actionSheetCtrl.create.calls.argsFor(0)[0].buttons.length).toEqual(5);

    expect(navCtrl.push).not.toHaveBeenCalled();
    const spySchedule = spyOn(component, 'openSchedules').and.callThrough();
    expect(spySchedule).not.toHaveBeenCalled();
    actionSheetMock.triggerButtonHandler(0);
    expect(spySchedule).toHaveBeenCalled();
    const spySettings = spyOn(component, 'openSettings').and.callThrough();
    expect(spySettings).not.toHaveBeenCalled();
    actionSheetMock.triggerButtonHandler(1);
    expect(spySettings).toHaveBeenCalled();
    const spySharing = spyOn(component, 'openSharing').and.callThrough();
    expect(spySharing).not.toHaveBeenCalled();
    actionSheetMock.triggerButtonHandler(2);
    expect(spySharing).toHaveBeenCalled();
    actionSheetMock.triggerButtonHandler(3);
    expect(navCtrl.push).toHaveBeenCalledWith('DeviceHistoryPage', { deviceSn: 'a device id' });

    component.ionViewDidLeave();
  });

  it('open action sheet - not owner and no chart components', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      const model = cloneDeep(rasModel);
      delete model['chartLayout'];
      delete model['chartComponents'];
      return model;
    });
    expect(component.deviceSn).toEqual('a device id');
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testAccount = cloneDeep(baseAccount);
    testAccount.account = 'abc@exosite.com';
    accountStub.next(testAccount);
    devicesStub.next({
      'a device id': cloneDeep(baseDevice),
    });
    component.ionViewDidLoad();
    component.ionViewWillEnter();

    component.presentActions();
    expect(actionSheetCtrl.create).toHaveBeenCalled();
    expect(actionSheetCtrl.create.calls.argsFor(0)[0].buttons.length).toEqual(3);
    expect(navCtrl.push).not.toHaveBeenCalled();
    const spySchedule = spyOn(component, 'openSchedules').and.callThrough();
    expect(spySchedule).not.toHaveBeenCalled();
    actionSheetMock.triggerButtonHandler(0);
    expect(spySchedule).toHaveBeenCalled();
    const spySettings = spyOn(component, 'openSettings').and.callThrough();
    expect(spySettings).not.toHaveBeenCalled();
    actionSheetMock.triggerButtonHandler(1);
    expect(spySettings).toHaveBeenCalled();
    const spySharing = spyOn(component, 'openSharing').and.callThrough();
    expect(spySharing).not.toHaveBeenCalled();

    component.ionViewDidLeave();
  });

  it('show info', fakeAsync(() => {
    expect(component.deviceSn).toEqual('a device id');
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    accountStub.next(baseAccount);

    component.ionViewDidLoad();
    component.ionViewWillEnter();

    component.showInfo();
    expect(alerCtrlMock.create).toHaveBeenCalledTimes(0);

    const testDevice = cloneDeep(baseDevice);
    testDevice.connected = 0;
    devicesStub.next({
      'a device id': testDevice,
    });
    component.showInfo();
    expect(alerCtrlMock.create).toHaveBeenCalledTimes(1);

    testDevice.connected = 1;
    devicesStub.next({
      'a device id': testDevice,
    });
    tick(500);
    component.showInfo();
    expect(alerCtrlMock.create).toHaveBeenCalledTimes(1);

    testDevice.deviceState = 'updating';
    devicesStub.next({
      'a device id': testDevice,
    });
    tick(500);
    component.showInfo();
    expect(alerCtrlMock.create).toHaveBeenCalledTimes(2);

    testDevice.deviceState = 'idle';
    devicesStub.next({
      'a device id': testDevice,
    });
    tick(500);
    component.showInfo();
    expect(alerCtrlMock.create).toHaveBeenCalledTimes(2);
  }));
});

describe('Page - device detail, open it with no value', () => {

  let component: DeviceDetailPage;
  let fixture: ComponentFixture<DeviceDetailPage>;
  let navParmas: NavParams;
  let ims: InformationModelService;
  let viewCtrl;
  let navCtrl;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    navCtrl = NavControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        DeviceDetailPage,
      ],
      imports: [
        IonicModule.forRoot(DeviceDetailPage),
        InformationModelModule.forRoot(),
        NgReduxTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
        ImageCacheModule.forRoot(),
      ],
      providers: [
        { provide: AppEngine, useClass: AppEngineMock },
        AppTasks,
        { provide: Network, useClass: NetworkMock },
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        StateStore,
        { provide: ViewController, useFactory: () => viewCtrl },
        { provide: NavController, useFactory: () => navCtrl },
        { provide: NavParams, useValue: new NavParams({ deviceSn: null, }) },
        DeviceCoreInjector,
      ],
    });

    fixture = TestBed.createComponent(DeviceDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof DeviceDetailPage).toBeTruthy();
  });

  it('test component with no value', fakeAsync(() => {
    component.ionViewWillEnter();
    tick(100);

    expect(component.deviceSn).toBeFalsy();
    expect(component.deviceCore.deviceSn).toBeFalsy();
    expect(component.account).toBeFalsy();

    component.ionViewDidLeave();
  }));
});
