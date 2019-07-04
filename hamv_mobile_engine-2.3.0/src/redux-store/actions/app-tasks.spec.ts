import { TestBed, getTestBed } from '@angular/core/testing';
import { NgReduxTestingModule } from '@angular-redux/store/testing';

import { AppTasks } from './app-tasks';
import { AppEngine } from '../../core/app-engine';

import { AppEngineMock } from '../../mocks/app-engine.mocks';
import {
  fakeGroup,
  fakeUserData,
  fakeCanlendar,
  fakeUserMe,
} from '../../mocks/servers.mocks';
import { AuthError } from '../../core/errors/auth-error';

describe('App tasks', () => {

  let instance: AppTasks;
  let appEngine: AppEngine;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        NgReduxTestingModule,
      ],
      providers: [
        { provide: AppEngine, useClass: AppEngineMock },
        AppTasks,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(AppTasks);
    appEngine = injector.get(AppEngine);
  });

  it('App tasks - getAccountTask', () => {
    return instance.getAccountTask();
  });

  it('App tasks - getAccountTask failed', () => {
    spyOn(appEngine, 'getAccount').and.returnValue(Promise.reject('error'));
    return instance.getAccountTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - setAccountTask', () => {
    return instance.setAccountTask({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    });
  });

  it('App tasks - setAccountTask failed', () => {
    spyOn(appEngine, 'setAccount').and.returnValue(Promise.reject('error'));
    return instance
      .setAccountTask({
        account: 'testing@exosite.com',
        token: 'a token',
        isOAuth: false,
        authProvider: 'auth-provider-none',
        isLoggedIn: true,
        pTokenBundle: {
          token: 'abc',
        },
      })
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - getUserDataTask', () => {
    return instance.getUserDataTask();
  });

  it('App tasks - getUserDataTask failed', () => {
    spyOn(appEngine, 'getUserData').and.returnValue(Promise.reject('error'));
    return instance.getUserDataTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - setUserDataTask', () => {
    return instance.setUserDataTask(fakeUserData);
  });

  it('App tasks - setUserDataTask failed', () => {
    spyOn(appEngine, 'setUserData').and.returnValue(Promise.reject('error'));
    return instance.setUserDataTask(fakeUserData)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - getUserMeTask', () => {
    return instance.getUserMeTask();
  });

  it('App tasks - getUserMeTask failed', () => {
    spyOn(appEngine, 'getUserMe').and.returnValue(Promise.reject('error'));
    return instance.getUserMeTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - setUserMeTask', () => {
    return instance.setUserMeTask(fakeUserMe);
  });

  it('App tasks - setUserMeTask failed', () => {
    spyOn(appEngine, 'setUserMe').and.returnValue(Promise.reject('error'));
    return instance.setUserMeTask(fakeUserMe)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - registerTask', () => {
    return instance.registerTask('account', 'password');
  });

  it('App tasks - registerTask failed', () => {
    spyOn(appEngine, 'register').and.returnValue(Promise.reject('error'));
    return instance.registerTask('account', 'password')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - sessionTask', () => {
    return instance.sessionTask();
  });

  it('App tasks - sessionTask failed', () => {
    spyOn(appEngine, 'session').and.returnValue(Promise.reject('error'));
    return instance.sessionTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - refreshTokenTask', () => {
    return instance.refreshTokenTask();
  });

  it('App tasks - refreshTokenTask failed', () => {
    spyOn(appEngine, 'refreshToken').and.returnValue(Promise.reject('error'));
    return instance.refreshTokenTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - loginTask', () => {
    return instance.loginTask('account', 'password');
  });

  it('App tasks - loginTask failed', () => {
    spyOn(appEngine, 'login').and.returnValue(Promise.reject('error'));
    return instance.loginTask('account', 'password')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - loginWithFacebookTask', () => {
    return instance.loginWithFacebookTask();
  });

  it('App tasks - loginWithFacebookTask failed', () => {
    spyOn(appEngine, 'loginWithFacebook').and.returnValue(Promise.reject('error'));
    return instance.loginWithFacebookTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - requestResetPasswordTask', () => {
    return instance.requestResetPasswordTask('email@from.somewhere');
  });

  it('App tasks - requestResetPasswordTask failed', () => {
    spyOn(appEngine, 'requestResetPassword').and.returnValue(Promise.reject('error'));
    return instance.requestResetPasswordTask('email@from.somewhere')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - logoutTask', () => {
    return instance.logoutTask();
  });

  it('App tasks - logoutTask failed', () => {
    spyOn(appEngine, 'logout').and.returnValue(Promise.reject('error'));
    return instance.logoutTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - deleteAccountTask', () => {
    return instance.deleteAccountTask();
  });

  it('App tasks - deleteAccountTask failed', () => {
    spyOn(appEngine, 'deleteAccount').and.returnValue(Promise.reject('error'));
    return instance.deleteAccountTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - removeAllDataTask', () => {
    return instance.removeAllDataTask();
  });

  it('App tasks - removeAllDataTask failed', () => {
    spyOn(appEngine, 'removeAllData').and.returnValue(Promise.reject('error'));
    return instance.removeAllDataTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - requestUserDataTask', () => {
    return instance.requestUserDataTask();
  });

  it('App tasks - requestUserDataTask failed', () => {
    spyOn(appEngine, 'requestUserData').and.returnValue(Promise.reject('error'));
    return instance.requestUserDataTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - queryDeviceInfoTask', () => {
    return instance.queryDeviceInfoTask();
  });

  it('App tasks - queryDeviceInfoTask failed', () => {
    spyOn(appEngine, 'queryDeviceInfo').and.returnValue(Promise.reject('error'));
    return instance.queryDeviceInfoTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - fireApModeTask', () => {
    return instance.fireApModeTask('ssid', 'password', 'security', 'url', 'provToken', 'provisionType');
  });

  it('App tasks - fireApModeTask without provision type', () => {
    return instance.fireApModeTask('ssid', 'password', 'security', 'url', 'provToken');
  });

  it('App tasks - fireApModeTask failed', () => {
    spyOn(appEngine, 'fireApMode').and.returnValue(Promise.reject('error'));
    return instance.fireApModeTask('ssid', 'password', 'security', 'url', 'provToken', 'provisionType')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - getFirmwareList with nothing', () => {
    return instance.getFirmwareList();
  });

  it('App tasks - getFirmwareList with model string', () => {
    return instance.getFirmwareList('model');
  });

  it('App tasks - getFirmwareList with model array', () => {
    return instance.getFirmwareList(['model', 'array']);
  });

  it('App tasks - getFirmwareList failed', () => {
    spyOn(appEngine, 'getFirmwareList').and.returnValue(Promise.reject('error'));
    return instance.getFirmwareList()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - getHistoricalData with no query object', () => {
    return instance.getHistoricalData('deviceSn', 'H00');
  });

  it('App tasks - getHistoricalData with query object', () => {
    return instance.getHistoricalData('deviceSn', 'H00', { end_time: 1532333757675 });
  });

  it('App tasks - getHistoricalData failed', () => {
    spyOn(appEngine, 'getHistoricalData').and.returnValue(Promise.reject('error'));
    return instance.getHistoricalData('deviceSn', 'H00')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - refreshDevicesTask with nothing', () => {
    return instance.refreshDevicesTask();
  });

  it('App tasks - refreshDevicesTask with device id array', () => {
    return instance.refreshDevicesTask(['device', 'id', 'array']);
  });

  it('App tasks - refreshDevicesTask failed', () => {
    spyOn(appEngine, 'refreshDevices').and.returnValue(Promise.reject('error'));
    return instance.refreshDevicesTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - filterDevicesTask without filter', () => {
    return instance.filterDevicesTask();
  });

  it('App tasks - filterDevicesTask with filter', () => {
    return instance.filterDevicesTask({});
  });

  it('App tasks - filterDevicesTask failed', () => {
    spyOn(appEngine, 'filterDevices').and.returnValue(Promise.reject('error'));
    return instance.filterDevicesTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - refreshGroupsTask with nothing', () => {
    return instance.refreshGroupsTask();
  });

  it('App tasks - refreshGroupsTask with group id array', () => {
    return instance.refreshGroupsTask(['group', 'id', 'array']);
  });

  it('App tasks - refreshGroupsTask failed', () => {
    spyOn(appEngine, 'refreshGroups').and.returnValue(Promise.reject('error'));
    return instance.refreshGroupsTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - filterGroupsTask without filter', () => {
    return instance.filterGroupsTask();
  });

  it('App tasks - filterGroupsTask with filter', () => {
    return instance.filterGroupsTask({});
  });

  it('App tasks - filterGroupsTask failed', () => {
    spyOn(appEngine, 'filterGroups').and.returnValue(Promise.reject('error'));
    return instance.filterGroupsTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - startWatchDnssdTask', () => {
    return instance.startWatchDnssdTask();
  });

  it('App tasks - startWatchDnssdTask failed', () => {
    spyOn(appEngine, 'watchDnssd').and.returnValue(Promise.reject('error'));
    return instance.startWatchDnssdTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - stopWatchDnssdTask', () => {
    return instance.stopWatchDnssdTask();
  });

  it('App tasks - stopWatchDnssdTask failed', () => {
    spyOn(appEngine, 'unwatchDnssd').and.returnValue(Promise.reject('error'));
    return instance.stopWatchDnssdTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestLoginTask', () => {
    return instance.wsRequestLoginTask();
  });

  it('App tasks - wsRequestLoginTask failed', () => {
    spyOn(appEngine, 'websocketLogin').and.returnValue(Promise.reject('error'));
    return instance.wsRequestLoginTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestLoginTask failed with AuthError', () => {
    spyOn(appEngine, 'websocketLogin').and.returnValue(Promise.reject(new AuthError('auth error')));
    return instance.wsRequestLoginTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
      });
  });

  it('App tasks - wsRequestProvisionTokenTask without TTL', () => {
    return instance.wsRequestProvisionTokenTask();
  });

  it('App tasks - wsRequestProvisionTokenTask with TTL', () => {
    return instance.wsRequestProvisionTokenTask(79979);
  });

  it('App tasks - wsRequestProvisionTokenTask failed', () => {
    spyOn(appEngine, 'requestProvisionToken').and.returnValue(Promise.reject('error'));
    return instance.wsRequestProvisionTokenTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestGetMeTask', () => {
    return instance.wsRequestGetMeTask();
  });

  it('App tasks - wsRequestGetMeTask failed', () => {
    spyOn(appEngine, 'requestGetMe').and.returnValue(Promise.reject('error'));
    return instance.wsRequestGetMeTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestConfigTask', () => {
    return instance.requestConfigTask('device SN', { fields: ['H00', 'H02'] });
  });

  it('App tasks - requestConfigTask failed', () => {
    spyOn(appEngine, 'requestConfig').and.returnValue(Promise.reject('error'));
    return instance.requestConfigTask('device SN', { fields: ['H00', 'H02'] })
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestSetTask', () => {
    return instance.wsRequestSetTask('device SN', { H01: 1, H00: 0 });
  });

  it('App tasks - wsRequestSetTask failed', () => {
    spyOn(appEngine, 'requestSet').and.returnValue(Promise.reject('error'));
    return instance.wsRequestSetTask('device SN', { H01: 1, H00: 0 })
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestGetTask', () => {
    return instance.wsRequestGetTask('device SN');
  });

  it('App tasks - wsRequestGetTask failed', () => {
    spyOn(appEngine, 'requestGet').and.returnValue(Promise.reject('error'));
    return instance.wsRequestGetTask('device SN')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestOtaTask', () => {
    return instance.wsRequestOtaTask('device SN', 'https://some.where/firmware/download/location', 'cf23df2207d99a74fbe169e3eba035e633b65d94', '4.0.0');
  });

  it('App tasks - wsRequestOtaTask failed', () => {
    spyOn(appEngine, 'requestOta').and.returnValue(Promise.reject('error'));
    return instance.wsRequestOtaTask('device SN', 'https://some.where/firmware/download/location', 'cf23df2207d99a74fbe169e3eba035e633b65d94', '4.0.0')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestCalendarTask', () => {
    return instance.wsRequestCalendarTask('device SN', fakeCanlendar);
  });

  it('App tasks - wsRequestCalendarTask failed', () => {
    spyOn(appEngine, 'requestCalendar').and.returnValue(Promise.reject('error'));
    return instance.wsRequestCalendarTask('device SN', fakeCanlendar)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestAddUserTask', () => {
    const fakeUser = {
      email: 'testing@exosite.com',
      role: 'guest'
    };
    return instance.wsRequestAddUserTask('device SN', fakeUser);
  });

  it('App tasks - wsRequestAddUserTask failed', () => {
    spyOn(appEngine, 'requestAddUser').and.returnValue(Promise.reject('error'));
    const fakeUser = {
      email: 'testing@exosite.com',
      role: 'guest'
    };
    return instance.wsRequestAddUserTask('device SN', fakeUser)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestAddSharingDeviceTask', () => {
    return instance.wsRequestAddSharingDeviceTask('a sharing token');
  });

  it('App tasks - wsRequestAddSharingDeviceTask failed', () => {
    spyOn(appEngine, 'requestAddSharingDevice').and.returnValue(Promise.reject('error'));
    return instance.wsRequestAddSharingDeviceTask('a sharing token')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestGetSharingTokenTask', () => {
    const fakeUserRole = {
      role: 'guest'
    };
    return instance.wsRequestGetSharingTokenTask('device SN', fakeUserRole);
  });

  it('App tasks - wsRequestGetSharingTokenTask failed', () => {
    spyOn(appEngine, 'requestGetSharingToken').and.returnValue(Promise.reject('error'));
    const fakeUserRole = {
      role: 'guest'
    };
    return instance.wsRequestGetSharingTokenTask('device SN', fakeUserRole)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestRemoveUserTask', () => {
    return instance.wsRequestRemoveUserTask('device SN', 'email@from.somewhere');
  });

  it('App tasks - wsRequestRemoveUserTask failed', () => {
    spyOn(appEngine, 'requestRemoveUser').and.returnValue(Promise.reject('error'));
    return instance.wsRequestRemoveUserTask('device SN', 'email@from.somewhere')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestListUserTask', () => {
    return instance.wsRequestListUserTask('device SN');
  });

  it('App tasks - wsRequestListUserTask failed', () => {
    spyOn(appEngine, 'requestListUser').and.returnValue(Promise.reject('error'));
    return instance.wsRequestListUserTask('device SN')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestListDeviceTask', () => {
    return instance.wsRequestListDeviceTask();
  });

  it('App tasks - wsRequestListDeviceTask with a device list response', () => {
    spyOn(appEngine, 'requestListDevice').and.returnValue(Promise.resolve(['device sn 1', 'device sn 2']));
    return instance.wsRequestListDeviceTask();
  });

  it('App tasks - wsRequestListDeviceTask failed', () => {
    spyOn(appEngine, 'requestListDevice').and.returnValue(Promise.reject('error'));
    return instance.wsRequestListDeviceTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestSetPropertiesTask', () => {
    const fakeProperties = {
      property1: 'abcd',
      property2: {},
      propertyArray: [],
    };
    return instance.wsRequestSetPropertiesTask('device SN', fakeProperties);
  });

  it('App tasks - wsRequestSetPropertiesTask failed', () => {
    spyOn(appEngine, 'requestSetProperties').and.returnValue(Promise.reject('error'));
    const fakeProperties = {
      property1: 'abcd',
      property2: {},
      propertyArray: [],
    };
    return instance.wsRequestSetPropertiesTask('device SN', fakeProperties)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestDeletePropertiesTask', () => {
    return instance.wsRequestDeletePropertiesTask('device SN', ['property1', 'propertyArray']);
  });

  it('App tasks - wsRequestDeletePropertiesTask failed', () => {
    spyOn(appEngine, 'requestDeleteProperties').and.returnValue(Promise.reject('error'));
    return instance.wsRequestDeletePropertiesTask('device SN', ['property1', 'propertyArray'])
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestDeleteDeviceTask', () => {
    return instance.wsRequestDeleteDeviceTask('device SN');
  });

  it('App tasks - wsRequestDeleteDeviceTask failed', () => {
    spyOn(appEngine, 'requestDeleteDevice').and.returnValue(Promise.reject('error'));
    return instance.wsRequestDeleteDeviceTask('device SN')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestSetGroupTask', () => {
    return instance.wsRequestSetGroupTask(fakeGroup);
  });

  it('App tasks - wsRequestSetGroupTask failed', () => {
    spyOn(appEngine, 'requestSetGroup').and.returnValue(Promise.reject('error'));
    return instance.wsRequestSetGroupTask(fakeGroup)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestGetGroupTask', () => {
    return instance.wsRequestGetGroupTask('group name');
  });

  it('App tasks - wsRequestGetGroupTask failed', () => {
    spyOn(appEngine, 'requestGetGroup').and.returnValue(Promise.reject('error'));
    return instance.wsRequestGetGroupTask('group name')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestDeleteGroupTask', () => {
    return instance.wsRequestDeleteGroupTask('group name');
  });

  it('App tasks - wsRequestDeleteGroupTask failed', () => {
    spyOn(appEngine, 'requestDeleteGroup').and.returnValue(Promise.reject('error'));
    return instance.wsRequestDeleteGroupTask('group name')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestListGroupTask', () => {
    return instance.wsRequestListGroupTask();
  });

  it('App tasks - wsRequestListGroupTask with a group list response', () => {
    spyOn(appEngine, 'requestListGroup').and.returnValue(Promise.resolve(['group name 1', 'group name 2']));
    return instance.wsRequestListGroupTask();
  });

  it('App tasks - wsRequestListGroupTask failed', () => {
    spyOn(appEngine, 'requestListGroup').and.returnValue(Promise.reject('error'));
    return instance.wsRequestListGroupTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestSetUserDataTask', () => {
    return instance.wsRequestSetUserDataTask(fakeUserData);
  });

  it('App tasks - wsRequestSetUserDataTask failed', () => {
    spyOn(appEngine, 'requestSetUserData').and.returnValue(Promise.reject('error'));
    return instance.wsRequestSetUserDataTask(fakeUserData)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestDeleteUserDataTask', () => {
    return instance.wsRequestDeleteUserDataTask(['userData1', 'userData3']);
  });

  it('App tasks - wsRequestDeleteUserDataTask failed', () => {
    spyOn(appEngine, 'requestDeleteUserData').and.returnValue(Promise.reject('error'));
    return instance.wsRequestDeleteUserDataTask(['userData1', 'userData3'])
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

  it('App tasks - wsRequestGetUserDataTask', () => {
    return instance.wsRequestGetUserDataTask();
  });

  it('App tasks - wsRequestGetUserDataTask failed', () => {
    spyOn(appEngine, 'requestGetUserData').and.returnValue(Promise.reject('error'));
    return instance.wsRequestGetUserDataTask()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('error');
      });
  });

});
