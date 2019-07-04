import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { NgRedux, NgReduxModule } from '@angular-redux/store';
import { Server } from 'mock-socket';

import { ReduxModule } from './redux-module';
import { AppTasks } from './actions/app-tasks';
import { AuthService } from './services/auth-service';
import { ErrorsService } from './services/errors-service';
import {
  AuthServiceMock,
  ErrorsServiceMock,
} from '../mocks/redux-module.mocks';
import { StateStore } from './store/state-store';
import { AppEngine } from '../core/app-engine';
import { AppEngineTasks } from '../core/tasks/app-engine-tasks';
import { AccountService } from '../core/services/account/account-service';
import { DatabaseService } from '../core/services/storage/db-service';
import { MuranoApiService } from '../core/services/network/murano-api-service';
import { DnssdService } from '../core/services/mdns/dnssd-service';
import { WebSocketMessageDispatcher } from '../core/ws-message-dispatcher';

import { Facebook } from '@ionic-native/facebook';
import { FacebookMock } from '@ionic-native-mocks/facebook';
import { HTTP } from '@ionic-native/http';
import { HTTPMock } from '@ionic-native-mocks/http';
import { WebsocketAuth } from './../core/services/network/ws-auth';
import { AppActions } from './actions/app-actions';

import {
  AccountServiceMock,
  DatabaseServiceMock,
  MuranoApiServiceMock,
  DnssdServiceMock,
  WebSocketMessageDispatcherMock,
} from '../mocks/app-engine.mocks';
import {
  fakeGroup,
  fakeCanlendar,
  fakeUserData,
} from '../mocks/servers.mocks';

