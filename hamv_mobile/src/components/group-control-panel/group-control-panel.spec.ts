import { TranslateLoader } from '@ngx-translate/core';
import {
  TestBed,
  ComponentFixture,
  getTestBed,
} from '@angular/core/testing';
import {
  MockNgRedux,
  NgReduxTestingModule,
} from '@angular-redux/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  HttpClientModule,
  HttpClient,
} from '@angular/common/http';
import {
  IonicModule,
  ViewController,
  Platform,
} from 'ionic-angular';
import {
  StateStore,
  AppEngine,
  AppTasks,
} from 'app-engine';
import {
  ViewControllerMock,
  PlatformMock,
} from 'ionic-mocks';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { of } from 'rxjs/observable/of';
import cloneDeep from 'lodash/cloneDeep';

import {
  InformationModelModule,
  InformationModelService,
} from '../../modules/information-model';
import { DeviceControlService } from '../../providers/device-control-service';
import { ViewStateService } from '../../providers/view-state-service';
import { PopupService } from '../../providers/popup-service';

import { GroupControlPanelComponent } from './group-control-panel';
import {
  DeviceControlServiceMock,
  PopupServiceMock,
  createTranslateLoader,
} from '../../mocks/providers.mocks';
import { AppEngineMock } from '../../mocks/app-engine.mocks';
import {
  baseDevice,
  baseGroup,
} from '../../mocks/testing-items.mocks';
import {
  emptyLayoutModel,
  noComponentModel,
  radModel,
  rasModel,
} from '../../mocks/information-model.mocks';
import { empty } from 'rxjs/Observer';
import { GroupCoreInjector } from '../../item-models/group/group-core-injector';

describe('Component: group control panel component', () => {

  let component: GroupControlPanelComponent;
  let fixture: ComponentFixture<GroupControlPanelComponent>;
  let viewCtrl;
  let ims: InformationModelService;

  beforeEach(() => {
    viewCtrl = ViewControllerMock.instance();
    TestBed.configureTestingModule({
      declarations: [
        GroupControlPanelComponent,
      ],
      imports: [
        IonicModule.forRoot(GroupControlPanelComponent),
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
        { provide: DeviceControlService, useClass: DeviceControlServiceMock },
        StateStore,
        { provide: ViewController, useFactory: () => viewCtrl },
        GroupCoreInjector,
        ViewStateService,
      ]
    });

    fixture = TestBed.createComponent(GroupControlPanelComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();
    ims = injector.get(InformationModelService);
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof GroupControlPanelComponent).toBeTruthy();
  });

  it('Update UI', () => {
    viewCtrl.willEnter = of(true);
    viewCtrl.didLeave = of(true);
    spyOn(ims, 'getUIModelName').and.callFake(device => {
      if (device && device.device === 'a device id') {
        return 'Commercial';
      }
      return 'Business';
    });
    spyOn(ims, 'getUIModelFromName').and.callFake(name => {
      if (name === 'Commercial') {
        return rasModel;
      }
      return radModel;
    });

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice1 = cloneDeep(baseDevice);
    const testDevice2 = cloneDeep(baseDevice);

    component.ngOnInit();

    component.group = null;
    expect(component.group).toBeFalsy();

    testDevice2.device = 'a device id 2';
    devicesStub.next({
      'a device id': testDevice1,
      'a device id 2': testDevice2,
    });

    const testGroup1 = cloneDeep(baseGroup);
    testGroup1.devices.push('a device id 2');
    component.group = testGroup1;
    const expectedResult = cloneDeep(testGroup1);
    expect(component.group).toEqual(expectedResult);

    // forced reload
    component.reload(null);
  });

  it('Update UI - no same control item case', () => {
    viewCtrl.willEnter = of(true);
    viewCtrl.didLeave = of(true);
    spyOn(ims, 'getUIModelName').and.callFake(device => {
      if (device && device.device === 'a device id') {
        return 'Commercial';
      }
      return 'Empty';
    });
    spyOn(ims, 'getUIModelFromName').and.callFake(name => {
      if (name === 'Commercial') {
        return radModel;
      }
      return emptyLayoutModel;
    });

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice1 = cloneDeep(baseDevice);
    const testDevice2 = cloneDeep(baseDevice);

    component.ngOnInit();

    testDevice2.device = 'a device id 2';
    devicesStub.next({
      'a device id': testDevice1,
      'a device id 2': testDevice2,
    });
    const testGroup = cloneDeep(baseGroup);
    testGroup.devices.push('a device id 2');
    component.group = testGroup;
  });

  it('Update UI - no model', () => {
    viewCtrl.willEnter = of(true);
    viewCtrl.didLeave = of(true);
    spyOn(ims, 'getUIModelName').and.callFake(device => {
      return null;
    });
    spyOn(ims, 'getUIModelFromName').and.callFake(name => {
      return null;
    });

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice1 = cloneDeep(baseDevice);
    const testDevice2 = cloneDeep(baseDevice);

    const testGroup = cloneDeep(baseGroup);
    testGroup.devices.push('a device id 2');
    component.group = testGroup;

    component.ngOnInit();

    testDevice2.device = 'a device id 2';
    devicesStub.next({
      'a device id': testDevice1,
      'a device id 2': testDevice2,
    });
  });

  afterEach(() => MockNgRedux.reset());

  it('Update UI - no same control item case', () => {
    viewCtrl.willEnter = of(true);
    viewCtrl.didLeave = of(true);
    spyOn(ims, 'getUIModelName').and.callFake(device => {
      if (device && device.device === 'a device id') {
        return 'Commercial';
      }
      return 'Empty';
    });
    spyOn(ims, 'getUIModelFromName').and.callFake(name => {
      if (name === 'Commercial') {
        return rasModel;
      }
      return emptyLayoutModel;
    });

    const devicesStub = MockNgRedux.getSelectorStub(['core', 'devices']);
    const testDevice1 = cloneDeep(baseDevice);
    const testDevice2 = cloneDeep(baseDevice);

    const testGroup = cloneDeep(baseGroup);
    testGroup.devices.push('a device id 2');
    component.group = testGroup;

    component.ngOnInit();

    testDevice2.device = 'a device id 2';
    devicesStub.next({
      'a device id': testDevice1,
      'a device id 2': testDevice2,
    });
  });

  it('expand UI', () => {
    component.expand = true;
    expect(component.expand).toBeTruthy();
    component.expand = false;
    expect(component.expand).toBeFalsy();
  });

  it('toggle controls', () => {
    component.toggleControls();
    expect(component.viewState.showControls).toBeTruthy();
    expect(component.viewState.showControlsIcon).toEqual('arrow-dropup-circle');
    component.toggleControls();
    expect(component.viewState.showControls).toBeFalsy();
    expect(component.viewState.showControlsIcon).toEqual('arrow-dropdown-circle');
  });

});
