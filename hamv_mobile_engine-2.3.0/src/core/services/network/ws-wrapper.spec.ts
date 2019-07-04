import { TimeoutError } from './../../errors/timeout-error';
import { Server } from 'mock-socket';

import { WebsocketWrapper, Authenticator } from './ws-wrapper';
import { NetworkError } from '../../errors/network-error';
import { WebsocketRequestType } from '../../models/ws-message';
import { setupWsServer } from '../../../mocks/servers.mocks';
import { AuthError } from '../../errors/auth-error';

class WebsocketAuthMock implements Authenticator {
  public getAuthRequest(): Promise<any> {
    return Promise.resolve();
  }

  public processResponse(res): Promise<any> {
    return Promise.resolve(true);
  }
}

const TEST_WEBSOCKET_URL = 'wss://test/';
const TEST_LOGIN_REQUEST = {
  id: 'ws-request-auth',
  request: 'login',
  data: {
    token: 'a valid token',
  },
};

describe('Websocket wrapper', () => {

  it('Create websocket', () => {
    const server = new Server(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    expect(instance).toBeTruthy();
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toEqual(TEST_WEBSOCKET_URL);
      expect(event.target.protocol).toEqual('');
    });
    return instance.connect()
      .then(() => server.stop());
  });

  it('Create websocket with protocol', () => {
    const server = new Server(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL, ['protocol1', 'protocol2']);
    expect(instance).toBeTruthy();
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toEqual(TEST_WEBSOCKET_URL);
      expect(event.target.protocol).toEqual('protocol1');
    });
    return instance.connect()
      .then(() => server.stop());
  });

  it('Connect to server', () => {
    const server = new Server(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toEqual(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toEqual(TEST_WEBSOCKET_URL);
    });
    return instance.connect()
      .then(() => expect(instance.getReadyState()).toEqual(WebSocket.OPEN))
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Connect to server - twice connecting operation', () => {
    const server = new Server(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toEqual(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toEqual(TEST_WEBSOCKET_URL);
    });
    //First connect
    instance.connect();
    expect(instance.getReadyState()).toEqual(WebSocket.CONNECTING);
    return instance.connect()
      .then(() => expect(instance.getReadyState()).toEqual(WebSocket.OPEN))
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Connect to server - no network error', () => {
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    instance.onError(event => {
      expect(event.type).toEqual('error');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    return instance.connect()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof NetworkError).toBeTruthy();
        expect(e.message).toEqual('Websocket open failed.');
      });
  });

  it('Disconnect from server', () => {
    const server = new Server(TEST_WEBSOCKET_URL);
    server.on('close', () => expect('disconnect event triggered').toBeTruthy());
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toEqual(TEST_WEBSOCKET_URL);
    });
    return instance.connect()
      .then(() => {
        expect(instance.getReadyState()).toEqual(WebSocket.OPEN);
        //TODO: a bug on mock-socket library
        instance.disconnect(8000, 'forced disconnect');
        expect(instance.getReadyState()).toEqual(-1);
      })
      .then(() => server.stop());
  });

  it('Authenticate test', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve(TEST_LOGIN_REQUEST));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    return instance.authenticate()
      .then(() => expect(instance.getReadyState()).toEqual(WebSocket.OPEN))
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Authenticate test - connect funtion error', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    spyOn(instance, 'connect').and.returnValue(Promise.reject(new NetworkError('Websocket open failed.')));
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    return instance.authenticate()
      .catch(e => expect(e).toBeDefined())
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Authenticate test - No authenticator', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    return instance.authenticate()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('No authenticator');
      })
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Authenticate test - Invalid token', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve({
      id: 'ws-request-auth',
      request: 'login',
      data: {
        token: 'a invalid token',
      },
    }));
    server.on('message', () => instance.setAuthenticator(undefined));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    return instance.authenticate()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('Invalid token');
      })
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Authenticate test - twice authentication operation', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve(TEST_LOGIN_REQUEST));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    //First authenticate
    instance.authenticate();
    return instance.authenticate()
      .then(() => expect(instance.getReadyState()).toEqual(WebSocket.OPEN))
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Send message - string', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve(TEST_LOGIN_REQUEST));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    return instance.send('a message from client')
      .then(() => expect(instance.getReadyState()).toEqual(WebSocket.OPEN))
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Send message - object', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve(TEST_LOGIN_REQUEST));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    return instance.send({ message: 'a message from client' })
      .then(() => expect(instance.getReadyState()).toEqual(WebSocket.OPEN))
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Send request - websocket disconnecting', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve(TEST_LOGIN_REQUEST));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.send({ id: 'test', request: 'a request from client' }, -50)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof NetworkError).toBeTruthy();
        expect(e.message).toEqual('Websocket disconnect');
      });
    return new Promise(resolve => setTimeout(() => resolve(), 2000))
      .then(() => instance.disconnect())
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Send request timeout testing', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve(TEST_LOGIN_REQUEST));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    return instance.send({ id: 'test', request: 'a request from client' }, 1000)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof TimeoutError).toBeTruthy();
        expect(e.message).toEqual('Request timeout');
      })
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Server broadcasting - normal object', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve(TEST_LOGIN_REQUEST));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onEvent(event => {
      expect(event.type).toEqual('message');
      expect(event.data).toEqual(JSON.stringify({
        response: WebsocketRequestType.LOGIN,
        status: 'ok',
      }));
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });

    server.on('connection', () => {
      server.send(JSON.stringify({
        response: WebsocketRequestType.LOGIN,
        status: 'ok',
      }));
    });

    return instance.connect()
      .then(() => server.close())
      .then(() => server.stop());
  });

  it('Server broadcasting - arbitrary content', () => {
    const server = setupWsServer(TEST_WEBSOCKET_URL);
    const instance: WebsocketWrapper = new WebsocketWrapper(TEST_WEBSOCKET_URL);
    const auth = new WebsocketAuthMock();
    spyOn(auth, 'getAuthRequest').and.returnValue(Promise.resolve(TEST_LOGIN_REQUEST));
    instance.setAuthenticator(auth);
    instance.onOpen(event => {
      expect(event.type).toEqual('open');
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });
    instance.onEvent(event => {
      expect(event.type).toEqual('message');
      expect(event.data).toEqual('f%$#$#KL))');
    });
    instance.onClose(event => {
      expect(event.type).toEqual('close');
      expect(event.code).toEqual(1000);
      expect(event.target.url).toContain(TEST_WEBSOCKET_URL);
    });

    server.on('connection', () => {
      server.send('f%$#$#KL))');
    });

    return instance.connect()
      .then(() => server.close())
      .then(() => server.stop());
  });

});