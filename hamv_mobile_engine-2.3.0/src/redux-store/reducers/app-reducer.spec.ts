import { cloneDeep } from 'lodash';
import { AppActions } from '../actions/app-actions';
import appReducer from './app-reducer';
import { AppState } from '../store/app-state';
import {
  fakeDevice,
  fakeGroup,
  fakeUserData,
  fakeUserMe,
} from '../../mocks/servers.mocks';

describe('App reducer', () => {

  const getInitialState = () => {
    return {
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
    };
  };

  it('should return the initial state', () => {
    expect(appReducer(undefined, {})).toEqual({
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
    });
  });

  it('should handle APP_INITIALIZE', () => {
    const action = AppActions.action(AppActions.APP_INITIALIZE);
    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle APP_INITIALIZE_DONE', () => {
    const action = AppActions.action(AppActions.APP_INITIALIZE_DONE);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { isInitialized: true }));
  });

  it('should handle APP_INITIALIZE_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.APP_INITIALIZE_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle GET_ACCOUNT_DONE', () => {
    const account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
    };
    const action = AppActions.action(AppActions.GET_ACCOUNT_DONE, account);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { account }));
  });

  it('should handle GET_ACCOUNT_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.GET_ACCOUNT_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle SET_ACCOUNT_DONE', () => {
    const account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
    };
    const action = AppActions.action(AppActions.SET_ACCOUNT_DONE, account);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { account }));
  });

  it('should handle SET_ACCOUNT_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.GET_ACCOUNT_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_PROVISION_TOKEN_DONE', () => {
    const account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: false,
      pTokenBundle: {
        token: 'abc',
      },
    };
    const action = AppActions.action(AppActions.WS_REQUEST_PROVISION_TOKEN_DONE, account);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { account }));
  });

  it('should handle WS_REQUEST_PROVISION_TOKEN_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.WS_REQUEST_PROVISION_TOKEN_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle REGISTER_DONE', () => {
    const account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: false,
    };
    const action = AppActions.action(AppActions.REGISTER_DONE, account);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { account, isAuthenticated: true }));
  });

  it('should handle REGISTER_DONE - error handling', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.REGISTER_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle LOGIN_DONE', () => {
    const account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: false,
    };
    const action = AppActions.action(AppActions.LOGIN_DONE, account);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { account, isAuthenticated: true }));
  });

  it('should handle LOGIN_DONE - error handling', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.LOGIN_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle LOGIN_WITH_FB_DONE', () => {
    const account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-facebook',
      isLoggedIn: false,
    };
    const action = AppActions.action(AppActions.LOGIN_WITH_FB_DONE, account);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { account, isAuthenticated: true }));
  });

  it('should handle LOGIN_WITH_FB_DONE - error handling', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.LOGIN_WITH_FB_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle REFRESH_TOKEN_DONE', () => {
    const account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: false,
    };
    const action = AppActions.action(AppActions.REFRESH_TOKEN_DONE, account);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { account, isAuthenticated: true }));
  });

  it('should handle REFRESH_TOKEN_DONE - error handling', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.REFRESH_TOKEN_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle SESSION_DONE', () => {
    const account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: false,
    };
    const action = AppActions.action(AppActions.SESSION_DONE, account);
    expect(appReducer(getInitialState(), action))
      .toEqual(Object.assign({}, getInitialState(), { account, isAuthenticated: true }));
  });

  it('should handle SESSION_DONE - error handling', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.SESSION_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_TOKEN_EXPIRED', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_TOKEN_EXPIRED);
    expect(appReducer(beforeState, action))
      .toEqual(Object.assign({}, getInitialState(), { isAuthenticated: false }));
  });

  it('should handle LOGOUT_DONE', () => {
    const logoutAccount = {
      account: 'testing@exosite.com',
      token: null,
      isOAuth: false,
      authProvider: null,
      isLoggedIn: false,
      pTokenBundle: null,
    };
    const beforeState = {
      isInitialized: true,
      account: {
        account: 'testing@exosite.com',
        token: 'a token',
        isOAuth: true,
        authProvider: 'auth-provider-facebook',
        isLoggedIn: false,
      },
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.LOGOUT_DONE, logoutAccount);

    expect(appReducer(beforeState, action))
      .toEqual(Object.assign({}, getInitialState(), { account: logoutAccount, isInitialized: true }));
  });

  it('should handle LOGOUT_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.LOGOUT_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle DELETE_ACCOUNT_DONE', () => {
    const beforeState = {
      isInitialized: true,
      account: {
        account: 'testing@exosite.com',
        token: 'a token',
        isOAuth: true,
        authProvider: 'auth-provider-facebook',
        isLoggedIn: false,
      },
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.DELETE_ACCOUNT_DONE);

    expect(appReducer(beforeState, action))
      .toEqual(Object.assign({}, getInitialState(), { isInitialized: true }));
  });

  it('should handle DELETE_ACCOUNT_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.DELETE_ACCOUNT_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle REMOVE_ALL_DATA_DONE', () => {
    const beforeState = {
      isInitialized: true,
      account: {
        account: 'testing@exosite.com',
        token: 'a token',
        isOAuth: true,
        authProvider: 'auth-provider-facebook',
        isLoggedIn: false,
      },
      isAuthenticated: true,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.REMOVE_ALL_DATA_DONE);

    expect(appReducer(beforeState, action))
      .toEqual(Object.assign({}, getInitialState(), { isInitialized: true }));
  });

  it('should handle REMOVE_ALL_DATA_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.REMOVE_ALL_DATA_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle REFRESH_DEVICES_DONE', () => {
    const testDevice = cloneDeep(fakeDevice);
    const refreshData = { 'a device id': testDevice };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.REFRESH_DEVICES_DONE, refreshData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle REFRESH_DEVICES_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.REFRESH_DEVICES_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle FILTER_DEVICES_DONE', () => {
    const refreshData = ['a device id'];
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: ['a device id'],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.FILTER_DEVICES_DONE, refreshData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle FILTER_DEVICES_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.FILTER_DEVICES_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle REFRESH_GROUPS_DONE', () => {
    const testGroup = cloneDeep(fakeGroup);
    const refreshData = { 'a group name': testGroup };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: { 'a group name': testGroup },
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.REFRESH_GROUPS_DONE, refreshData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle REFRESH_GROUPS_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.REFRESH_GROUPS_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle FILTER_GROUPS_DONE', () => {
    const refreshData = ['a group name'];
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.FILTER_GROUPS_DONE, refreshData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle FILTER_GROUPS_DONE - error handling', () => {
    const errorAction = AppActions.action(AppActions.FILTER_GROUPS_DONE, undefined, true);
    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_SET_DONE', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const commands = { sn: 'a device id', commands: { H1F: 58 } };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
            H1F: 58,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {
            somePorperty: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_SET_DONE, commands);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_DONE - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const commands = { sn: 'a device id', commands: { H1F: 58 } };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_SET_DONE, commands, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_DONE - no device', () => {
    const commands = { sn: 'a device id', commands: { H1F: 58 } };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_SET_DONE, commands);

    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_CALENDAR_DONE', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const newSchedules = {
      sn: 'a device id',
      calendar: [
        {
          name: 'name test 2',
          start: '14:24',
          end: '13:34',
          days: [1, 2, 3, 7],
          active: 0,
          active_until: 1477377969,
          esh: {
            H30: 1
          }
        },
      ]
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test 2',
              start: '14:24',
              end: '13:34',
              days: [1, 2, 3, 7],
              active: 0,
              active_until: 1477377969,
              esh: {
                H30: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {
            somePorperty: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_CALENDAR_DONE, newSchedules);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_CALENDAR_DONE - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const newSchedules = {
      sn: 'a device id',
      calendar: [
        {
          name: 'name test 2',
          start: '14:24',
          end: '13:34',
          days: [1, 2, 3, 7],
          active: 0,
          active_until: 1477377969,
          esh: {
            H30: 1
          }
        },
      ]
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_CALENDAR_DONE, newSchedules, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_CALENDAR_DONE - no device', () => {
    const newSchedules = {
      sn: 'a device id',
      calendar: [
        {
          name: 'name test 2',
          start: '14:24',
          end: '13:34',
          days: [1, 2, 3, 7],
          active: 0,
          active_until: 1477377969,
          esh: {
            H30: 1
          }
        },
      ]
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_CALENDAR_DONE, newSchedules);

    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_ADD_USER_DONE', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const addUser = {
      sn: 'a device id',
      user: { email: 'testing3@exosite.com', role: 'customer' },
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
            { email: 'testing3@exosite.com', role: 'customer' },
          ],
          properties: {
            somePorperty: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_ADD_USER_DONE, addUser);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_ADD_USER_DONE - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const addUser = {
      sn: 'a device id',
      user: { email: 'testing3@exosite.com', role: 'customer' },
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_ADD_USER_DONE, addUser, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_ADD_USER_DONE - no device', () => {
    const addUser = {
      sn: 'a device id',
      user: { email: 'testing3@exosite.com', role: 'customer' },
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_ADD_USER_DONE, addUser);

    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_REMOVE_USER_DONE', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
            { email: 'testing3@exosite.com', role: 'customer' },
          ],
          properties: {
            somePorperty: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const removeUser = {
      sn: 'a device id',
      email: 'testing3@exosite.com',
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {
            somePorperty: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_REMOVE_USER_DONE, removeUser);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_REMOVE_USER_DONE - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const removeUser = {
      sn: 'a device id',
      email: 'testing3@exosite.com',
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_REMOVE_USER_DONE, removeUser, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_REMOVE_USER_DONE - no device', () => {
    const removeUser = {
      sn: 'a device id',
      email: 'testing3@exosite.com',
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_REMOVE_USER_DONE, removeUser);

    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_REMOVE_USER_DONE - no user', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const removeUser = {
      sn: 'a device id',
      email: 'testing3@exosite.com',
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_REMOVE_USER_DONE, removeUser);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_PROPERTIES', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const newPorperties = {
      sn: 'a device id',
      properties: {
        deviceDisplayName: 'abc',
      },
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {
            somePorperty: 'abc',
            deviceDisplayName: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES, newPorperties);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_PROPERTIES - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const newPorperties = {
      sn: 'a device id',
      properties: {
        deviceDisplayName: 'abc',
      },
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES, newPorperties, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_PROPERTIES - no device', () => {
    const newPorperties = {
      sn: 'a device id',
      properties: {
        deviceDisplayName: 'abc',
      },
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES, newPorperties);

    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_SET_PROPERTIES_DONE', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const newPorperties = {
      sn: 'a device id',
      properties: {
        deviceDisplayName: 'abc',
      },
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {
            somePorperty: 'abc',
            deviceDisplayName: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES_DONE, newPorperties);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_PROPERTIES_DONE - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const newPorperties = {
      sn: 'a device id',
      properties: {
        deviceDisplayName: 'abc',
      },
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES_DONE, newPorperties, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_PROPERTIES_DONE - no device', () => {
    const newPorperties = {
      sn: 'a device id',
      properties: {
        deviceDisplayName: 'abc',
      },
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES_DONE, newPorperties);

    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_DELETE_PROPERTIES', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {
            deviceDisplayName: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const deletedProperties = {
      sn: 'a device id',
      properties: ['deviceDisplayName'],
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {}
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_DELETE_PROPERTIES, deletedProperties);
    const r = appReducer(beforeState, action);
    expect(r).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_PROPERTIES - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const deletedProperties = {
      sn: 'a device id',
      properties: ['deviceDisplayName'],
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_DELETE_PROPERTIES, deletedProperties, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_PROPERTIES - no device', () => {
    const deletedProperties = {
      sn: 'a device id',
      properties: ['deviceDisplayName'],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES_DONE, deletedProperties);

    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_DELETE_PROPERTIES_DONE', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {
            deviceDisplayName: 'abc',
          }
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const deletedProperties = {
      sn: 'a device id',
      properties: ['deviceDisplayName'],
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {
        'a device id': {
          device: 'a device id',
          connected: 1,
          device_state: 'idle',
          profile: {
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
          },
          calendar: [
            {
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 1,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            },
          ],
          status: {
            H00: 0,
          },
          fields: [
            "H00", "H01", "H02", "H03",
            "H04", "H05", "H0E", "H0F",
            "H10", "H11", "H14", "H17",
            "H20", "H21", "H28", "H29"
          ],
          users: [
            { email: 'testing@exosite.com', role: 'owner' },
          ],
          properties: {}
        }
      },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_DELETE_PROPERTIES_DONE, deletedProperties);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_PROPERTIES_DONE - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const deletedProperties = {
      sn: 'a device id',
      properties: ['deviceDisplayName'],
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_DELETE_PROPERTIES_DONE, deletedProperties, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_PROPERTIES_DONE - no device', () => {
    const deletedProperties = {
      sn: 'a device id',
      properties: ['deviceDisplayName'],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_DELETE_PROPERTIES_DONE, deletedProperties);

    expect(appReducer(getInitialState(), errorAction)).toEqual(getInitialState());
  });

  it('should handle WS_EVENT_DELETE_DEVICE', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const deletedDeviceEvent = {
      event: 'del_device',
      data: {
        device: 'a device id',
        owner: 'testing@exosite.com'
      }
    };
    const expectedResult = {
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
    };
    const action = AppActions.action(AppActions.WS_EVENT_DELETE_DEVICE, deletedDeviceEvent);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_EVENT_DELETE_DEVICE - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const deletedDeviceEvent = {
      event: 'del_device',
      data: {
        device: 'a device id',
        owner: 'testing@exosite.com'
      }
    };
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_EVENT_DELETE_DEVICE, deletedDeviceEvent, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_DEVICE_DONE', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const deletedDeviceRequest = 'a device id';
    const expectedResult = {
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
    };
    const action = AppActions.action(AppActions.WS_REQUEST_DELETE_DEVICE_DONE, deletedDeviceRequest);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_DEVICE_DONE - error handling', () => {
    const testDevice = cloneDeep(fakeDevice);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': testDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const deletedDeviceRequest = 'a device id';
    const resultDevice = cloneDeep(fakeDevice);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: { 'a device id': resultDevice },
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const errorAction = AppActions.action(AppActions.WS_REQUEST_DELETE_DEVICE_DONE, deletedDeviceRequest, true);

    expect(appReducer(beforeState, errorAction)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_GROUP', () => {
    const testGroup = cloneDeep(fakeGroup);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {
        'a group name': {
          name: 'a group name',
          devices: ['abc'],
          properties: {
            bla: 'blub'
          }
        }
      },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_SET_GROUP, testGroup);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_GROUP', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {
        'a group name': {
          name: 'a group name',
          devices: ['cdefg'],
          properties: {
            bla: 'bla',
            blb: 'blb'
          }
        }
      },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const testGroup = cloneDeep(fakeGroup);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {
        'a group name': {
          name: 'a group name',
          devices: ['abc'],
          properties: {
            bla: 'blub'
          }
        }
      },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_SET_GROUP, testGroup);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_GROUP - error handling', () => {
    const testGroup = cloneDeep(fakeGroup);
    const action = AppActions.action(AppActions.WS_REQUEST_SET_GROUP, testGroup, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_SET_GROUP_DONE', () => {
    const testGroup = cloneDeep(fakeGroup);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {
        'a group name': {
          name: 'a group name',
          devices: ['abc'],
          properties: {
            bla: 'blub'
          }
        }
      },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_SET_GROUP_DONE, testGroup);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_GROUP_DONE', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {
        'a group name': {
          name: 'a group name',
          devices: ['cdefg'],
          properties: {
            bla: 'bla',
            blb: 'blb'
          }
        }
      },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const testGroup = cloneDeep(fakeGroup);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {
        'a group name': {
          name: 'a group name',
          devices: ['abc'],
          properties: {
            bla: 'blub'
          }
        }
      },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_SET_GROUP_DONE, testGroup);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_GROUP_DONE - error handling', () => {
    const testGroup = cloneDeep(fakeGroup);
    const action = AppActions.action(AppActions.WS_REQUEST_SET_GROUP_DONE, testGroup, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle WS_EVENT_DELETE_GROUP', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {
        'a group name': {
          name: 'a group name',
          devices: ['abc'],
          properties: {
            bla: 'blub'
          }
        }
      },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const deleteGroupEvent = {
      event: 'del_group',
      data: {
        name: 'a group name',
      }
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_EVENT_DELETE_GROUP, deleteGroupEvent);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_EVENT_DELETE_GROUP - error handling', () => {
    const testGroup = cloneDeep(fakeGroup);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: { 'a group name': testGroup },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const deleteGroupEvent = {
      event: 'del_group',
      data: {
        name: 'a group name',
      }
    };
    const resultGroup = cloneDeep(fakeGroup);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: { 'a group name': resultGroup },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_EVENT_DELETE_GROUP, deleteGroupEvent, true);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_GROUP_DONE', () => {
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {
        'a group name': {
          name: 'a group name',
          devices: ['abc'],
          properties: {
            bla: 'blub'
          }
        }
      },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const deleteGroupRequest = 'a group name';
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_DELETE_GROUP_DONE, deleteGroupRequest);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_GROUP_DONE - error handling', () => {
    const testGroup = cloneDeep(fakeGroup);
    const beforeState = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: { 'a group name': testGroup },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const deleteGroupRequest = 'a group name';
    const resultGroup = cloneDeep(fakeGroup);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: { 'a group name': resultGroup },
      groupDisplayList: ['a group name'],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_DELETE_GROUP_DONE, deleteGroupRequest, true);

    expect(appReducer(beforeState, action)).toEqual(expectedResult);
  });

  it('should handle UPDATE_DNSSD_LIST', () => {
    const dnssdList = [{
      domain: 'string',
      type: 'string',
      name: 'string',
      port: 43343,
      hostname: 'string',
      ipv4Addresses: [],
      ipv6Addresses: [],
      txtRecord: {
        someInfo: 'something here'
      },
    }];
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [{
        domain: 'string',
        type: 'string',
        name: 'string',
        port: 43343,
        hostname: 'string',
        ipv4Addresses: [],
        ipv6Addresses: [],
        txtRecord: {
          someInfo: 'something here'
        },
      }],
    };
    const action = AppActions.action(AppActions.UPDATE_DNSSD_LIST, dnssdList);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle GET_USER_DATA_DONE', () => {
    const testUserData = cloneDeep(fakeUserData);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {
        userData1: 'a group name',
        userData2: ['abc'],
        userData3: {
          bla: 'blub'
        }
      },
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.GET_USER_DATA_DONE, testUserData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle GET_USER_DATA_DONE - error handling', () => {
    const testUserData = cloneDeep(fakeUserData);
    const action = AppActions.action(AppActions.GET_USER_DATA_DONE, testUserData, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle SET_USER_DATA_DONE', () => {
    const testUserData = cloneDeep(fakeUserData);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {
        userData1: 'a group name',
        userData2: ['abc'],
        userData3: {
          bla: 'blub'
        }
      },
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.SET_USER_DATA_DONE, testUserData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle SET_USER_DATA_DONE - error handling', () => {
    const testUserData = cloneDeep(fakeUserData);
    const action = AppActions.action(AppActions.SET_USER_DATA_DONE, testUserData, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_SET_USER_DATA_DONE', () => {
    const testUserData = cloneDeep(fakeUserData);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {
        userData1: 'a group name',
        userData2: ['abc'],
        userData3: {
          bla: 'blub'
        }
      },
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_SET_USER_DATA_DONE, testUserData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_SET_USER_DATA_DONE - error handling', () => {
    const testUserData = cloneDeep(fakeUserData);
    const action = AppActions.action(AppActions.WS_REQUEST_SET_USER_DATA_DONE, testUserData, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_DELETE_USER_DATA_DONE', () => {
    const testUserData = cloneDeep(fakeUserData);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {
        userData1: 'a group name',
        userData2: ['abc'],
        userData3: {
          bla: 'blub'
        }
      },
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_DELETE_USER_DATA_DONE, testUserData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_DELETE_USER_DATA_DONE - error handling', () => {
    const testUserData = cloneDeep(fakeUserData);
    const action = AppActions.action(AppActions.WS_REQUEST_DELETE_USER_DATA_DONE, testUserData, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_GET_USER_DATA_DONE', () => {
    const testUserData = cloneDeep(fakeUserData);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {
        userData1: 'a group name',
        userData2: ['abc'],
        userData3: {
          bla: 'blub'
        }
      },
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_GET_USER_DATA_DONE, testUserData);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_GET_USER_DATA_DONE - error handling', () => {
    const testUserData = cloneDeep(fakeUserData);
    const action = AppActions.action(AppActions.WS_REQUEST_GET_USER_DATA_DONE, testUserData, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle WS_EVENT_USER_DATA_CHANGE', () => {
    const testUserData = cloneDeep(fakeUserData);
    const userDataChangeEvent = {
      data: testUserData
    };
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {
        userData1: 'a group name',
        userData2: ['abc'],
        userData3: {
          bla: 'blub'
        }
      },
      userMe: null,
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_EVENT_USER_DATA_CHANGE, userDataChangeEvent);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle WS_EVENT_USER_DATA_CHANGE - error handling', () => {
    const testUserData = cloneDeep(fakeUserData);
    const userDataChangeEvent = {
      data: testUserData
    };
    const action = AppActions.action(AppActions.WS_EVENT_USER_DATA_CHANGE, userDataChangeEvent, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle GET_USER_ME_DONE', () => {
    const testUserMe = cloneDeep(fakeUserMe);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: {
        alexa_link: {
          status: 1,
        },
        googlehome_link: {
          status: 1,
        },
        id: '0123456789ABCDEF',
        email: 'testing@exosite.com',
        name: 'testing@exosite.com',
        status: 1,
      },
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.GET_USER_ME_DONE, testUserMe);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle GET_USER_ME_DONE - error handling', () => {
    const testUserMe = cloneDeep(fakeUserMe);
    const action = AppActions.action(AppActions.GET_USER_ME_DONE, testUserMe, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle SET_USER_ME_DONE', () => {
    const testUserMe = cloneDeep(fakeUserMe);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: {
        alexa_link: {
          status: 1,
        },
        googlehome_link: {
          status: 1,
        },
        id: '0123456789ABCDEF',
        email: 'testing@exosite.com',
        name: 'testing@exosite.com',
        status: 1,
      },
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.SET_USER_ME_DONE, testUserMe);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle SET_USER_ME_DONE - error handling', () => {
    const testUserMe = cloneDeep(fakeUserMe);
    const action = AppActions.action(AppActions.SET_USER_ME_DONE, testUserMe, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

  it('should handle WS_REQUEST_GET_ME_DONE', () => {
    const testUserMe = cloneDeep(fakeUserMe);
    const expectedResult = {
      isInitialized: false,
      account: null,
      isAuthenticated: false,
      userData: {},
      userMe: {
        alexa_link: {
          status: 1,
        },
        googlehome_link: {
          status: 1,
        },
        id: '0123456789ABCDEF',
        email: 'testing@exosite.com',
        name: 'testing@exosite.com',
        status: 1,
      },
      devices: {},
      deviceDisplayList: [],
      groups: {},
      groupDisplayList: [],
      dnssdServices: [],
    };
    const action = AppActions.action(AppActions.WS_REQUEST_GET_ME_DONE, testUserMe);

    expect(appReducer(getInitialState(), action)).toEqual(expectedResult);
  });

  it('should handle WS_REQUEST_GET_ME_DONE - error handling', () => {
    const testUserMe = cloneDeep(fakeUserMe);
    const action = AppActions.action(AppActions.WS_REQUEST_GET_ME_DONE, testUserMe, true);

    expect(appReducer(getInitialState(), action)).toEqual(getInitialState());
  });

});