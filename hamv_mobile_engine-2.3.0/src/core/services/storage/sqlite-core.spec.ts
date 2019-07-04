import { getTestBed, inject, TestBed } from '@angular/core/testing';

import { SqliteCore } from './sqlite-core';
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

describe('SQLite core - basic testing', () => {

  let instance: SqliteCore;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: SQLite, useClass: SQLiteMock },
      ],
    }).compileComponents();
  });

  beforeAll(inject([SQLite], (sqlite) => {
    instance = new SqliteCore(sqlite);
  }));

  afterAll(() => {
    return instance.deleteStorage().then(() => instance.close());
  });

  it('Create sqlite core', () => {
    expect(instance).toBeTruthy();
  });

  it('Setup & initialize', () => {
    return new Promise((resolve) => {
      const spy = spyOn(instance, 'setup').and.callThrough();
      instance.setup();
      expect(spy).toHaveBeenCalled();
      setTimeout(() => resolve());
    })
      .then(() => {
        const spy = spyOn(instance, 'initialize').and.callThrough();
        const p = instance.initialize();
        expect(spy).toHaveBeenCalled();
        return p;
      });
  });

  it('Unsupport action', () => {
    return instance.doAction({
      type: 'Unsupport action',
      args: undefined,
    })
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('Action is not supported');
      });
  });

});

describe('SQLite core - query testing', () => {

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

  it('Update a device\'s config - invalid object', () => {
    return instance.deviceUpdateConfig('testing_device_sn', undefined)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s profile', () => {
    return instance.deviceUpdateProfile('testing_device_sn', {
      esh: {
        class: 123,
        esh_version: '4.0.0',
        device_id: 1,
        brand: 'ACCompany1',
        model: 'AC001',
      },
      module: {
        firmware_version: '1.0.0',
        mac_address: 'AC123',
        local_ip: '192.168.0.13',
        ssid: 'BRX13',
      },
      cert: {
        fingerprint: {
          sha1: 'DE28F4A4FFE5B92FA3C503D1A349A7F9962A8212'
        },
        validity: {
          not_before: '5/21/02',
          not_after: '5/21/22'
        }
      }
    })
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s profile - empty content', () => {
    return instance.deviceUpdateProfile('testing_device_sn', {})
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s profile - lost information', () => {
    return instance.deviceUpdateProfile('testing_device_sn', {
      esh: {
        class: undefined,
        esh_version: undefined,
        device_id: undefined,
        brand: undefined,
        model: undefined,
      },
      module: {
        firmware_version: undefined,
        mac_address: undefined,
        local_ip: undefined,
        ssid: undefined,
      },
    })
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s profile - invalid profile', () => {
    return instance.deviceUpdateProfile('testing_device_sn', undefined)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s calendar', () => {
    return instance.deviceUpdateCalendar('testing_device_sn', fakeCanlendar)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s status', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => instance.deviceUpdateStatus('testing_device_sn', {
        H01: 1,
        H02: 2
      }))
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s status - empty status', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => instance.deviceUpdateStatus('testing_device_sn', {}))
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s status - no status', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => instance.deviceUpdateStatus('testing_device_sn', undefined))
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s properties', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => instance.deviceUpdateProperties('testing_device_sn', {
        abc: '123',
        bcd: '456',
      }))
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update a device\'s properties - invalid value', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => instance.deviceUpdateProperties('testing_device_sn', null))
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Delete a device\'s properties by keys', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => instance.deviceDeleteProperties('testing_device_sn', ['abc', 'cde']))
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Add a user to a device', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => instance.deviceAddUser('testing_device_sn', {
        email: 'testing@exosite.com',
        role: 'guest',
      }))
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Remove a user from a device', () => {
    return instance.createDevice('testing_device_sn')
      .then(() => instance.deviceAddUser('testing_device_sn', {
        email: 'testing@exosite.com',
        role: 'guest',
      }))
      .then(() => instance.deviceRemoveUser('testing_device_sn', 'testing@exosite.com'))
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update user list in a device', () => {
    return instance.deviceUpdateUserList('testing_device_sn', fakeUserList)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update user list in a device with no list', () => {
    return instance.deviceUpdateUserList('testing_device_sn', undefined)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update connection state of a device', () => {
    return instance.deviceUpdateConnectionState('testing_device_sn', 1)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update connection state of a device - illegal state', () => {
    return instance.deviceUpdateConnectionState('testing_device_sn', 2)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update device state of a device', () => {
    return instance.deviceUpdateDeviceState('testing_device_sn', 'idle')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update device state of a device - no device state', () => {
    return instance.deviceUpdateDeviceState('testing_device_sn', '')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update whole data of a device', () => {
    return instance.updateDevice(fakeDevice)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update whole data of a device with some lack values', () => {
    const fakeDevice = {
      device: 'a device id',
      connected: 1,
      device_state: 'idle',
      profile: {
        esh: {
          class: undefined,
          esh_version: undefined,
          device_id: undefined,
          brand: undefined,
          model: undefined,
        },
        module: {
          firmware_version: undefined,
          mac_address: undefined,
          local_ip: undefined,
          ssid: undefined,
        },
        cert: undefined,
      },
      calendar: {},
      fields: {},
      users: {},
    };
    return instance.updateDevice(fakeDevice)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update whole data of a device with empty values', () => {
    const fakeDevice = {
      device: 'a device id',
      connected: 1,
      device_state: 'idle',
    };
    return instance.updateDevice(fakeDevice)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update devices from a device list', () => {
    return instance.updateDeviceList(fakeDeviceList)
      .then(data => {
        expect(Array.isArray(data)).toBeTruthy();
        expect(data).toEqual(['a device id']);
      });
  });

  it('Update devices from a device list - empty array', () => {
    return instance.updateDeviceList([])
      .then(data => {
        expect(Array.isArray(data)).toBeTruthy();
        expect(data).toEqual([]);
      });
  });

  it('Update devices from a device list - missing values', () => {
    return instance.updateDeviceList([
      {
        device: 'a device id',
        role: 'guest',
        owner: 'testing@exosite.com',
      },
    ])
      .then(data => {
        expect(Array.isArray(data)).toBeTruthy();
        expect(data).toEqual(['a device id']);
      });
  });

  it('Update devices from a device list - wrong content', () => {
    return instance.updateDeviceList({})
      .then(data => {
        expect(Array.isArray(data)).toBeTruthy();
        expect(data).toEqual([]);
      });
  });

  it('Set/create a group', () => {
    return instance.setGroup(fakeGroup)
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Set/create a illegal group', () => {
    return instance.setGroup({})
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('Illegal group or no group name');
      });
  });

  it('Delete a group', () => {
    return instance.deleteGroup('fakeGroup name')
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Delete a group with no name', () => {
    return instance.deleteGroup('')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('No group name');
      });
  });

  it('Update groups from a group list', () => {
    return instance.updateGroupList(['fakeGroup 1', 'fakeGroup 2'])
      .then(() => expect('Action success').toBeTruthy());
  });

  it('Update groups from a group list with empty list', () => {
    return instance.updateGroupList([])
      .then(() => expect('Action success').toBeTruthy());
  });

});

