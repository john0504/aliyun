import { AppEngine, AppTasks, StateStore } from 'app-engine';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, ViewController, NavController, NavParams } from 'ionic-angular';
import { MockComponent } from 'ng-mocks';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { Storage } from '@ionic/storage';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ViewControllerMock, NavControllerMock, StorageMock } from 'ionic-mocks';

import { AppEngineMock } from '../../../mocks/app-engine.mocks';
import { GrayButtonGroupControlComponent } from '../../../components/gray-button-group-control/gray-button-group-control';
import { createTranslateLoader, DeviceConfigServiceMock, DeviceControlServiceMock } from '../../../mocks/providers.mocks';
import { DeviceConfigService } from '../../../providers/device-config-service';
import { DeviceControlService } from '../../../providers/device-control-service';
import { GroupItemWrapperComponent } from '../../../components/group-item-wrapper/group-item-wrapper';
import { EmptyDevicesComponent } from '../../../components/empty-devices/empty-devices';
import { EmptyGroupDevicesComponent } from '../../../components/empty-group-devices/empty-group-devices';
import { InformationModelModule } from '../../../modules/information-model';
import { LargeListPage } from './large-list';
import { ScrollableTabs } from '../../../components/scrollable-tabs/scrollable-tabs';
import { ThemeService } from '../../../providers/theme-service';

describe('Page - medium list', () => {
  let component: LargeListPage;
  let fixture: ComponentFixture<LargeListPage>;

  beforeEach(() => {
    const themeService = jasmine.createSpyObj('ThemeService', ['logoUrl']);
    themeService.logoUrl = '';

    TestBed.configureTestingModule({
      declarations: [
        LargeListPage,
        MockComponent(GrayButtonGroupControlComponent),
        MockComponent(GroupItemWrapperComponent),
        MockComponent(EmptyDevicesComponent),
        MockComponent(EmptyGroupDevicesComponent),
        MockComponent(ScrollableTabs),
      ],
      imports: [
        IonicModule.forRoot(LargeListPage),
        InformationModelModule.forRoot(),
        NgReduxTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: AppEngine, useClass: AppEngineMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        { provide: File, useClass: FileMock },
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: NavParams, useValue: new NavParams({ deviceSn: "a device id" }) },
        { provide: Storage, useFactory: () => StorageMock.instance() },
        { provide: ThemeService, useFactory: () => themeService },
        { provide: ViewController, useFactory: () => ViewControllerMock.instance() },
        AppTasks,
        StateStore,
      ]
    });

    fixture = TestBed.createComponent(LargeListPage);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof LargeListPage).toBeTruthy();
  });
});
