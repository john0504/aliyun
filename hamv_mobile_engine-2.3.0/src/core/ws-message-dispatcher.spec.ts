import { TestBed, getTestBed } from '@angular/core/testing';

import { WebSocketMessageDispatcher } from './ws-message-dispatcher';
import { AppEngineTasks } from './tasks/app-engine-tasks';
import { AccountService } from './services/account/account-service';
import { DatabaseService } from './services/storage/db-service';
import { MuranoApiService } from './services/network/murano-api-service';
import { DnssdService } from './services/mdns/dnssd-service';

import {
  AccountServiceMock,
  DatabaseServiceMock,
  MuranoApiServiceMock,
  DnssdServiceMock,
} from '../mocks/app-engine.mocks';

import { WebsocketEventType } from './models/ws-message';
import {
  fakeCanlendar,
  fakeGroup,
  fakeUserData,
} from '../mocks/servers.mocks';

describe('AppEngine test cases', () => {

  let instance: WebSocketMessageDispatcher;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AccountService, useClass: AccountServiceMock },
        { provide: DatabaseService, useClass: DatabaseServiceMock },
        { provide: MuranoApiService, useClass: MuranoApiServiceMock },
        { provide: DnssdService, useClass: DnssdServiceMock },
        AppEngineTasks,
        WebSocketMessageDispatcher,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(WebSocketMessageDispatcher);
  });

  it('Subscribe web socket event', () => {
    const next = res => { };
    const err = error => { };
    const spy = spyOn(instance, 'subscribe').and.callThrough();
    instance.subscribe('token_expired', next, err);
    expect(spy).toHaveBeenCalled();
  });

  it('Unsubscribe websocket event', () => {
    const next = res => { };
    const err = error => { };
    instance.subscribe('token_expired', next, err);
    const spy = spyOn(instance, 'unsubscribe').and.callThrough();
    instance.unsubscribe('token_expired');
    expect(spy).toHaveBeenCalled();
  });

  it('Unsubscribe websocket event - never subscribe', () => {
    const spy = spyOn(instance, 'unsubscribe').and.callThrough();
    instance.unsubscribe('token_expired');
    expect(spy).toHaveBeenCalled();
  });

  it('Websocket event - normal event coming', () => {
    const err = error => { };
    const tokenExpiredNext = res => {
      expect(res.event).toEqual(WebsocketEventType.TOKEN_EXPIRED);
    };
    instance.subscribe(WebsocketEventType.TOKEN_EXPIRED, tokenExpiredNext, err);
    const deviceChangeNext = res => {
      expect(res.event).toEqual(WebsocketEventType.DEVICE_CHANGE);
      expect(res.data.device).toEqual('device SN');
    };
    instance.subscribe(WebsocketEventType.DEVICE_CHANGE, deviceChangeNext, err);
    const addDeviceNext = res => {
      expect(res.event).toEqual(WebsocketEventType.ADD_DEVICE);
      expect(res.data.device).toEqual('device SN');
    };
    instance.subscribe(WebsocketEventType.ADD_DEVICE, addDeviceNext, err);
    const deleteDeviceNext = res => {
      expect(res.event).toEqual(WebsocketEventType.DELETE_DEVICE);
      expect(res.data.device).toEqual('device SN');
    };
    instance.subscribe(WebsocketEventType.DELETE_DEVICE, deleteDeviceNext, err);
    const setGroupNext = res => {
      expect(res.event).toEqual(WebsocketEventType.SET_GROUP);
    };
    instance.subscribe(WebsocketEventType.SET_GROUP, setGroupNext, err);
    const deleteGroupNext = res => {
      expect(res.event).toEqual(WebsocketEventType.DELETE_GROUP);
    };
    instance.subscribe(WebsocketEventType.DELETE_GROUP, deleteGroupNext, err);
    const calendarNext = res => {
      expect(res.event).toEqual(WebsocketEventType.CALENDAR);
      expect(res.data.device).toEqual('device SN');
    };
    instance.subscribe(WebsocketEventType.CALENDAR, calendarNext, err);
    const userDataChangeNext = res => {
      expect(res.event).toEqual(WebsocketEventType.USER_DATA_CHANGE);
    };
    instance.subscribe(WebsocketEventType.USER_DATA_CHANGE, userDataChangeNext, err);

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
        schedules: fakeCanlendar
      }
    };
    const userDataChangeEvent = {
      event: 'user_data_change',
      data: fakeUserData,
    };
    const unknownEvent = { event: 'unknown', };

    instance.onEventReceived(generateFakeMessage(tokenExpiredEvent));
    instance.onEventReceived(generateFakeMessage(deviceChangeEvent));
    instance.onEventReceived(generateFakeMessage(addDeviceEvent));
    instance.onEventReceived(generateFakeMessage(deleteDeviceEvent));
    instance.onEventReceived(generateFakeMessage(setGroupEvent));
    instance.onEventReceived(generateFakeMessage(deleteGroupEvent));
    instance.onEventReceived(generateFakeMessage(calendarEvent));
    instance.onEventReceived(generateFakeMessage(userDataChangeEvent));
    instance.onEventReceived(generateFakeMessage(unknownEvent));
  });

  it('Websocket event - unknown event comming', () => {
    const unknownEvent = { event: 'unknown', };
    instance.onEventReceived(generateFakeMessage(unknownEvent));
  });

  it('Websocket event - message without data', () => {
    instance.onEventReceived({ data: undefined, });
  });

  it('Websocket event - error handling', () => {
    const err = error => {
      expect(error).toBeDefined();
      expect(error.message).toEqual('on purpose error');
    };
    const tokenExpiredNext = res => {
      expect(res.event).toEqual(WebsocketEventType.TOKEN_EXPIRED);
      throw new Error('on purpose error');
    };
    instance.subscribe(WebsocketEventType.TOKEN_EXPIRED, tokenExpiredNext, err);

    const tokenExpiredEvent = { event: 'token_expired' };
    instance.onEventReceived(generateFakeMessage(tokenExpiredEvent));
  });

  it('Websocket event - no error handling', () => {
    const err = error => { };
    const tokenExpiredNext = res => {
      expect(res.event).toEqual(WebsocketEventType.TOKEN_EXPIRED);
      instance.unsubscribe(WebsocketEventType.TOKEN_EXPIRED);
      throw new Error('on purpose error');
    };
    instance.subscribe(WebsocketEventType.TOKEN_EXPIRED, tokenExpiredNext, err);

    const tokenExpiredEvent = { event: 'token_expired' };
    instance.onEventReceived(generateFakeMessage(tokenExpiredEvent));
  });

});

function generateFakeMessage(event) {
  return {
    data: JSON.stringify(event),
  };
}