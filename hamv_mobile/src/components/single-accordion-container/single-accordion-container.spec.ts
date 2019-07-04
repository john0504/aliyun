import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, ViewController, Platform, NavController, AlertController } from 'ionic-angular';
import { MockDirective } from 'ng-mocks';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { StateStore, AppEngine, AppTasks } from 'app-engine';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ViewControllerMock, PlatformMock, NavControllerMock } from 'ionic-mocks';
import cloneDeep from 'lodash/cloneDeep';

import { AlertControllerMock } from '../../mocks/ionic-module.mocks';
import { AppEngineMock } from '../../mocks/app-engine.mocks';
import { baseAccount, baseDevice } from '../../mocks/testing-items.mocks';
import { DeviceConfigService } from './../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { DeviceControlServiceMock, DeviceConfigServiceMock, PopupServiceMock, createTranslateLoader } from '../../mocks/providers.mocks';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import { GoDeviceHistoricalPageDirective } from './../../directives/go-device-historical-page/go-device-historical-page';
import { ImageCacheModule } from '../../modules/image-cache';
import { InformationModelModule, InformationModelService } from '../../modules/information-model';
import { PopupService } from '../../providers/popup-service';
import { rasModel } from '../../mocks/information-model.mocks';
import { SingleAccordionContainerComponent } from './single-accordion-container';
import { ViewStateService } from '../../providers/view-state-service';

describe('Component: single accordion container component', () => {

  let component: SingleAccordionContainerComponent;
  let fixture: ComponentFixture<SingleAccordionContainerComponent>;
  let ims: InformationModelService;
  let navCtrl;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        SingleAccordionContainerComponent,
        MockDirective(GoDeviceHistoricalPageDirective)
      ],
      imports: [
        IonicModule.forRoot(SingleAccordionContainerComponent),
        ImageCacheModule.forRoot(),
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
      ],
      providers: [
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        { provide: ViewController, useFactory: () => ViewControllerMock.instance() },
        { provide: NavController, useFactory: () => navCtrl },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        ViewStateService,
        StateStore,
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: AppEngine, useClass: AppEngineMock },
        AppTasks,
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        DeviceCoreInjector,
      ]
    });

    fixture = TestBed.createComponent(SingleAccordionContainerComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof SingleAccordionContainerComponent).toBeTruthy();
  });

  it('test component life cycle', () => {
    component.deviceSn = 'a device id';
    expect(component.deviceSn).toEqual('a device id');

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);

    accountStub.next(cloneDeep(baseAccount));

    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.device = 'a device id 2';
    devicesStub.next({
      'a device id': cloneDeep(baseDevice),
      'a device id 2': testDevice2,
    });

    fixture.detectChanges();
    component.start();
    expect(component._deviceSn).toEqual('a device id');

    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      const model = cloneDeep(rasModel);
      model['config'] = ['H00', 'H01'];
      return model;
    });

    component.reload(null);
    component.stop();
    component.deviceSn = '';
    expect(component.deviceSn).toBeFalsy();
  });

  it('update UI', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return rasModel;
    });

    component.deviceSn = 'a device id';

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(cloneDeep(baseAccount));

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice1 = cloneDeep(baseDevice);
    devicesStub.next({
      'a device id': testDevice1,
    });

    component.start();
    component.reload(null);
    component.stop();
  });

  it('toogle detail content', () => {
    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      return rasModel;
    });

    component.deviceSn = 'a device id';

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(cloneDeep(baseAccount));

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice1 = cloneDeep(baseDevice);
    devicesStub.next({
      'a device id': testDevice1,
    });

    component.start();
    expect(component.viewState).toBeDefined();
    expect(component.viewState.showDetails).toBeFalsy();
    component.toggleDetails();
    expect(component.viewState.showDetails).toBeTruthy();
    component.toggleDetails();
    expect(component.viewState.showDetails).toBeFalsy();
    component.stop();
  });

  it('show info', () => {
    component.showInfo();
  });

  it('open pages', () => {
    component.deviceSn = 'a device id';

    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(cloneDeep(baseAccount));

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    devicesStub.next({
      'a device id': cloneDeep(baseDevice),
    });

    component.start();

    component.openSettings();
    expect(navCtrl.push).toHaveBeenCalledWith('DeviceSettingsPage', { deviceSn: 'a device id' });
    component.openSharing();
    expect(navCtrl.push).toHaveBeenCalledWith('DeviceSharingPage', { deviceSn: 'a device id' });
    component.openSchedule();
    expect(navCtrl.push).toHaveBeenCalledWith('ScheduleListPage', { deviceSn: 'a device id' });

    component.stop();
  });

  it('test no device id', () => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    accountStub.next(cloneDeep(baseAccount));

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    devicesStub.next({
      'a device id': cloneDeep(baseDevice),
    });

    component.start();
    component.stop();
  });

});
