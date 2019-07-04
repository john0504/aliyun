import {
  TestBed,
  ComponentFixture,
} from '@angular/core/testing';
import {
  IonicModule,
  NavController,
} from 'ionic-angular';
import { NavControllerMock } from 'ionic-mocks';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';

import { ThemeService } from '../../providers/theme-service';

import { ListGroupItemComponent } from './list-group-item';
import { ExtraPageSpaceComponent } from '../extra-page-space/extra-page-space';
import { DeviceItemWrapperComponent } from '../device-item-wrapper/device-item-wrapper';

describe('Component: list group item', () => {
  let component: ListGroupItemComponent;
  let fixture: ComponentFixture<ListGroupItemComponent>;
  let navCtrl;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    const themeService = jasmine.createSpyObj('ThemeService', ['logoUrl']);
    themeService.logoUrl = '';
    TestBed.configureTestingModule({
      declarations: [
        ListGroupItemComponent,
        MockComponent(ExtraPageSpaceComponent),
        MockComponent(DeviceItemWrapperComponent)
      ],
      imports: [
        IonicModule.forRoot(ListGroupItemComponent),
        TranslateModule
      ],
      providers: [
        { provide: ThemeService, useFactory: () => themeService },
        { provide: NavController, useFactory: () => navCtrl }
      ]
    });

    fixture = TestBed.createComponent(ListGroupItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof ListGroupItemComponent).toBeTruthy();
  });

  it('set group as undefined', () => {
    component.group = undefined;
    expect(component.group).toBeUndefined();
    expect(component.devices).toEqual([]);
  });

  it('set group to a correct value', () => {
    component.group = {
      name: '__my_devices_group__',
      devices: ['deviceId_5', 'deviceId_2', 'deviceId_3', 'deviceId_1', 'deviceId_4'],
      properties: {
        displayName: 'MY_DEVICES.ALL_DEVICES'
      },
    };

    expect(component.group).toEqual({
      name: '__my_devices_group__',
      devices: ['deviceId_5', 'deviceId_2', 'deviceId_3', 'deviceId_1', 'deviceId_4'],
      properties: {
        displayName: 'MY_DEVICES.ALL_DEVICES'
      },
    });
    expect(component.devices).toEqual(['deviceId_5', 'deviceId_2', 'deviceId_3', 'deviceId_1', 'deviceId_4']);
  });

  it('set group without devices', () => {
    component.group = {
      name: '__my_devices_group__',
      properties: {
        displayName: 'MY_DEVICES.ALL_DEVICES'
      },
    };

    expect(component.group).toEqual({
      name: '__my_devices_group__',
      properties: {
        displayName: 'MY_DEVICES.ALL_DEVICES'
      },
    });
    expect(component.devices).toEqual([]);
  });

  it('set device component', () => {
    component.deviceComponent = undefined;
    expect(component.deviceComponent).toBeFalsy();

    component.deviceComponent = { fakeComponent: true };
    expect(component._deviceComponent).toEqual({ fakeComponent: true });
  });

  it('trigger action', () => {
    component.goToGroupsPage();
    expect(navCtrl.setRoot).toHaveBeenCalledWith('MyGroupsPage');
  });
});
