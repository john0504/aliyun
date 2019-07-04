import { Server } from 'mock-socket';

import { WebsocketRequestType } from '../core/models/ws-message';

export const fakeUserMe = {
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
};

export const fakeDevice = {
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
};

export const fakeGroup = {
  name: 'a group name',
  devices: ['abc'],
  properties: {
    bla: 'blub'
  }
};

export const fakeUserData = {
  userData1: 'a group name',
  userData2: ['abc'],
  userData3: {
    bla: 'blub'
  }
};

export const fakeDeviceList = [
  {
    device: 'a device id',
    role: 'guest',
    owner: 'testing@exosite.com',
    properties: {
      deviceDisplayName: 'abc',
    },
  },
];

export const fakeUserList = [
  {
    email: 'testing@exosite.com',
    role: 'guest'
  },
];

export const fakeSharingToken = {
  token: 'a sharing token',
  url: 'a sharing url'
};

export const fakeCanlendar = [
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
];

export const setupWsServer = (url) => {
  const mockServer = new Server(url);
  mockServer.on('connection', server => {
    console.log('WS Message connection from client');
  });
  mockServer.on('message', data => {
    let message;
    try {
      message = JSON.parse(data);
    } catch (e) {
      message = data;
    }
    if (message.request !== WebsocketRequestType.LOGIN)
      console.log('WS Message received -> ', message);
    switch (message.request) {
      case WebsocketRequestType.LOGIN:
        if (message.data && 'a valid token' === message.data.token) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.LOGIN,
            status: 'ok',
          }));
        } else {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.LOGIN,
            status: 'error',
            code: 100,
            message: 'Invalid Token',
          }));
          mockServer.close();
        }
        break;
      case WebsocketRequestType.PROVISION_TOKEN:
        const ttl = message.data && message.data.expires_in > 0 ? message.data.expires_in : 432000;
        const expiresIn = ((new Date().getTime() / 1000) | 0) + ttl;
        mockServer.send(JSON.stringify({
          id: message.id,
          response: WebsocketRequestType.PROVISION_TOKEN,
          status: 'ok',
          data: {
            token: 'a provision token',
            expires_in: expiresIn,
          },
        }));
        break;
      case WebsocketRequestType.GET_ME:
        mockServer.send(JSON.stringify({
          id: message.id,
          response: WebsocketRequestType.GET_ME,
          status: 'ok',
          data: fakeUserMe,
        }));
        break;
      case WebsocketRequestType.CONFIG:
        if (message.device && message.data && message.data.fields &&
          Array.isArray(message.data.fields)) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.CONFIG,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.SET:
        if (message.device && message.data) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.SET,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.GET:
        if (message.device) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.GET,
            status: 'ok',
            data: fakeDevice,
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.OTA:
        if (message.device && message.data && message.data.url &&
          message.data.sha1 && message.data.last_firmware) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.OTA,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.CALENDAR:
        if (message.device && message.data && Array.isArray(message.data)) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.CALENDAR,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.GET_SHARING_TOKEN:
      case WebsocketRequestType.ADD_USER:
        if (message.device && message.data && message.data.email &&
          message.data.role) {
          if (message.data.role === 'moreThan10') {
            mockServer.send(JSON.stringify({
              id: message.id,
              response: WebsocketRequestType.ADD_USER,
              status: 'error',
              code: 101,
              message: 'limit reached',
            }));
          } else {
            mockServer.send(JSON.stringify({
              id: message.id,
              response: WebsocketRequestType.ADD_USER,
              status: 'ok',
            }));
          }
        } else if (message.device && message.data && message.data.role) {
          if (message.data.role === 'moreThan10') {
            mockServer.send(JSON.stringify({
              id: message.id,
              response: WebsocketRequestType.ADD_USER,
              status: 'error',
              code: 101,
              message: 'limit reached',
            }));
          } else {
            mockServer.send(JSON.stringify({
              id: message.id,
              response: WebsocketRequestType.ADD_USER,
              status: 'ok',
              data: fakeSharingToken,
            }));
          }
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.ADD_SHARING_DEVICE:
        if (message.data && message.data.token) {
          if (message.data.token === 'moreThan10') {
            mockServer.send(JSON.stringify({
              id: message.id,
              response: WebsocketRequestType.ADD_SHARING_DEVICE,
              status: 'error',
              code: 101,
              message: 'limit reached',
            }));
          } else {
            mockServer.send(JSON.stringify({
              id: message.id,
              response: WebsocketRequestType.ADD_SHARING_DEVICE,
              status: 'ok',
            }));
          }
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.REMOVE_USER:
        if (message.data && message.data.email) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.REMOVE_USER,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.LIST_USER:
        if (message.device) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.LIST_USER,
            status: 'ok',
            data: fakeUserList,
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.LIST_DEVICE:
        mockServer.send(JSON.stringify({
          id: message.id,
          response: WebsocketRequestType.LIST_DEVICE,
          status: 'ok',
          data: fakeDeviceList,
        }));
        break;
      case WebsocketRequestType.DELETE_DEVICE:
        if (message.device) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.DELETE_DEVICE,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.SET_PROPERTIES:
        if (message.device && message.data && !Array.isArray(message.data)) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.SET_PROPERTIES,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.DELETE_PROPERTIES:
        if (message.device && message.data && Array.isArray(message.data)) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.DELETE_PROPERTIES,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.SET_GROUP:
        if (message.data) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.SET_GROUP,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.GET_GROUP:
        if (message.data && message.data.name === 'a group name') {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.GET_GROUP,
            status: 'ok',
            data: fakeGroup,
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.DELETE_GROUP:
        if (message.data && message.data.name === 'a group name') {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.DELETE_GROUP,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.LIST_GROUP:
        mockServer.send(JSON.stringify({
          id: message.id,
          response: WebsocketRequestType.LIST_GROUP,
          status: 'ok',
          data: ['fakeGroup1', 'fakeGroup2'],
        }));
        break;
      case WebsocketRequestType.SET_USER_DATA:
        if (message.data && !Array.isArray(message.data)) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.SET_USER_DATA,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.DELETE_USER_DATA:
        if (message.data && Array.isArray(message.data)) {
          mockServer.send(JSON.stringify({
            id: message.id,
            response: WebsocketRequestType.DELETE_USER_DATA,
            status: 'ok',
          }));
        } else {
          //TODO: return proper error message
        }
        break;
      case WebsocketRequestType.GET_USER_DATA:
        mockServer.send(JSON.stringify({
          id: message.id,
          response: WebsocketRequestType.GET_USER_DATA,
          status: 'ok',
          data: fakeUserData,
        }));
        break;
    }
  });
  return mockServer;
};