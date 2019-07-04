import {
  TestBed,
  getTestBed,
  ComponentFixture,
  fakeAsync,
  tick
} from "@angular/core/testing";
import {
  MockNgRedux,
  NgReduxTestingModule
} from "@angular-redux/store/testing";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import {
  IonicModule,
  ViewController,
  NavController,
  NavParams
} from "ionic-angular";
import { AppEngine, AppTasks, StateStore } from "app-engine";
import { ViewControllerMock } from "ionic-mocks";
import { File } from "@ionic-native/file";
import { FileMock } from "@ionic-native-mocks/file";
import cloneDeep from "lodash/cloneDeep";

import { ExtraPageSpaceComponent } from "../../components/extra-page-space/extra-page-space";
import { DeviceConfigService } from "../../providers/device-config-service";
import { DeviceControlService } from "../../providers/device-control-service";
import { GroupDetailPage } from "./group-detail";
import { PopupService } from "../../providers/popup-service";
import { AppEngineMock } from "../../mocks/app-engine.mocks";
import { InformationModelModule } from "../../modules/information-model";
import {
  createTranslateLoader,
  DeviceConfigServiceMock,
  DeviceControlServiceMock,
  PopupServiceMock
} from "../../mocks/providers.mocks";
import { GroupCoreInjector } from "../../item-models/group/group-core-injector";
import { baseDevice, baseGroup } from "../../mocks/testing-items.mocks";
import { rasModel } from "../../mocks/information-model.mocks";

describe("Page - group detail", () => {
  let component: GroupDetailPage;
  let fixture: ComponentFixture<GroupDetailPage>;
  let navParmas: NavParams;
  let groupDetail;
  let viewCtrl;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [ExtraPageSpaceComponent, GroupDetailPage],
      imports: [
        IonicModule.forRoot(GroupDetailPage),
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
        AppTasks,
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        {
          provide: DeviceControlService,
          useClass: DeviceControlServiceMock
        },
        StateStore,
        { provide: ViewController, useFactory: () => viewCtrl },
        { provide: NavParams, useValue: new NavParams({ groupId: "foo" }) },
        GroupCoreInjector
      ]
    });

    fixture = TestBed.createComponent(GroupDetailPage);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it("should create", () => {
    expect(component).toBeDefined();
    expect(component instanceof GroupDetailPage).toBeTruthy();
  });

  it("test component life cycle with there has only one device in a group", fakeAsync(() => {
    const devicesStub = MockNgRedux.getSelectorStub(["core", "devices"]);
    const groupsStub = MockNgRedux.getSelectorStub(["core", "groups"]);

    expect(component.groupId).toEqual("foo");

    component.ionViewWillEnter();
    component.reload(null);

    const testDevice2 = cloneDeep(baseDevice);
    devicesStub.next({
      'a device id 2': testDevice2,
    });
    groupsStub.next({
      "foo": {
        name: 'foo',
        devices: ['foo'],
        properties: {
          bla: 'Foo'
        }
      }
    });
    tick(500);

    expect(component.groupCore.groupId).toEqual("foo");
    expect(viewCtrl.dismiss).toHaveBeenCalled();

    component.ionViewDidLeave();
  }));

  it("test component life cycle with there has at least two devices in a group", fakeAsync(() => {
    const devicesStub = MockNgRedux.getSelectorStub(["core", "devices"]);
    const groupsStub = MockNgRedux.getSelectorStub(["core", "groups"]);

    expect(component.groupId).toEqual("foo");

    component.ionViewWillEnter();
    component.reload(null);

    const testDevice2 = cloneDeep(baseDevice);
    devicesStub.next({
      'a device id 2': testDevice2,
    });
    groupsStub.next({
      "foo": {
        name: 'foo',
        devices: ['foo', 'bar'],
        properties: {
          bla: 'Foo'
        }
      },
    });
    tick(500);

    expect(component.groupCore.groupId).toEqual("foo");
    expect(viewCtrl.dismiss).not.toHaveBeenCalled();

    component.ionViewDidLeave();
  }));

  it("test component life cycle with no group", fakeAsync(() => {
    const devicesStub = MockNgRedux.getSelectorStub(["core", "devices"]);
    const groupsStub = MockNgRedux.getSelectorStub(["core", "groups"]);

    expect(component.groupId).toEqual("foo");

    component.ionViewWillEnter();
    component.reload(null);

    const testDevice2 = cloneDeep(baseDevice);
    devicesStub.next({
      'a device id 2': testDevice2,
    });
    groupsStub.next({});
    tick(500);

    expect(component.groupCore.groupId).toEqual(undefined);
    expect(viewCtrl.dismiss).toHaveBeenCalled();

    component.ionViewDidLeave();
  }));
});

