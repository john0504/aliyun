import { TestBed, getTestBed } from '@angular/core/testing';

import { AppEngineTasks } from './app-engine-tasks';
import { AccountService } from '../services/account/account-service';
import { DatabaseService } from '../services/storage/db-service';
import { MuranoApiService } from '../services/network/murano-api-service';
import { DnssdService } from '../services/mdns/dnssd-service';

import {
  AccountServiceMock,
  DatabaseServiceMock,
  MuranoApiServiceMock,
  DnssdServiceMock,
} from '../../mocks/app-engine.mocks';
import {
  fakeGroup,
  fakeUserData,
  fakeCanlendar,
} from '../../mocks/servers.mocks';

describe('AppEngine tasks', () => {

  let instance: AppEngineTasks;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AccountService, useClass: AccountServiceMock },
        { provide: DatabaseService, useClass: DatabaseServiceMock },
        { provide: MuranoApiService, useClass: MuranoApiServiceMock },
        { provide: DnssdService, useClass: DnssdServiceMock },
        AppEngineTasks
      ],
    });
    const injector = getTestBed();
    instance = injector.get(AppEngineTasks);
  });

  it('AppEngine tasks - registerTask', () => {
    return instance.registerTask('account', 'password');
  });

  it('AppEngine tasks - sessionTask', () => {
    return instance.sessionTask();
  });

  it('AppEngine tasks - refreshTokenTask', () => {
    return instance.refreshTokenTask();
  });

  it('AppEngine tasks - loginTask', () => {
    return instance.loginTask('account', 'password');
  });

  it('AppEngine tasks - loginWithFacebookTask', () => {
    return instance.loginWithFacebookTask();
  });

  it('AppEngine tasks - requestResetPasswordTask', () => {
    return instance.requestResetPasswordTask('email@from.somewhere');
  });

  it('AppEngine tasks - logoutTask', () => {
    return instance.logoutTask();
  });

  it('AppEngine tasks - deleteAccountTask', () => {
    return instance.deleteAccountTask();
  });

  it('AppEngine tasks - removeAllDataTask', () => {
    return instance.removeAllDataTask();
  });

  it('AppEngine tasks - requestUserDataTask', () => {
    return instance.requestUserDataTask();
  });

  it('AppEngine tasks - queryDeviceInfoTask', () => {
    return instance.queryDeviceInfoTask();
  });

  it('AppEngine tasks - fireApModeTask', () => {
    return instance.fireApModeTask('ssid', 'password', 'security', 'url', 'provToken', 'provisionType');
  });

  it('AppEngine tasks - fireApModeTask without provision type', () => {
    return instance.fireApModeTask('ssid', 'password', 'security', 'url', 'provToken');
  });

  it('AppEngine tasks - getFirmwareList with nothing', () => {
    return instance.getFirmwareList();
  });

  it('AppEngine tasks - getFirmwareList with model string', () => {
    return instance.getFirmwareList('model');
  });

  it('AppEngine tasks - getFirmwareList with model array', () => {
    return instance.getFirmwareList(['model', 'array']);
  });

  it('AppEngine tasks - getHistoricalData with no query object', () => {
    return instance.getHistoricalData('deviceSn1', 'H00');
  });

  it('AppEngine tasks - getHistoricalData with query object', () => {
    return instance.getHistoricalData('deviceSn1', 'H00', { end_time: 1532333757675 });
  });

  it('AppEngine tasks - refreshDevicesTask with nothing', () => {
    return instance.refreshDevicesTask();
  });

  it('AppEngine tasks - refreshDevicesTask with device id array', () => {
    return instance.refreshDevicesTask(['device', 'id', 'array']);
  });

  it('AppEngine tasks - filterDevicesTask without filter', () => {
    return instance.filterDevicesTask();
  });

  it('AppEngine tasks - filterDevicesTask with filter', () => {
    return instance.filterDevicesTask({});
  });

  it('AppEngine tasks - refreshGroupsTask with nothing', () => {
    return instance.refreshGroupsTask();
  });

  it('AppEngine tasks - refreshGroupsTask with group id array', () => {
    return instance.refreshGroupsTask(['group', 'id', 'array']);
  });

  it('AppEngine tasks - filterGroupsTask without filter', () => {
    return instance.filterGroupsTask();
  });

  it('AppEngine tasks - filterGroupsTask with filter', () => {
    return instance.filterGroupsTask({});
  });

  it('AppEngine tasks - wsRequestLoginTask', () => {
    return instance.wsRequestLoginTask();
  });

  it('AppEngine tasks - wsRequestProvisionTokenTask without TTL', () => {
    return instance.wsRequestProvisionTokenTask();
  });

  it('AppEngine tasks - wsRequestProvisionTokenTask with TTL', () => {
    return instance.wsRequestProvisionTokenTask(79979);
  });

  it('AppEngine tasks - wsRequestGetMeTask', () => {
    return instance.wsRequestGetMeTask();
  });

  it('AppEngine tasks - wsRequestConfigTask', () => {
    return instance.wsRequestConfigTask('device SN', { fields: ['H00', 'H02'] });
  });

  it('AppEngine tasks - wsRequestSetTask', () => {
    return instance.wsRequestSetTask('device SN', { H01: 1, H00: 0 });
  });

  it('AppEngine tasks - wsRequestGetTask', () => {
    return instance.wsRequestGetTask('device SN');
  });

  it('AppEngine tasks - wsRequestOtaTask', () => {
    return instance.wsRequestOtaTask('device SN', 'https://some.where/firmware/download/location', 'cf23df2207d99a74fbe169e3eba035e633b65d94', '4.0.0');
  });

  it('AppEngine tasks - wsRequestCalendarTask', () => {
    return instance.wsRequestCalendarTask('device SN', fakeCanlendar);
  });

  it('AppEngine tasks - wsRequestAddUserTask', () => {
    const fakeUser = {
      email: 'testing@exosite.com',
      role: 'guest'
    };
    return instance.wsRequestAddUserTask('device SN', fakeUser);
  });

  it('AppEngine tasks - wsRequestAddSharingDeviceTask', () => {
    return instance.wsRequestAddSharingDeviceTask('a sharing token');
  });

  it('AppEngine tasks - wsRequestGetSharingTokenTask', () => {
    const fakeUserRole = {
      role: 'guest'
    };
    return instance.wsRequestGetSharingTokenTask('device SN', fakeUserRole);
  });

  it('AppEngine tasks - wsRequestRemoveUserTask', () => {
    return instance.wsRequestRemoveUserTask('device SN', 'email@from.somewhere');
  });

  it('AppEngine tasks - wsRequestListUserTask', () => {
    return instance.wsRequestListUserTask('device SN');
  });

  it('AppEngine tasks - wsRequestListDeviceTask', () => {
    return instance.wsRequestListDeviceTask();
  });

  it('AppEngine tasks - wsRequestSetPropertiesTask', () => {
    const fakeProperties = {
      property1: 'abcd',
      property2: {},
      propertyArray: [],
    };
    return instance.wsRequestSetPropertiesTask('device SN', fakeProperties);
  });

  it('AppEngine tasks - wsRequestDeletePropertiesTask', () => {
    return instance.wsRequestDeletePropertiesTask('device SN', ['property1', 'propertyArray']);
  });

  it('AppEngine tasks - wsRequestDeleteDeviceTask', () => {
    return instance.wsRequestDeleteDeviceTask('device SN');
  });

  it('AppEngine tasks - wsRequestSetGroupTask', () => {
    return instance.wsRequestSetGroupTask(fakeGroup);
  });

  it('AppEngine tasks - wsRequestGetGroupTask', () => {
    return instance.wsRequestGetGroupTask('group name');
  });

  it('AppEngine tasks - wsRequestDeleteGroupTask', () => {
    return instance.wsRequestDeleteGroupTask('group name');
  });

  it('AppEngine tasks - wsRequestListGroupTask', () => {
    return instance.wsRequestListGroupTask();
  });

  it('AppEngine tasks - wsRequestSetUserDataTask', () => {
    return instance.wsRequestSetUserDataTask(fakeUserData);
  });

  it('AppEngine tasks - wsRequestDeleteUserData', () => {
    return instance.wsRequestDeleteUserData(['userData1', 'userData3']);
  });

  it('AppEngine tasks - wsRequestGetUserDataTask', () => {
    return instance.wsRequestGetUserDataTask();
  });

  it('AppEngine tasks - wsEventTokenExpiredTask', () => {
    return instance.wsEventTokenExpiredTask({ event: 'token_expired' });
  });

  it('AppEngine tasks - wsEventDeviceChangeTask', () => {
    const fakeEvent = {
      event: 'device_change',
      data: {
        device: 'device SN',
        changes: {
          profile: {
          },
          status: {
            H00: 1
          },
          users: [
          ],
          properties: {
            oldprop: null
          },
          connected: 0,
          device_state: 'idle'
        }
      }
    };
    return instance.wsEventDeviceChangeTask(fakeEvent)
      .then(deviceSn => expect(deviceSn).toEqual('device SN'));
  });

  it('AppEngine tasks - wsEventAddDeviceTask', () => {
    const fakeEvent = {
      event: 'add_device',
      data: {
        device: 'device SN',
        owner: 'owner@from.somewhere'
      }
    };
    return instance.wsEventAddDeviceTask(fakeEvent)
      .then(deviceSn => expect(deviceSn).toEqual('device SN'));
  });

  it('AppEngine tasks - wsEventDeleteDeviceTask', () => {
    const fakeEvent = {
      event: 'del_device',
      data: {
        device: 'device SN',
        owner: 'owner@from.somewhere'
      }
    };
    return instance.wsEventDeleteDeviceTask(fakeEvent)
      .then(deviceSn => expect(deviceSn).toEqual('device SN'));
  });

  it('AppEngine tasks - wsEventSetGroupTask', () => {
    const fakeEvent = {
      event: 'set_group',
      data: fakeGroup,
    };
    return instance.wsEventSetGroupTask(fakeEvent)
      .then(groupName => expect(groupName).toEqual('a group name'));
  });

  it('AppEngine tasks - wsEventDeleteGroupTask', () => {
    const fakeEvent = {
      event: 'del_group',
      data: {
        name: 'group name'
      },
    };
    return instance.wsEventDeleteGroupTask(fakeEvent)
      .then(groupName => expect(groupName).toEqual('group name'));
  });

  it('AppEngine tasks - wsEventCalendarTask', () => {
    const fakeEvent = {
      event: 'calendar',
      data: {
        device: 'device SN',
        schedules: fakeCanlendar
      }
    };
    return instance.wsEventCalendarTask(fakeEvent)
      .then(deviceSn => expect(deviceSn).toEqual('device SN'));
  });

  it('AppEngine tasks - wsEventUserDataChangeTask', () => {
    const fakeEvent = {
      event: 'user_data_change',
      data: fakeUserData,
    };
    return instance.wsEventUserDataChangeTask(fakeEvent)
      .then(data => expect(data).toEqual(fakeUserData));
  });
});
