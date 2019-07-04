import { TestBed, getTestBed } from '@angular/core/testing';

import { AppEngine } from './app-engine';
import { AppEngineTasks } from './tasks/app-engine-tasks';
import { AccountService } from './services/account/account-service';
import { DatabaseService } from './services/storage/db-service';
import { MuranoApiService } from './services/network/murano-api-service';
import { DnssdService } from './services/mdns/dnssd-service';
import { WebSocketMessageDispatcher } from './ws-message-dispatcher';

import {
  AccountServiceMock,
  DatabaseServiceMock,
  MuranoApiServiceMock,
  DnssdServiceMock,
  WebSocketMessageDispatcherMock,
} from '../mocks/app-engine.mocks';
import {
  fakeCanlendar,
  fakeGroup,
  fakeUserData,
  fakeUserMe,
} from '../mocks/servers.mocks';

import { Account } from './models/account';

describe('AppEngine test cases', () => {

  let instance: AppEngine;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AccountService, useClass: AccountServiceMock },
        { provide: DatabaseService, useClass: DatabaseServiceMock },
        { provide: MuranoApiService, useClass: MuranoApiServiceMock },
        { provide: DnssdService, useClass: DnssdServiceMock },
        { provide: WebSocketMessageDispatcher, useClass: WebSocketMessageDispatcherMock },
        AppEngineTasks,
        AppEngine,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(AppEngine);
  });

  it('Create App Engine service', () => {
    expect(instance).toBeTruthy();
  });

  it('App Engine - setup service', () => {
    return instance.setup({
      solutionId: 'hamv2-stg',
      useHttp: false,
    });
  });

  it('App Engine - start', () => {
    return instance.start();
  });

  it('App Engine - stop', () => {
    return instance.stop();
  });

  it('App Engine - set account', () => {
    const account: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: false,
    };

    return instance.setAccount(account);
  });

  it('App Engine - get account', () => {
    const spy = spyOn(instance, 'getAccount').and.callThrough();
    instance.getAccount();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - set user data', () => {
    return instance.setUserData(fakeUserData);
  });

  it('App Engine - get user data', () => {
    const spy = spyOn(instance, 'getUserData').and.callThrough();
    instance.getUserData();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - set user me', () => {
    return instance.setUserMe(fakeUserMe);
  });

  it('App Engine - get user me', () => {
    const spy = spyOn(instance, 'getUserMe').and.callThrough();
    instance.getUserMe();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - get base url', () => {
    const spy = spyOn(instance, 'getBaseUrl').and.callThrough();
    instance.getBaseUrl();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - session', () => {
    const spy = spyOn(instance, 'session').and.callThrough();
    instance.session();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - refresh token', () => {
    const spy = spyOn(instance, 'refreshToken').and.callThrough();
    instance.refreshToken();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - register', () => {
    const spy = spyOn(instance, 'register').and.callThrough();
    instance.register('account@email', 'password');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - login', () => {
    const spy = spyOn(instance, 'login').and.callThrough();
    instance.login('account@email', 'password');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - login with Google', () => {
    const spy = spyOn(instance, 'loginWithGoogle').and.callThrough();
    instance.loginWithGoogle('account@email')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e).toEqual('not implement');
      });
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - login with Facebook', () => {
    const spy = spyOn(instance, 'loginWithFacebook').and.callThrough();
    instance.loginWithFacebook();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - request resetting password', () => {
    const spy = spyOn(instance, 'requestResetPassword').and.callThrough();
    instance.requestResetPassword('account@email');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - logout', () => {
    const spy = spyOn(instance, 'logout').and.callThrough();
    instance.logout();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - delete account', () => {
    const spy = spyOn(instance, 'deleteAccount').and.callThrough();
    instance.deleteAccount();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - remove all data', () => {
    const spy = spyOn(instance, 'removeAllData').and.callThrough();
    instance.removeAllData();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestUserData', () => {
    const spy = spyOn(instance, 'requestUserData').and.callThrough();
    instance.requestUserData();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - query device info', () => {
    const spy = spyOn(instance, 'queryDeviceInfo').and.callThrough();
    instance.queryDeviceInfo();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - fire ap mode without provision type', () => {
    const spy = spyOn(instance, 'fireApMode').and.callThrough();
    instance.fireApMode('ssid', 'password', 'WPA2', 'url', 'provToken');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - fire ap mode with provision type', () => {
    const spy = spyOn(instance, 'fireApMode').and.callThrough();
    instance.fireApMode('ssid', 'password', 'WPA2', 'url', 'provToken', 'JIT');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - get firmware list with nothing', () => {
    const spy = spyOn(instance, 'getFirmwareList').and.callThrough();
    instance.getFirmwareList()
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - get firmware list with model string', () => {
    const spy = spyOn(instance, 'getFirmwareList').and.callThrough();
    instance.getFirmwareList('model');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - get firmware list with model array', () => {
    const spy = spyOn(instance, 'getFirmwareList').and.callThrough();
    instance.getFirmwareList(['model', 'array']);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - get historical data with no query string', () => {
    const deviceSn = 'deviceSn1'
    const field = 'H00'
    const spy = spyOn(instance, 'getHistoricalData').and.callThrough();
    instance.getHistoricalData(deviceSn, field)
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - get historical data with query object', () => {
    const deviceSn = 'deviceSn1'
    const field = 'H00'
    const spy = spyOn(instance, 'getHistoricalData').and.callThrough();
    instance.getHistoricalData(deviceSn, field, { end_time: 1532333757675 });
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - refresh single device', () => {
    const spy = spyOn(instance, 'refreshDevice').and.callThrough();
    instance.refreshDevice('device SN');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - refresh all devices', () => {
    const spy = spyOn(instance, 'refreshAllDevices').and.callThrough();
    instance.refreshAllDevices();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - refresh multiple devices', () => {
    const spy = spyOn(instance, 'refreshDevices').and.callThrough();
    instance.refreshDevices(['device SN 1', 'device SN 2', 'device SN 3']);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - filter devices without filter', () => {
    const spy = spyOn(instance, 'filterDevices').and.callThrough();
    instance.filterDevices();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - filter devices with filter', () => {
    const spy = spyOn(instance, 'filterDevices').and.callThrough();
    instance.filterDevices({});
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - refresh single group', () => {
    const spy = spyOn(instance, 'refreshGroup').and.callThrough();
    instance.refreshGroup('group name');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - refresh all groups', () => {
    const spy = spyOn(instance, 'refreshAllGroups').and.callThrough();
    instance.refreshAllGroups();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - refresh multiple groups', () => {
    const spy = spyOn(instance, 'refreshGroups').and.callThrough();
    instance.refreshGroups(['group name 1', 'group name 2', 'group name 3']);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - filter groups without filter', () => {
    const spy = spyOn(instance, 'filterGroups').and.callThrough();
    instance.filterGroups();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - filter groups with filter', () => {
    const spy = spyOn(instance, 'filterGroups').and.callThrough();
    instance.filterGroups({});
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - web socket login', () => {
    const spy = spyOn(instance, 'websocketLogin').and.callThrough();
    instance.websocketLogin();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - request provision token without TTL', () => {
    const spy = spyOn(instance, 'requestProvisionToken').and.callThrough();
    instance.requestProvisionToken();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - request provision token with TTL', () => {
    const spy = spyOn(instance, 'requestProvisionToken').and.callThrough();
    instance.requestProvisionToken(79979);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestGetMe', () => {
    const spy = spyOn(instance, 'requestGetMe').and.callThrough();
    instance.requestGetMe();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestConfig', () => {
    const spy = spyOn(instance, 'requestConfig').and.callThrough();
    instance.requestConfig('device SN', { fields: ['H00', 'H01'] });
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestSet', () => {
    const spy = spyOn(instance, 'requestSet').and.callThrough();
    instance.requestSet('device SN', { H00: 1, H01: 2 });
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestGet', () => {
    const spy = spyOn(instance, 'requestGet').and.callThrough();
    instance.requestGet('device SN');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestOta', () => {
    const spy = spyOn(instance, 'requestOta').and.callThrough();
    instance.requestOta('device SN', 'https://some.where/firmware/download/location', 'cf23df2207d99a74fbe169e3eba035e633b65d94', '4.0.0');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestCalendar', () => {
    const spy = spyOn(instance, 'requestCalendar').and.callThrough();
    instance.requestCalendar('device SN', fakeCanlendar);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestAddUser', () => {
    const fakeUser = {
      email: 'testing@exosite.com',
      role: 'guest'
    };
    const spy = spyOn(instance, 'requestAddUser').and.callThrough();
    instance.requestAddUser('device SN', fakeUser);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestAddSharingDevice', () => {
    const spy = spyOn(instance, 'requestAddSharingDevice').and.callThrough();
    instance.requestAddSharingDevice('a sharing token');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestGetSharingToken', () => {
    const fakeUserRole = {
      role: 'guest'
    };
    const spy = spyOn(instance, 'requestGetSharingToken').and.callThrough();
    instance.requestGetSharingToken('device SN', fakeUserRole);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestRemoveUser', () => {
    const spy = spyOn(instance, 'requestRemoveUser').and.callThrough();
    instance.requestRemoveUser('device SN', 'email@from.somewhere');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestListUser', () => {
    const spy = spyOn(instance, 'requestListUser').and.callThrough();
    instance.requestListUser('device SN');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestListDevice', () => {
    const spy = spyOn(instance, 'requestListDevice').and.callThrough();
    instance.requestListDevice();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestSetProperties', () => {
    const fakeProperties = {
      property1: 'abcd',
      property2: {},
      propertyArray: [],
    };
    const spy = spyOn(instance, 'requestSetProperties').and.callThrough();
    instance.requestSetProperties('device SN', fakeProperties);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestDeleteProperties', () => {
    const spy = spyOn(instance, 'requestDeleteProperties').and.callThrough();
    instance.requestDeleteProperties('device SN', ['property1', 'propertyArray']);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestDeleteDevice', () => {
    const spy = spyOn(instance, 'requestDeleteDevice').and.callThrough();
    instance.requestDeleteDevice('device SN');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestSetGroup', () => {
    const spy = spyOn(instance, 'requestSetGroup').and.callThrough();
    instance.requestSetGroup(fakeGroup);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestGetGroup', () => {
    const spy = spyOn(instance, 'requestGetGroup').and.callThrough();
    instance.requestGetGroup('group name');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestDeleteGroup', () => {
    const spy = spyOn(instance, 'requestDeleteGroup').and.callThrough();
    instance.requestDeleteGroup('group name');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestListGroup', () => {
    const spy = spyOn(instance, 'requestListGroup').and.callThrough();
    instance.requestListGroup();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestSetUserData', () => {
    const spy = spyOn(instance, 'requestSetUserData').and.callThrough();
    instance.requestSetUserData(fakeUserData);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestDeleteUserData', () => {
    const spy = spyOn(instance, 'requestDeleteUserData').and.callThrough();
    instance.requestDeleteUserData(['userData1', 'userData3']);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - requestGetUserData', () => {
    const spy = spyOn(instance, 'requestGetUserData').and.callThrough();
    instance.requestGetUserData();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - has connection', () => {
    const spy = spyOn(instance, 'hasConnection').and.callThrough();
    instance.hasConnection();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - has cloud connection', () => {
    const spy = spyOn(instance, 'hasCloudConnection').and.callThrough();
    instance.hasCloudConnection();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - set websocket callbacks', () => {
    const spy = spyOn(instance, 'setWebsocketCallbacks').and.callThrough();
    instance.setWebsocketCallbacks({
      onOpen: event => { },
      onEvent: event => { },
      onError: event => { },
      onClose: event => { },
    });
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - subscribe websocket event', () => {
    const next = res => { };
    const err = error => { };
    const spy = spyOn(instance, 'subscribe').and.callThrough();
    instance.subscribe('token_expired', next, err);
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - unsubscribe websocket event', () => {
    const spy = spyOn(instance, 'unsubscribe').and.callThrough();
    instance.unsubscribe('token_expired');
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - set dnssd callbacks', () => {
    const spy = spyOn(instance, 'setDnssdCallbacks').and.callThrough();
    instance.setDnssdCallbacks({
      dnssdCallback: (serviceList) => {},
    });
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - watch dnssd', () => {
    const spy = spyOn(instance, 'watchDnssd').and.callThrough();
    instance.watchDnssd();
    expect(spy).toHaveBeenCalled();
  });

  it('App Engine - unwatch dnssd', () => {
    const spy = spyOn(instance, 'unwatchDnssd').and.callThrough();
    instance.unwatchDnssd();
    expect(spy).toHaveBeenCalled();
  });

});