describe('SQLite core - selection testing', () => {

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
    return new Promise((resolve) => {
      instance.setup();
      setTimeout(() => resolve());
    })
      .then(() => instance.start());
  });

  beforeEach(() => {
    return instance.deleteStorage();
  });

  afterAll(() => {
    return instance.deleteStorage().then(() => instance.stop());
  });

  it('Query whole devices data', () => {
    const p = Promise.all([
      instance.createDevice('fakeDeviceSn 1'),
      instance.createDevice('fakeDeviceSn 2'),
    ]);
    return p.then(() => instance.refreshDevices())
      .then(data => {
        expect(data).toBeDefined();
        expect(Object.keys(data).length).toEqual(2);
        expect(data['fakeDeviceSn 1']).toBeDefined();
        expect(data['fakeDeviceSn 2']).toBeDefined();
        expect(data['fakeDeviceSn 3']).toBeUndefined();
      });
  });

  it('Query devices data with a device sn list', () => {
    const p = Promise.all([
      instance.createDevice('fakeDeviceSn 1'),
      instance.createDevice('fakeDeviceSn 2'),
      instance.createDevice('fakeDeviceSn 3'),
    ]);
    return p.then(() => instance.refreshDevices(['fakeDeviceSn 1', 'fakeDeviceSn 2']))
      .then(data => {
        expect(data).toBeDefined();
        expect(Object.keys(data).length).toEqual(2);
        expect(data['fakeDeviceSn 1']).toBeDefined();
        expect(data['fakeDeviceSn 2']).toBeDefined();
        expect(data['fakeDeviceSn 3']).toBeUndefined();
      });
  });

  it('Query device SNs data with a filter', () => {
    const p = Promise.all([
      instance.createDevice('fakeDeviceSn 1'),
      instance.createDevice('fakeDeviceSn 2'),
      instance.createDevice('fakeDeviceSn 3'),
    ]);
    return p.then(() => instance.filterDevices({}))
      .then(data => {
        expect(data).toEqual(['fakeDeviceSn 1', 'fakeDeviceSn 2', 'fakeDeviceSn 3']);
      });
  });

  it('Query whole groups data', () => {
    const p = Promise.all([
      instance.setGroup({ name: 'fakeGroup 1' }),
      instance.setGroup({ name: 'fakeGroup 2' }),
    ]);
    return p.then(() => instance.refreshGroups())
      .then(data => {
        expect(data).toBeDefined();
        expect(Object.keys(data).length).toEqual(2);
        expect(data['fakeGroup 1']).toBeDefined();
        expect(data['fakeGroup 2']).toBeDefined();
        expect(data['fakeGroup 3']).toBeUndefined();
      });
  });

  it('Query group data with a group id list', () => {
    const p = Promise.all([
      instance.setGroup({ name: 'fakeGroup 1' }),
      instance.setGroup({ name: 'fakeGroup 2' }),
      instance.setGroup({ name: 'fakeGroup 3' }),
    ]);
    return p.then(() => instance.refreshGroups(['fakeGroup 1', 'fakeGroup 2']))
      .then(data => {
        expect(data).toBeDefined();
        expect(Object.keys(data).length).toEqual(2);
        expect(data['fakeGroup 1']).toBeDefined();
        expect(data['fakeGroup 2']).toBeDefined();
        expect(data['fakeGroup 3']).toBeUndefined();
      });
  });

  it('Query group ids data with a filter', () => {
    const p = Promise.all([
      instance.setGroup({ name: 'fakeGroup 1' }),
      instance.setGroup({ name: 'fakeGroup 2' }),
      instance.setGroup({ name: 'fakeGroup 3' }),
    ]);
    return p.then(() => instance.filterGroups({}))
      .then(data => {
        expect(data).toEqual(['fakeGroup 1', 'fakeGroup 2', 'fakeGroup 3']);
      });
  });

});