describe('Redux module main function test cases', () => {

  let instance: ReduxModule;
  let ngRedux: NgRedux<any>;
  let wsDispatcher: WebSocketMessageDispatcher;
  let appEngineTasks: AppEngineTasks;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        NgReduxModule,
      ],
      providers: [
        { provide: AccountService, useClass: AccountServiceMock },
        { provide: DatabaseService, useClass: DatabaseServiceMock },
        { provide: MuranoApiService, useClass: MuranoApiServiceMock },
        { provide: DnssdService, useClass: DnssdServiceMock },
        WebSocketMessageDispatcher,
        AppEngineTasks,
        AppEngine,
        AppTasks,
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: ErrorsService, useClass: ErrorsServiceMock },
        StateStore,
        ReduxModule,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(ReduxModule);
    ngRedux = injector.get(NgRedux);
    wsDispatcher = injector.get(WebSocketMessageDispatcher);
    appEngineTasks = injector.get(AppEngineTasks);
  });

  it('Create Redux module', () => {
    expect(instance).toBeTruthy();
  });

  describe('Setup redux', () => {

    it('Apply middlewares and configure redux state store', () => {
      const logger = store => next => action => {
        let result = next(action);
        return result;
      };
      instance.applyMiddleWare([logger]);

      instance.configureStore({
        testReducer1: (state = {}, action): any => { return state; },
        testReducer2: (state = {}, action): any => { return state; },
      });

      const state = ngRedux.getState();
      expect(state).toEqual({
        testReducer1: {},
        testReducer2: {},
        core: {
          isInitialized: false,
          account: null,
          isAuthenticated: false,
          userData: {},
          userMe: null,
          devices: {},
          deviceDisplayList: [],
          groups: {},
          groupDisplayList: [],
          dnssdServices: [],
        },
        errors: [],
      });
    });

    it('Replace redux state reducers', () => {
      instance.injectReducer('testReducer1', (state = null, action): any => { return { key: 1232 }; });

      const state = ngRedux.getState();
      expect(state).toEqual({
        testReducer1: {
          key: 1232
        },
        testReducer2: {},
        core: {
          isInitialized: false,
          account: null,
          isAuthenticated: false,
          userData: {},
          userMe: null,
          devices: {},
          deviceDisplayList: [],
          groups: {},
          groupDisplayList: [],
          dnssdServices: [],
        },
        errors: [],
      });
    });

  });

  it('Setup login page', () => {
    instance.setLoginPage(TestPage);
  });

  it('Module start', () => {
    instance.start();
  });

  const tokenExpiredEvent = { event: 'token_expired' };
  const deviceChangeEvent = {
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
  const addDeviceEvent = {
    event: 'add_device',
    data: {
      device: 'device SN',
      owner: 'owner@from.somewhere'
    }
  };
  const deleteDeviceEvent = {
    event: 'del_device',
    data: {
      device: 'device SN',
      owner: 'owner@from.somewhere'
    }
  };
  const setGroupEvent = {
    event: 'set_group',
    data: fakeGroup,
  };
  const deleteGroupEvent = {
    event: 'del_group',
    data: {
      name: 'group name'
    },
  };
  const calendarEvent = {
    event: 'calendar',
    data: {
      device: 'device SN',
      schedules: fakeCanlendar,
    }
  };
  const userDataChangeEvent = {
    event: 'user_data_change',
    data: fakeUserData,
  };
  const unknownEvent = { event: 'UNKNOWN_EVENT', };

  it('Event handling', () => {
    wsDispatcher.onEventReceived(generateFakeMessage(tokenExpiredEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(deviceChangeEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(addDeviceEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(deleteDeviceEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(setGroupEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(deleteGroupEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(calendarEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(userDataChangeEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(unknownEvent));
  });

  it('Event handling - error handling', () => {
    spyOn(appEngineTasks, 'wsEventTokenExpiredTask').and.returnValue(Promise.reject('error'));
    spyOn(appEngineTasks, 'wsEventDeviceChangeTask').and.returnValue(Promise.reject('error'));
    spyOn(appEngineTasks, 'wsEventAddDeviceTask').and.returnValue(Promise.reject('error'));
    spyOn(appEngineTasks, 'wsEventDeleteDeviceTask').and.returnValue(Promise.reject('error'));
    spyOn(appEngineTasks, 'wsEventSetGroupTask').and.returnValue(Promise.reject('error'));
    spyOn(appEngineTasks, 'wsEventDeleteGroupTask').and.returnValue(Promise.reject('error'));
    spyOn(appEngineTasks, 'wsEventCalendarTask').and.returnValue(Promise.reject('error'));
    spyOn(appEngineTasks, 'wsEventUserDataChangeTask').and.returnValue(Promise.reject('error'));

    wsDispatcher.onEventReceived(generateFakeMessage(tokenExpiredEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(deviceChangeEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(addDeviceEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(deleteDeviceEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(setGroupEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(deleteGroupEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(calendarEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(userDataChangeEvent));
    wsDispatcher.onEventReceived(generateFakeMessage(unknownEvent));
  });

  it('Module stop', () => {
    instance.stop();
  });
});

describe('Redux module callbacks test cases', () => {

  let instance: ReduxModule;
  let ngRedux: NgRedux<any>;
  let wsDispatcher: WebSocketMessageDispatcher;
  let appTasks: AppTasks;
  let muranoApiService: MuranoApiService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgReduxModule,
      ],
      providers: [
        { provide: AccountService, useClass: AccountServiceMock },
        { provide: DatabaseService, useClass: DatabaseServiceMock },
        MuranoApiService,
        { provide: DnssdService, useClass: DnssdServiceMock },
        WebSocketMessageDispatcher,
        AppEngineTasks,
        AppEngine,
        AppTasks,
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: ErrorsService, useClass: ErrorsServiceMock },
        StateStore,
        ReduxModule,
        { provide: Facebook, useClass: FacebookMock },
        { provide: HTTP, useClass: HTTPMock },
        {
          provide: WebsocketAuth, useFactory: () => {
            return {
              getAuthRequest: () => {
                return Promise.resolve({
                  id: 'ws-request-auth',
                  request: 'login',
                  data: {
                    token: 'testing token',
                  },
                });
              },
              processResponse: (res) => { return Promise.resolve(); }
            };
          }
        },
      ],
    });
    const injector = getTestBed();
    instance = injector.get(ReduxModule);
    ngRedux = injector.get(NgRedux);
    wsDispatcher = injector.get(WebSocketMessageDispatcher);
    appTasks = injector.get(AppTasks);
    muranoApiService = injector.get(MuranoApiService);

    return Promise.resolve()
      .then(() => {
        muranoApiService.setup({
          solutionId: 'unit-test',
          useHttp: false,
        });
        return muranoApiService.start();
      })
      .then(() => instance.configureStore([]))
      .then(() => instance.start());
  });

  it('Trigger starting tasks callback', () => {
    const fakeUser = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
    };
    ngRedux.dispatch(AppActions.action(AppActions.SESSION_DONE, fakeUser));
  });

  it('Trigger starting tasks callback - error handling', () => {
    spyOn(appTasks, 'wsRequestProvisionTokenTask').and.returnValue(Promise.reject('error'));
    const fakeUser = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
    };
    ngRedux.dispatch(AppActions.action(AppActions.SESSION_DONE, fakeUser));
  });

  it('Trigger reconnect callback', () => {
    const server = new Server(`wss://${muranoApiService.getBaseUrl()}/api:1/phone`);
    server.on('message', data => {
      let message;
      try {
        message = JSON.parse(data);
      } catch (e) {
        message = data;
      }
      server.send(JSON.stringify({
        id: message.id,
        response: 'login',
        status: 'error',
        code: 100,
        message: 'Invalid Token',
      }));
      server.close();
    });
    return appTasks.wsRequestLoginTask()
      .catch(e => expect(e).toBeDefined())
      .then(() => server.stop());
  });

});

@Component({
  template: '<b>Test page</b>'
})
class TestPage {
}

const generateFakeMessage = (event) => {
  return {
    data: JSON.stringify(event),
  };
}