import { getTestBed, TestBed } from '@angular/core/testing';

import { DatabaseService } from './db-service';
import { PlatformMock } from 'ionic-mocks';
import { Platform } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { SQLiteMock } from '../../../mocks/sqlite.mocks';
import {
  fakeCanlendar,
  fakeDevice,
  fakeDeviceList,
  fakeGroup,
  fakeUserList,
} from '../../../mocks/servers.mocks';

describe('Database Service - basic testing', () => {

  let instance: DatabaseService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: SQLite, useClass: SQLiteMock },
        DatabaseService,
      ],
    });
    spyOn(SQLite, 'installed').and.returnValue(true);

    const injector = getTestBed();
    instance = injector.get(DatabaseService);
  });

  afterAll(() => {
    return instance.deleteStorage().then(() => instance.stop());
  });

  it('Create database service', () => {
    expect(instance).toBeTruthy();
  });

  it('setup & start', () => {
    return new Promise((resolve) => {
      const spy = spyOn(instance, 'setup').and.callThrough();
      instance.setup({});
      expect(spy).toHaveBeenCalled();
      setTimeout(() => resolve(), 1000);
    })
      .then(() => {
        const spy = spyOn(instance, 'start').and.callThrough();
        const p = instance.start();
        expect(spy).toHaveBeenCalled();
        return p;
      });
  });

});

describe('Database Service - method testing', () => {

  let instance: DatabaseService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: SQLite, useClass: SQLiteMock },
        DatabaseService,
      ],
    });
    spyOn(SQLite, 'installed').and.returnValue(true);

    const injector = getTestBed();
    instance = injector.get(DatabaseService);
    instance.setup();
    return new Promise((resolve) => {
      setTimeout(() => resolve());
    });
  });

  beforeAll(() => {
    return instance.start();
  });

  beforeEach(() => {
    return instance.deleteStorage();
  });

  afterAll(() => {
    return instance.deleteStorage().then(() => instance.stop());
  });

  it('Create a device', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Create a device with owner', () => {
    return instance.createDeviceWithOwner('testing_device_sn', 'Tester')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Delete a device with owner', () => {
    return instance.deleteDeviceWithOwner('testing_device_sn', 'Tester')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Delete a device', () => {
    return instance.deleteDevice('testing_device_sn')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s config', () => {
    return instance.deviceUpdateConfig('testing_device_sn', {})
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s profile', () => {
    return instance.deviceUpdateProfile('testing_device_sn', {})
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s calendar', () => {
    return instance.deviceUpdateCalendar('testing_device_sn', fakeCanlendar)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s status', () => {
    return instance.deviceUpdateStatus('testing_device_sn', {})
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s properties', () => {
    return instance.deviceUpdateProperties('testing_device_sn', {})
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Delete a device\'s properties by keys', () => {
    return instance.deviceDeleteProperties('testing_device_sn', ['abc', 'cde'])
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Add a user to a device', () => {
    return instance.deviceAddUser('testing_device_sn', {
      email: 'testing@exosite.com',
      role: 'guest',
    })
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Remove a user from a device', () => {
    return instance.deviceRemoveUser('testing_device_sn', 'testing@exosite.com')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update user list in a device', () => {
    return instance.deviceUpdateUserList('testing_device_sn', fakeUserList)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update connection state of a device', () => {
    return instance.deviceUpdateConnectionState('testing_device_sn', 1)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update device state of a device', () => {
    return instance.deviceUpdateDeviceState('testing_device_sn', 'idle')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update whole data of a device', () => {
    return instance.updateDevice(fakeDevice)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update devices from a device list', () => {
    return instance.updateDeviceList(fakeDeviceList)
      .then(() => expect('Action success').toBeTruthy());;
  });

  it('Set/create a group', () => {
    return instance.setGroup(fakeGroup)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Delete a group', () => {
    return instance.deleteGroup('fakeGroup name')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update groups from a group list', () => {
    return instance.updateGroupList(['fakeGroup 1', 'fakeGroup 2'])
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update groups from a group list', () => {
    return instance.updateGroupList(['fakeGroup 1', 'fakeGroup 2'])
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Query whole devices data', () => {
    return instance.refreshDevices()
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Query devices data with a device sn list', () => {
    return instance.refreshDevices(['fakeDeviceSn 1', 'fakeDeviceSn 2'])
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Query device SNs data with a filter', () => {
    return instance.filterDevices({})
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Query whole groups data', () => {
    return instance.refreshGroups()
      .then(() => expect('Action success').toBeTruthy());;
  });

  it('Query group data with a group id list', () => {
    return instance.refreshGroups(['fakeGroup 1', 'fakeGroup 2'])
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Query group ids data with a filter', () => {
    return instance.filterGroups({})
      .then(() => expect('Action success').toBeTruthy());
  });

});