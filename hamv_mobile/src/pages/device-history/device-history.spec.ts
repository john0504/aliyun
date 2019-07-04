import { AppEngine, AppTasks, StateStore } from 'app-engine';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, NavParams, ViewController } from "ionic-angular";
import { MockComponent } from 'ng-mocks';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { TestBed, getTestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ViewControllerMock } from 'ionic-mocks';
import cloneDeep from 'lodash/cloneDeep';

import { AppEngineMock } from '../../mocks/app-engine.mocks';
import { baseDevice } from '../../mocks/testing-items.mocks';
import { createTranslateLoader, DeviceConfigServiceMock, DeviceControlServiceMock, PopupServiceMock } from '../../mocks/providers.mocks';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import { DeviceHistoryPage } from './device-history';
import { ExtraPageSpaceComponent } from '../../components/extra-page-space/extra-page-space';
import { ScrollableTabs } from '../../components/scrollable-tabs/scrollable-tabs';
import { InformationModelModule, InformationModelService } from '../../modules/information-model';
import { PopupService } from '../../providers/popup-service';
import { rasModel } from '../../mocks/information-model.mocks';

describe('Page - device history', () => {

  let component: DeviceHistoryPage;
  let fixture: ComponentFixture<DeviceHistoryPage>;
  let ims: InformationModelService;
  let viewCtrl;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        DeviceHistoryPage,
        MockComponent(ExtraPageSpaceComponent),
        MockComponent(ScrollableTabs),
      ],
      imports: [
        IonicModule.forRoot(DeviceHistoryPage),
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
        { provide: AppEngine, useClass: AppEngineMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        { provide: File, useClass: FileMock },
        { provide: NavParams, useValue: new NavParams({ deviceSn: 'a device id', }) },
        { provide: PopupService, useClass: PopupServiceMock },
        { provide: ViewController, useFactory: () => viewCtrl },
        AppTasks,
        DeviceCoreInjector,
        StateStore,
      ],
    });

    fixture = TestBed.createComponent(DeviceHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof DeviceHistoryPage).toBeTruthy();
  });

  it('test component life cycle', fakeAsync(() => {
    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice2 = cloneDeep(baseDevice);
    testDevice2.device = 'a device id 2';
    devicesStub.next({
      'a device id 2': testDevice2,
    });

    spyOn(ims, 'getUIModel').and.callFake(device => {
      if (!device) return null;
      const model = cloneDeep(rasModel);
      model.chartLayout.main = ['EXAMPLE_LINE_CHART', 'EXAMPLE_BAR_CHART'];
      model.chartComponents['EXAMPLE_BAR_CHART'] = {
        type: 'bar-chart',
        title: 'Humidity',
        models: [],
        options: undefined,
      };
      return model;
    });

    expect(component.deviceSn).toEqual('a device id');
    component.ionViewWillEnter();

    expect(viewCtrl.dismiss).toHaveBeenCalled();

    component.ionViewDidLeave();
  }));

  it('test tab selected', () => {

    const tab2 = { index: 1 };
    component.tabSelected(tab2);

    expect(component.currentTab).toEqual(1);
  });
});
