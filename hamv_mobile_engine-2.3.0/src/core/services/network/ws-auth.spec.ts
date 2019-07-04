import { TestBed, getTestBed } from '@angular/core/testing';

import { WebsocketAuth } from './ws-auth';
import { AccountService } from './../account/account-service';
import { AuthError } from '../../errors/auth-error';

describe('Websocket Auth', () => {

  let instance: WebsocketAuth;
  let accountService: AccountService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AccountService, useValue: {
            getAccount: (): Promise<any> => {
              return Promise.resolve();
            }
          }
        },
        WebsocketAuth
      ],
    });
    const injector = getTestBed();
    accountService = injector.get(AccountService);
    instance = injector.get(WebsocketAuth);
  });

  it('Create Websocket Auth instance', () => {
    expect(instance).toBeTruthy();
  });

  it('Get auth request', () => {
    spyOn(accountService, 'getAccount').and.returnValue(Promise.resolve({
      token: 'abcd'
    }));
    instance.getAuthRequest()
      .then(req => {
        expect(req).toEqual({
          id: 'ws-request-auth',
          request: 'login',
          data: {
            token: 'abcd',
          },
        });
      });
  });

  it('Get auth request - invalid user', () => {
    spyOn(accountService, 'getAccount').and.returnValue(Promise.resolve({}));
    instance.getAuthRequest()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('No token');
      });
  });

  it('Process response - ok state', () => {
    const fakeResponse = {
      status: 'ok',
    };
    instance.processResponse(fakeResponse)
      .then(value => expect(value).toBeTruthy());
  });

  it('Process response - error state', () => {
    const fakeResponse = {
      status: 'error',
    };
    instance.processResponse(fakeResponse)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('Invalid token');
      });
  });

  it('Process response - error', () => {
    const fakeResponse = {
      message: 'error message',
    };
    instance.processResponse(fakeResponse)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('error message');
      });
  });

});