describe("Page - device detail, open it with group id is __my_devices_group__", () => {
  let component: GroupDetailPage;
  let fixture: ComponentFixture<GroupDetailPage>;
  let navParmas: NavParams;
  let groupDetail;
  let viewCtrl;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [ExtraPageSpaceComponent, GroupDetailPage],
      imports: [
        IonicModule.forRoot(GroupDetailPage),
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
        AppTasks,
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        {
          provide: DeviceControlService,
          useClass: DeviceControlServiceMock
        },
        StateStore,
        { provide: ViewController, useFactory: () => viewCtrl },
        { provide: NavParams, useValue: new NavParams({ groupId: '__my_devices_group__' }) },
        GroupCoreInjector
      ]
    });

    fixture = TestBed.createComponent(GroupDetailPage);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it("should create", () => {
    expect(component).toBeDefined();
    expect(component instanceof GroupDetailPage).toBeTruthy();
  });

  it("test component life cycle with group id is __my_devices_group__ and devices is undefined", fakeAsync(() => {
    const devicesStub = MockNgRedux.getSelectorStub(["core", "devices"]);
    const groupsStub = MockNgRedux.getSelectorStub(["core", "groups"]);

    expect(component.groupId).toEqual("__my_devices_group__");

    component.ionViewWillEnter();
    component.reload(null);

    devicesStub.next(undefined);
    groupsStub.next({
      "foo": {
        name: 'foo',
        devices: ['foo'],
        properties: {
          bla: 'Foo'
        }
      }
    });
    tick(500);

    expect(component.groupCore.groupId).toEqual("__my_devices_group__");
    expect(viewCtrl.dismiss).toHaveBeenCalled();

    component.ionViewDidLeave();
  }));

  it("test component life cycle with group id is __my_devices_group__ and have devices", fakeAsync(() => {
    const devicesStub = MockNgRedux.getSelectorStub(["core", "devices"]);
    const groupsStub = MockNgRedux.getSelectorStub(["core", "groups"]);

    expect(component.groupId).toEqual("__my_devices_group__");

    component.ionViewWillEnter();
    component.reload(null);

    const testDevice2 = cloneDeep(baseDevice);
    devicesStub.next({
      'a device id 2': testDevice2,
    });
    groupsStub.next({
      "foo": {
        name: 'foo',
        devices: ['foo'],
        properties: {
          bla: 'Foo'
        }
      }
    });
    tick(500);

    expect(component.groupCore.groupId).toEqual("__my_devices_group__");
    expect(viewCtrl.dismiss).toHaveBeenCalled();

    component.ionViewDidLeave();
  }));
});

describe("Page - device detail, open it with no value", () => {
  let component: GroupDetailPage;
  let fixture: ComponentFixture<GroupDetailPage>;
  let navParmas: NavParams;
  let groupDetail;
  let viewCtrl;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [ExtraPageSpaceComponent, GroupDetailPage],
      imports: [
        IonicModule.forRoot(GroupDetailPage),
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
        AppTasks,
        { provide: File, useClass: FileMock },
        { provide: PopupService, useClass: PopupServiceMock },
        { provide: DeviceConfigService, useClass: DeviceConfigServiceMock },
        {
          provide: DeviceControlService,
          useClass: DeviceControlServiceMock
        },
        StateStore,
        { provide: ViewController, useFactory: () => viewCtrl },
        { provide: NavParams, useValue: new NavParams({ groupId: null }) },
        GroupCoreInjector
      ]
    });

    fixture = TestBed.createComponent(GroupDetailPage);
    component = fixture.componentInstance;
  });

  afterEach(() => MockNgRedux.reset());

  it("should create", () => {
    expect(component).toBeDefined();
    expect(component instanceof GroupDetailPage).toBeTruthy();
  });

  it("test component with no value", fakeAsync(() => {
    expect(component.groupId).toBeFalsy();
  }));
});
