import { Component } from '@angular/core';
import { AppEngine, AppTasks, StateStore } from 'app-engine';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, ViewController, NavController, NavParams, Platform } from 'ionic-angular';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { Storage } from '@ionic/storage';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { ViewControllerMock, NavControllerMock, StorageMock } from 'ionic-mocks';
import cloneDeep from 'lodash/cloneDeep';

import { AppEngineMock } from '../../mocks/app-engine.mocks';
import { createTranslateLoader, DeviceConfigServiceMock, DeviceControlServiceMock } from '../../mocks/providers.mocks';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { InformationModelModule } from '../../modules/information-model';
import { ThemeService } from '../../providers/theme-service';

import { baseAccount, baseGroup } from '../../mocks/testing-items.mocks';
import { HomePageBase } from './home-page-base';

@Component({
  selector: 'testing-home-page',
  template: ''
})
export class TestingHomePage extends HomePageBase {

  constructor(
    navCtrl: NavController,
    platform: Platform,
    stateStore: StateStore,
    translate: TranslateService,
    storage: Storage,
    themeService: ThemeService,
  ) {
    super(navCtrl, platform, stateStore, translate, storage, themeService);
  }

}

const deviceDisplayList = ['a device id', 'a device id 3'];
const testGroup2 = cloneDeep(baseGroup);
testGroup2.name = 'a group name 2';
testGroup2.devices = undefined;
const groups = {
  'a group name': cloneDeep(baseGroup),
  'a group name 2': testGroup2,
  'a group name 3': {
    name: 'a group name 3',
    devices: ['a device id 3'],
    properties: {
      displayName: 'foo'
    }
  }
};
const groupDisplayList = ['a group name', 'a group name 2', 'a group name 3'];
const userData = {
  groupDisplayOrder: ['a group name 2', 'a group name 3', 'a group name']
};

describe('home page base', () => {
  let component: TestingHomePage;
  let fixture: ComponentFixture<TestingHomePage>;
  let viewCtrl;
  let navCtrl;
  let storage;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    navCtrl = NavControllerMock.instance();
    storage = StorageMock.instance();
    const themeService = jasmine.createSpyObj('ThemeService', ['logoUrl']);
    themeService.logoUrl = '';

    TestBed.configureTestingModule({
      declarations: [
        TestingHomePage,
      ],
      imports: [
        IonicModule.forRoot(TestingHomePage),
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
        { provide: NavController, useFactory: () => navCtrl },
        { provide: NavParams, useValue: new NavParams({ deviceSn: "a device id" }) },
        { provide: Storage, useFactory: () => storage },
        { provide: ThemeService, useFactory: () => themeService },
        { provide: ViewController, useFactory: () => viewCtrl },
        AppTasks,
        StateStore,
      ]
    });

    fixture = TestBed.createComponent(TestingHomePage);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof TestingHomePage).toBeTruthy();
  });

  it('test component life cycle', fakeAsync(() => {
    const accountStub = MockNgRedux.getSelectorStub(['core', 'account']);
    const deviceDisplayListStub = MockNgRedux.getSelectorStub(['core', 'deviceDisplayList']);
    const groupsStub = MockNgRedux.getSelectorStub(['core', 'groups']);
    const groupDisplayListStub = MockNgRedux.getSelectorStub(['core', 'groupDisplayList']);
    const userDataStub = MockNgRedux.getSelectorStub(['core', 'userData']);

    accountStub.next(cloneDeep(baseAccount));
    deviceDisplayListStub.next(cloneDeep(deviceDisplayList));
    groupsStub.next(cloneDeep(groups));
    groupDisplayListStub.next(cloneDeep(groupDisplayList));
    userDataStub.next(cloneDeep(userData));

    component.ionViewDidEnter();
    expect(component.isLoggedIn).toBeTruthy();

    const testAccount2 = cloneDeep(baseAccount);
    testAccount2.isLoggedIn = false;
    accountStub.next(testAccount2);
    tick(100);
    accountStub.next(cloneDeep(baseAccount));
    expect(component.ready).toBeFalsy();

    userDataStub.next({ groupDisplayOrder: undefined });
    groupDisplayListStub.next([]);
    tick(500);
    expect(component.myDevicesGroup.devices).toEqual(['a device id', 'a device id 3']);

    component.ionViewWillLeave();
  }));

  it('test platform is iOS or not', () => {
    expect(component.isIOS()).toBeFalsy();
  });

  it('open pages', () => {
    component.goGroupDetail(cloneDeep(baseGroup));
    expect(navCtrl.push).toHaveBeenCalledWith('GroupDetailPage', { groupId: 'a group name' });
  });

  it('test tab selected', () => {
    component.groupsList = [cloneDeep(testGroup2), cloneDeep(baseGroup)];
    const tab = { index: 1 };
    component.tabSelected(tab);

    expect(component.selectedGroup).toEqual({
      name: 'a group name 2',
      devices: undefined,
      properties: {
        bla: 'blub'
      }
    });
  });
});
