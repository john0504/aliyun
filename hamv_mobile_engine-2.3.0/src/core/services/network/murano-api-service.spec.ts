import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  HttpClientModule,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import { MuranoApiService } from './murano-api-service';
import { Facebook } from '@ionic-native/facebook';
import { FacebookMock } from '@ionic-native-mocks/facebook';
import { HTTP } from '@ionic-native/http';
import { HTTPMock } from '@ionic-native-mocks/http';
import {
  fakeCanlendar,
  fakeDevice,
  fakeDeviceList,
  fakeGroup,
  fakeSharingToken,
  fakeUserData,
  fakeUserList,
  fakeUserMe,
  setupWsServer,
} from '../../../mocks/servers.mocks';
import { WebsocketAuth } from './ws-auth';
import { AccountError } from '../../errors/account-error';
import { AuthError } from '../../errors/auth-error';
import { ResponseError } from '../../errors/response-error';
import { HttpError } from '../../errors/http-error';
import { NetworkError } from '../../errors/network-error';
import { TimeoutError } from '../../errors/timeout-error';
import { WebsocketRequestType } from '../../models/ws-message';
import { Account } from '../../models/account';

export class WebsocketAuthMock {
  public getAuthRequest(): Promise<any> {
    return Promise.resolve<any>({
      id: 'ws-request-auth',
      request: 'login',
      data: {
        token: 'testing token',
      },
    });
  }

  public processResponse(res): Promise<any> {
    return Promise.resolve(true);
  }
}

describe('Murano API Service - Basic', () => {

  let instance: MuranoApiService;
  let httpMock: HttpTestingController;
  let facebookMock: Facebook;
  const fakeAccount = { account: 'testing@exosite.com', password: 'password' };

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Facebook, useClass: FacebookMock },
        { provide: HTTP, useClass: HTTPMock },
        { provide: WebsocketAuth, useClass: WebsocketAuthMock },
        MuranoApiService
      ],
    });
    const injector = getTestBed();
    instance = injector.get(MuranoApiService);

    return instance.start();
  });

  afterAll(() => {
    instance.stop();
  });

  beforeEach(() => {
    instance.setup({
      solutionId: 'unit-test',
      useHttp: false,
    });
  });

  it('Create murano API service', () => {
    expect(instance).toBeTruthy();
  });

  it('Check base url setup', () => {
    instance.setup({
      solutionId: 'abc-test',
      useHttp: false,
    });
    expect(instance.getBaseUrl()).toEqual('abc-test.apps.exosite.io');
  });

  it('Check callback setup', () => {
    const spy = spyOn(instance, 'setCallbacks').and.callThrough();
    instance.setCallbacks({
      onOpen: () => { },
      onEvent: () => { },
      onError: () => { },
      onClose: () => { },
    });
    expect(spy).toHaveBeenCalled();
  });
});

describe('Murano API Service - Http part', () => {

  let instance: MuranoApiService;
  let httpMock: HttpTestingController;
  let facebookMock: Facebook;
  const fakeAccount = { account: 'testing@exosite.com', password: 'password' };

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Facebook, useClass: FacebookMock },
        { provide: HTTP, useClass: HTTPMock },
        { provide: WebsocketAuth, useClass: WebsocketAuthMock },
        MuranoApiService
      ],
    });
    const injector = getTestBed();
    instance = injector.get(MuranoApiService);
    httpMock = injector.get(HttpTestingController);
    facebookMock = injector.get(Facebook);

    return Promise.resolve()
      .then(() => {
        instance.setup({
          solutionId: 'unit-test',
          useHttp: false,
        });
        return instance.start();
      });
  });

  afterAll(() => {
    instance.stop();
  });

  it('Http test case - register', () => {
    const regPromise = instance.register(fakeAccount.account, fakeAccount.password)
      .then(user => {
        expect(user).toEqual({
          account: fakeAccount.account,
          isOAuth: false,
          authProvider: MuranoApiService.AUTH_PROVIDER_NONE,
          token: 'res.body.token',
          isLoggedIn: true,
          isNewUser: true,
        });
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/user/${fakeAccount.account}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    expect(req.request.body).toEqual(JSON.stringify({ password: fakeAccount.password }));
    req.flush({ token: 'res.body.token' });
    return regPromise;
  });

  it('Http test case - session', () => {
    const sessionPromise = instance.session({
      account: fakeAccount.account,
      isOAuth: false,
      authProvider: MuranoApiService.AUTH_PROVIDER_NONE,
      token: 'res.body.token',
      isLoggedIn: true,
      isNewUser: true,
    })
      .then(user => {
        expect(user.isNewUser).toBeFalsy();
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/session`);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    expect(req.request.headers.get('Authorization')).toEqual('Bearer res.body.token');
    req.flush({ status: 'valid' });
    return sessionPromise;
  });

  it('Http test case - login', () => {
    const loginPromise = instance.login(fakeAccount.account, fakeAccount.password)
      .then(user => {
        expect(user).toEqual({
          account: fakeAccount.account,
          isOAuth: false,
          authProvider: MuranoApiService.AUTH_PROVIDER_NONE,
          token: 'res.body.token',
          isLoggedIn: true,
          isNewUser: false,
        });
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/session`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    expect(req.request.body).toEqual(JSON.stringify({ email: fakeAccount.account, password: fakeAccount.password }));
    req.flush({ token: 'res.body.token' });
    return loginPromise;
  });

  it('Http test case - logout, valid accounts', () => {
    const normalAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const oauthFBAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-facebook',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const oauthGoogleAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-google',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    return instance.logout(normalAccount)
      .then(() => instance.logout(oauthFBAccount))
      .then(() => instance.logout(oauthGoogleAccount))
      .then(() => expect('logout').toBeTruthy())
  });

  it('Http test case - logout, unknown oauth account', () => {
    const unknownOauthAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-unknown',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    return instance.logout(unknownOauthAccount)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('Incorrect auth provider');
      });
  });

  it('Http test case - logout, no account', () => {
    return instance.logout(undefined)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AccountError).toBeTruthy();
        expect(e.message).toEqual('No account');
        expect(e.code).toEqual(-1);
      });
  });

  it('Http test case - delete account, valid account', () => {
    const account: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const delAccPromise = instance.deleteAccount(account);
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/users/me`);
    expect(req.request.method).toEqual('DELETE');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush(null, { status: 200, statusText: 'Ok' });
    return delAccPromise;
  });

  it('Http test case - delete account, no account or no token', () => {
    expect(function () { instance.deleteAccount(undefined); }).toThrowError(AccountError, 'Account invalid');
  });

  it('Http test case - delete account, token invalid(403 error).', () => {
    const account: Account = {
      account: 'testing@exosite.com',
      token: 'invalid token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const delAccPromise = instance.deleteAccount(account)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof HttpError).toBeTruthy();
        expect(e.code).toEqual(403);
        expect(e.message).toEqual('403 - User token invalid');
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/users/me`);
    expect(req.request.method).toEqual('DELETE');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush(null, { status: 403, statusText: 'User token invalid' });
    return delAccPromise;
  });

  it('Http test case - delete account, user not found(404 error).', () => {
    const account: Account = {
      account: 'testing@exosite.com',
      token: 'invalid token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const delAccPromise = instance.deleteAccount(account)
      .then(() => {
        expect('treat it normally').toBeTruthy();
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/users/me`);
    expect(req.request.method).toEqual('DELETE');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush(null, { status: 404, statusText: 'User not found' });
    return delAccPromise;
  });

  it('Http test case - request user data, valid account', () => {
    const account: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const reqPromise = instance.requestUserData(account)
      .then(() => {
        expect('request success').toBeTruthy();
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/request/userdata`);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush(null, { status: 200, statusText: 'Ok' });
    return reqPromise;
  });

  it('Http test case - request user data, no account or no token', () => {
    expect(function () { instance.deleteAccount(undefined); }).toThrowError(AccountError, 'Account invalid');
  });

  it('Http test case - delete account, token invalid(403 error).', () => {
    const account: Account = {
      account: 'testing@exosite.com',
      token: 'invalid token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const reqPromise = instance.requestUserData(account)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof HttpError).toBeTruthy();
        expect(e.code).toEqual(403);
        expect(e.message).toEqual('403 - User token invalid');
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/request/userdata`);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush(null, { status: 403, statusText: 'User token invalid' });
    return reqPromise;
  });

  it('Http test case - delete account, user not found(404 error).', () => {
    const account: Account = {
      account: 'testing@exosite.com',
      token: 'invalid token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const reqPromise = instance.requestUserData(account)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof HttpError).toBeTruthy();
        expect(e.code).toEqual(404);
        expect(e.message).toEqual('404 - User not found');
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/request/userdata`);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush(null, { status: 404, statusText: 'User not found' });
    return reqPromise;
  });

  it('Http test case - refresh token, valid accounts', () => {
    const normalAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const oauthGoogleAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-google',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const oauthFBAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-facebook',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    spyOn(instance, 'login').and.callFake(() => Promise.resolve());

    return instance.refreshToken(normalAccount, 'abc')
      .then(() => expect('refreshToken').toBeTruthy())
      .then(() => instance.refreshToken(oauthGoogleAccount, undefined))
      .then(() => expect('refreshToken - Google').toBeTruthy())
      .then(() => instance.refreshToken(oauthFBAccount, undefined))
      .catch(e => {
        // The Facebook plugin can not store login status.
        // It always return undefined when we doing refresh token
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect('refreshToken - Facebook').toBeTruthy();
      });
  });

  it('Http test case - refresh token, no account', () => {
    return instance.refreshToken(undefined, undefined)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AccountError).toBeTruthy();
        expect(e.message).toEqual('No account');
        expect(e.code).toEqual(-1);
      })
  });

  it('Http test case - refresh token, invalid account', () => {
    return instance.refreshToken({}, undefined)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('Invalid account');
      });
  });

  it('Http test case - refresh token, unknown oauth account', () => {
    const unknownOauthAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-unknown',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    return instance.refreshToken(unknownOauthAccount, undefined)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('Incorrect auth provider');
      });
  });

  it('Http test case - facebook login', () => {
    spyOn(facebookMock, 'getLoginStatus').and.returnValue(Promise.resolve({
      authResponse: {
        userID: '12345678912345',
        accessToken: 'kgkh3g42kh4g23kh4g2kh34g2kg4k2h4gkh3g4k2h4gk23h4gk2h34gk234gk2h34AndSoOn',
        session_Key: true,
        expiresIn: '5183738',
        sig: '...'
      },
      status: 'connected'
    }));

    spyOn(facebookMock, 'api').and.returnValue(Promise.resolve({
      email: 'testing@exosite.com',
    }));

    const loginPromise = instance.loginWithFacebook()
      .then(user => {
        expect(user).toEqual({
          account: 'testing@exosite.com',
          isOAuth: true,
          authProvider: MuranoApiService.AUTH_PROVIDER_FACEBOOK,
          token: 'res.body.token',
          isLoggedIn: true,
          isNewUser: true,
        });
      });

    setTimeout(() => {
      const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/social/handle/Facebook/login`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
      expect(req.request.body).toEqual(JSON.stringify({ token: 'kgkh3g42kh4g23kh4g2kh34g2kg4k2h4gkh3g4k2h4gk23h4gk2h34gk234gk2h34AndSoOn' }));
      req.flush({ token: 'res.body.token', new_user: true });
    });

    return loginPromise;
  });

  it('Http test case - facebook login, unconnected status', () => {
    spyOn(facebookMock, 'getLoginStatus').and.returnValue(Promise.resolve({
      authResponse: {
        userID: '12345678912345',
        accessToken: 'kgkh3g42kh4g23kh4g2kh34g2kg4k2h4gkh3g4k2h4gk23h4gk2h34gk234gk2h34AndSoOn',
        session_Key: true,
        expiresIn: '5183738',
        sig: '...'
      },
      status: 'unconnected'
    }));

    return instance.loginWithFacebook()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
      });
  });

  it('Http test case - facebook login, no email', () => {
    spyOn(facebookMock, 'getLoginStatus').and.returnValue(Promise.resolve({
      authResponse: {
        userID: '12345678912345',
        accessToken: 'kgkh3g42kh4g23kh4g2kh34g2kg4k2h4gkh3g4k2h4gk23h4gk2h34gk234gk2h34AndSoOn',
        session_Key: true,
        expiresIn: '5183738',
        sig: '...'
      },
      status: 'connected'
    }));

    spyOn(facebookMock, 'api').and.returnValue(Promise.resolve({
      email: '',
    }));

    const p = instance.loginWithFacebook()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
        expect(e.message).toEqual('Facebook login failed (Error: email is required)');
      });

    setTimeout(() => {
      const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/social/handle/Facebook/login`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
      expect(req.request.body).toEqual(JSON.stringify({ token: 'kgkh3g42kh4g23kh4g2kh34g2kg4k2h4gkh3g4k2h4gk23h4gk2h34gk234gk2h34AndSoOn' }));
      req.flush({ token: 'res.body.token', new_user: true });
    });
    return p;
  });

  it('Http test case - facebook login, call Facebook API error', () => {
    spyOn(facebookMock, 'getLoginStatus').and.returnValue(Promise.resolve({
      authResponse: {
        userID: '12345678912345',
        accessToken: 'kgkh3g42kh4g23kh4g2kh34g2kg4k2h4gkh3g4k2h4gk23h4gk2h34gk234gk2h34AndSoOn',
        session_Key: true,
        expiresIn: '5183738',
        sig: '...'
      },
      status: 'connected'
    }));

    spyOn(facebookMock, 'api').and.callFake(() => Promise.reject(new Error('foreced facebook error')));

    const p = instance.loginWithFacebook()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
      });

    setTimeout(() => {
      const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/social/handle/Facebook/login`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
      expect(req.request.body).toEqual(JSON.stringify({ token: 'kgkh3g42kh4g23kh4g2kh34g2kg4k2h4gkh3g4k2h4gk23h4gk2h34gk234gk2h34AndSoOn' }));
      req.flush({ token: 'res.body.token', new_user: true });
    });
    return p;
  });

  it('Http test case - session, account error', () => {
    expect(function () { instance.session({}); }).toThrowError(AccountError, 'Account invalid');
  });

  it('Http test case - session, invalid account error', () => {
    const sessionPromise = instance.session({ token: 'res.body.token', })
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AccountError).toBeTruthy();
        expect(e.code).toEqual(404);
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/session`);
    expect(req.request.method).toEqual('GET');
    req.error(new ErrorEvent('ACCOUNT_ERROR'), {
      status: 404,
      statusText: 'user_not_found'
    });
    return sessionPromise;
  });

  it('Http test case - session, auth error', () => {
    const sessionPromise = instance.session({ token: 'res.body.token', })
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof AuthError).toBeTruthy();
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/session`);
    expect(req.request.method).toEqual('GET');
    req.error(new ErrorEvent('AUTH_ERROR'), {
      status: 403,
      statusText: 'invalid'
    });
    return sessionPromise;
  });

  it('Http test case - session, http error', () => {
    const sessionPromise = instance.session({ token: 'res.body.token', })
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof HttpError).toBeTruthy();
        expect(e.code).toEqual(500);
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/session`);
    expect(req.request.method).toEqual('GET');
    req.error(new ErrorEvent('HTTP_ERROR'), {
      status: 500,
      statusText: 'http error - server error'
    });
    return sessionPromise;
  });

  it('Http test case - request reset password', () => {
    const sessionPromise = instance.requestResetPassword('testing@exosite.com')
      .then(res => {
        expect(res instanceof HttpResponse).toBeTruthy();
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ status: "ok" });
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/reset`);
    expect(req.request.method).toEqual('POST');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    expect(req.request.body).toEqual(JSON.stringify({ email: 'testing@exosite.com' }));
    req.flush({ status: "ok" });
    return sessionPromise;
  });

  it('Http test case - get firmware list, with empty content return array', () => {
    const reqPromise = instance.getFirmwareList()
      .then(list => expect(list).toEqual([]));
    const url = `https://${instance.getBaseUrl()}/api:1/fw/list`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush([]);
    return reqPromise;
  });

  it('Http test case - get firmware list, use array return array', () => {
    const models = ['model_1'];
    const reqPromise = instance.getFirmwareList(models)
      .then(list => expect(list).toEqual([]));
    const url = `https://${instance.getBaseUrl()}/api:1/fw/list/${JSON.stringify(models)}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush([]);
    return reqPromise;
  });

  it('Http test case - get firmware list, use string return array', () => {
    const models = 'model_1';
    const reqPromise = instance.getFirmwareList(models)
      .then(list => expect(list).toEqual([]));
    const url = `https://${instance.getBaseUrl()}/api:1/fw/list/${models}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush([]);
    return reqPromise;
  });

  it('Http test case - get firmware list, return unknonwn should be array', () => {
    const reqPromise = instance.getFirmwareList()
      .then(list => expect(list).toEqual([]));
    const url = `https://${instance.getBaseUrl()}/api:1/fw/list`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush(null);
    return reqPromise;
  });

  it('Http test case - get historical data, with no query Object return array', () => {
    const user: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };
    const deviceSn = 'deviceSn'
    const field = 'H00'
    const reqPromise = instance.getHistoricalData(user, deviceSn, field)
      .then(data => expect(data).toEqual([]));
    const url = `https://${instance.getBaseUrl()}/api:1/data/${deviceSn}/${field}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush([]);
    return reqPromise;
  });

  it('Http test case - get historical data, return array', () => {
    const user: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };
    const deviceSn = 'deviceSn'
    const field = 'H00'
    const query = { end_time: 1532333757675 };
    const queryString = '?end_time=1532333757675';
    const reqPromise = instance.getHistoricalData(user, deviceSn, field, query)
      .then(data => expect(data).toEqual([]));
    const url = `https://${instance.getBaseUrl()}/api:1/data/${deviceSn}/${field}${queryString}`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
    req.flush([]);
    return reqPromise;
  });

  it('Http test case - get historical data, no user', () => {
    const deviceSn = 'deviceSn'
    const field = 'H00'
    expect(function () {
      instance.getHistoricalData(undefined, deviceSn, field);
    }).toThrowError(AccountError, 'Account invalid');
  });

  it('Http test case - network error', () => {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    const url = `https://${instance.getBaseUrl()}/checkError`;
    const request: HttpRequest<string> = new HttpRequest('ERROR_CHECK', url, '', { headers });
    const errorPromise = instance.executeHttpRequest(request, 3000)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof NetworkError).toBeTruthy();
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/checkError`);
    expect(req.request.method).toEqual('ERROR_CHECK');
    req.error(new ErrorEvent('NETWORK_ERROR'), {
      status: 0,
      statusText: 'network error'
    });
    return errorPromise;
  });

  it('Http test case - timeout error', () => {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    const url = `https://${instance.getBaseUrl()}/checkError`;
    const request: HttpRequest<string> = new HttpRequest('ERROR_CHECK', url, '', { headers });
    const errorPromise = instance.executeHttpRequest(request, 3000)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof TimeoutError).toBeTruthy();
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/checkError`);
    expect(req.request.method).toEqual('ERROR_CHECK');
    return errorPromise;
  });

});

describe('Murano API Service - websocket part', () => {

  let instance: MuranoApiService;
  let wsAuth;
  let wsServer;

  const hackWsAuth = () => {
    spyOn(wsAuth, 'getAuthRequest').and.returnValue({
      id: 'ws-request-auth',
      request: 'login',
      data: {
        token: 'a valid token',
      },
    });
    spyOn(wsAuth, 'processResponse').and.callFake(res => {
      if (res.status &&
        res.status.toUpperCase() === MuranoApiService.STATUS_OK.toUpperCase()) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(new AuthError(res.message || 'Invalid token'));
      }
    });
  };

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        { provide: Facebook, useClass: FacebookMock },
        { provide: HTTP, useClass: HTTPMock },
        { provide: WebsocketAuth, useClass: WebsocketAuthMock },
        MuranoApiService
      ],
    });
    const injector = getTestBed();
    instance = injector.get(MuranoApiService);
    wsAuth = injector.get(WebsocketAuth);

    return Promise.resolve()
      .then(() => {
        instance.setup({
          solutionId: 'unit-test',
          useHttp: false,
        });
        return instance.start();
      });
  });

  afterAll(() => {
    instance.stop();
  });

  beforeEach(() => {
    wsServer = setupWsServer(`wss://${instance.getBaseUrl()}/api:1/phone`);
  });

  afterEach(() => {
    if (wsServer) wsServer.stop();
    instance.disconnectWebsocket();
  });

  it('Websocket test case - login with invalid token', () => {
    spyOn(wsAuth, 'getAuthRequest').and.returnValue({
      id: 'ws-request-auth',
      request: 'login',
      data: {
        token: 'a invalid token',
      },
    });
    spyOn(wsAuth, 'processResponse').and.callFake(res => {
      return Promise.reject(new AuthError(res.message || 'Invalid token'));
    });

    return instance.websocketLogin()
      .catch(e => {
        expect(e instanceof AuthError).toBeTruthy();
        expect(e).toBeDefined();
      });
  });

  it('Websocket test case - login with valid token', () => {
    hackWsAuth();
    return instance.websocketLogin()
      .then(() => expect('websocketLogin success').toBeTruthy());
  });

  it('Websocket test case - get provision token', () => {
    hackWsAuth();
    const ttl = 2592000;
    return instance.requestProvisionToken(ttl)
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.PROVISION_TOKEN);
        expect(res.status).toEqual('ok');
        expect(res.data.token).toEqual('a provision token');
        const expiresIn = ((new Date().getTime() / 1000) | 0) + ttl;
        expect(res.data.expires_in).toBeCloseTo(expiresIn);
      });
  });

  it('Websocket test case - get provision token, short TTL', () => {
    hackWsAuth();
    const ttl = 43200;
    return instance.requestProvisionToken(ttl)
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.PROVISION_TOKEN);
        expect(res.status).toEqual('ok');
        expect(res.data.token).toEqual('a provision token');
        const expiresIn = ((new Date().getTime() / 1000) | 0) + ttl;
        expect(res.data.expires_in).toBeGreaterThan(expiresIn);
      });
  });

  it('Websocket test case - get provision token, long TTL', () => {
    hackWsAuth();
    const ttl = 315360000;
    return instance.requestProvisionToken(ttl)
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.PROVISION_TOKEN);
        expect(res.status).toEqual('ok');
        expect(res.data.token).toEqual('a provision token');
        const expiresIn = ((new Date().getTime() / 1000) | 0) + ttl;
        expect(res.data.expires_in).toBeLessThan(expiresIn);
      });
  });

  it('Websocket test case - get me', () => {
    hackWsAuth();
    return instance.requestGetMe()
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.GET_ME);
        expect(res.status).toEqual('ok');
        expect(res.data).toEqual(fakeUserMe);
      });
  });

  it('Websocket test case - config', () => {
    hackWsAuth();
    return instance.requestConfig('a device id', { fields: ['H00', 'H01'] })
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.CONFIG);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - set', () => {
    hackWsAuth();
    return instance.requestSet('a device id', { H00: 1, H01: 2 })
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.SET);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - get', () => {
    hackWsAuth();
    return instance.requestGet('a device id')
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.GET);
        expect(res.status).toEqual('ok');
        expect(res.data).toEqual(fakeDevice);
      });
  });

  it('Websocket test case - ota', () => {
    hackWsAuth();
    return instance.requestOta('a device id', 'url', 'sha1', 'last_firmware')
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.OTA);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - calendar', () => {
    hackWsAuth();
    return instance.requestCalendar('a device id', fakeCanlendar)
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.CALENDAR);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - add user by email', () => {
    hackWsAuth();
    const fakeGuest = {
      email: 'testing@exosite.com',
      role: 'guest'
    };
    return instance.requestAddUser('a device id', fakeGuest)
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.ADD_USER);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - add user by email, more than limitation', () => {
    hackWsAuth();
    const fakeGuest = {
      email: 'testing@exosite.com',
      role: 'moreThan10', // for trigger error
    };
    return instance.requestAddUser('a device id', fakeGuest)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof ResponseError).toBeTruthy();
        expect(e.code).toEqual(101);
      });
  });

  it('Websocket test case - add user by token', () => {
    hackWsAuth();
    return instance.requestGetSharingToken('a device id', { role: 'guest' })
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.GET_SHARING_TOKEN);
        expect(res.status).toEqual('ok');
        expect(res.data).toEqual(fakeSharingToken);
      });
  });

  it('Websocket test case - add user by token, more than limitation', () => {
    hackWsAuth();
    const fakeGuest = {
      role: 'moreThan10', // for trigger error
    };
    return instance.requestGetSharingToken('a device id', fakeGuest)
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof ResponseError).toBeTruthy();
        expect(e.code).toEqual(101);
      });
  });

  it('Websocket test case - add user verify (a.k.a. add a sharing device)', () => {
    hackWsAuth();
    return instance.requestAddSharingDevice('a sharing token')
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.ADD_SHARING_DEVICE);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - add user verify (a.k.a. add a sharing device), more than limitation', () => {
    hackWsAuth();
    return instance.requestAddSharingDevice('moreThan10')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof ResponseError).toBeTruthy();
        expect(e.code).toEqual(101);
      });
  });

  it('Websocket test case - remove user', () => {
    hackWsAuth();
    return instance.requestRemoveUser('a device id', 'a user email')
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.REMOVE_USER);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - list users', () => {
    hackWsAuth();
    return instance.requestListUser('a device id')
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.LIST_USER);
        expect(res.status).toEqual('ok');
        expect(res.data).toEqual(fakeUserList);
      });
  });

  it('Websocket test case - list devices', () => {
    hackWsAuth();
    return instance.requestListDevice()
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.LIST_DEVICE);
        expect(res.status).toEqual('ok');
        expect(res.data).toEqual(fakeDeviceList);
      });
  });

  it('Websocket test case - delete device', () => {
    hackWsAuth();
    return instance.requestDeleteDevice('a device id')
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.DELETE_DEVICE);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - set properties', () => {
    hackWsAuth();
    return instance.requestSetProperties('a device id', {
      deviceDisplayName: 'abc',
    })
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.SET_PROPERTIES);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - delete properties', () => {
    hackWsAuth();
    return instance.requestDeleteProperties('a device id', [
      'abc', 'bcd', 'def'
    ])
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.DELETE_PROPERTIES);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - set group', () => {
    hackWsAuth();
    return instance.requestSetGroup(fakeGroup)
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.SET_GROUP);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - get group', () => {
    hackWsAuth();
    return instance.requestGetGroup('a group name')
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.GET_GROUP);
        expect(res.status).toEqual('ok');
        expect(res.data).toEqual(fakeGroup);
      });
  });

  it('Websocket test case - delete group', () => {
    hackWsAuth();
    return instance.requestDeleteGroup('a group name')
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.DELETE_GROUP);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - list groups', () => {
    hackWsAuth();
    return instance.requestListGroup()
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.LIST_GROUP);
        expect(res.status).toEqual('ok');
        expect(res.data).toEqual(['fakeGroup1', 'fakeGroup2']);
      });
  });

  it('Websocket test case - set user data', () => {
    hackWsAuth();
    return instance.requestSetUserData(fakeUserData)
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.SET_USER_DATA);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - delete user data', () => {
    hackWsAuth();
    return instance.requestDeleteUserData(['abc', 'def'])
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.DELETE_USER_DATA);
        expect(res.status).toEqual('ok');
      });
  });

  it('Websocket test case - get user data', () => {
    hackWsAuth();
    return instance.requestGetUserData()
      .then(({ res }) => {
        expect(res.response).toEqual(WebsocketRequestType.GET_USER_DATA);
        expect(res.status).toEqual('ok');
        expect(res.data).toEqual(fakeUserData);
      });
  });

  it('Websocket test case - connect websocket', () => {
    hackWsAuth();
    return instance.connectWebsocket()
      .then(() => expect(instance.isWebSocketOpened()).toBeTruthy());
  });

  it('Websocket test case - send command and timeout error', () => {
    hackWsAuth();
    return instance.connectWebsocket()
      .then(() => instance.send({ id: -1, request: 'TIMEOUT_ERROR_COMMAND' }, 3000))
      .catch(e => {
        expect(e).toBeDefined();
        expect(e instanceof TimeoutError).toBeTruthy();
      });
  });

});

describe('Murano API Service - Local http part', () => {

  let instance: MuranoApiService;
  let localHttpMock: HTTP;
  const fakeAccount = { account: 'testing@exosite.com', password: 'password' };

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Facebook, useClass: FacebookMock },
        { provide: HTTP, useClass: HTTPMock },
        { provide: WebsocketAuth, useClass: WebsocketAuthMock },
        MuranoApiService
      ],
    });
    const injector = getTestBed();
    instance = injector.get(MuranoApiService);
    localHttpMock = injector.get(HTTP);

    return instance.start();
  });

  afterAll(() => {
    instance.stop();
  });

  it('Local http test case - query info with HTTPS', () => {

    instance.setup({
      solutionId: 'unit-test',
      useHttp: false,
    });

    spyOn(localHttpMock, 'setRequestTimeout').and.callFake(() => { });

    spyOn(localHttpMock, 'get').and.callFake((url, data, headers) => {
      expect(url).toEqual('https://192.168.1.1:32051/info');
      return Promise.resolve({ data: '["https"]' });
    });

    return instance.queryDeviceInfo()
      .then(data => {
        expect(Array.isArray(data)).toBeTruthy();
        expect(data.length).toEqual(1);
        expect(data[0]).toEqual('https');
      });
  });

  it('Local http test case - query info with HTTP', () => {

    instance.setup({
      solutionId: 'unit-test',
      useHttp: true,
    });

    spyOn(localHttpMock, 'setRequestTimeout').and.callFake(() => { });

    spyOn(localHttpMock, 'get').and.callFake((url, data, headers) => {
      expect(url).toEqual('http://192.168.1.1:32051/info');
      return Promise.resolve({ data: '[ "http" ]' });
    });

    return instance.queryDeviceInfo()
      .then(data => {
        expect(Array.isArray(data)).toBeTruthy();
        expect(data.length).toEqual(1);
        expect(data[0]).toEqual('http');
      });
  });

  it('Local http test case - query info, throw error', () => {

    instance.setup({
      solutionId: 'unit-test',
      useHttp: false,
    });

    spyOn(localHttpMock, 'setRequestTimeout').and.callFake(() => { });

    spyOn(localHttpMock, 'get').and.callFake((url, data, headers) => {
      expect(url).toEqual('https://192.168.1.1:32051/info');
      return Promise.reject(new Error('forced local http error'));
    });

    return instance.queryDeviceInfo()
      .catch(e => {
        expect(e).toBeDefined();
        expect(e.message).toEqual('forced local http error');
      });
  });

  it('Local http test case - fire ap mode with HTTPS', () => {

    instance.setup({
      solutionId: 'unit-test',
      useHttp: false,
    });

    spyOn(localHttpMock, 'setRequestTimeout').and.callFake(() => { });

    spyOn(localHttpMock, 'get').and.callFake((url, data, headers) => {
      expect(url).toEqual('https://192.168.1.1:32051/provision?ssid=wifiSsid&pwd=password&sec=secType&url=hostUrl&token=provToken');
      return Promise.resolve({
        status: 200,
        data: '{ "serial": "a device sn" }',
        headers: {
          'content-length': '27'
        }
      });
    });

    return instance.fireApMode('wifiSsid', 'password', 'secType', 'hostUrl', 'provToken')
      .then(data => {
        expect(data.serial).toEqual('a device sn');
      });
  });

  it('Local http test case - fire ap mode with HTTP', () => {

    instance.setup({
      solutionId: 'unit-test',
      useHttp: true,
    });

    spyOn(localHttpMock, 'setRequestTimeout').and.callFake(() => { });

    spyOn(localHttpMock, 'get').and.callFake((url, data, headers) => {
      expect(url).toEqual('http://192.168.1.1:32051/provision?ssid=wifiSsid&pwd=password&sec=secType&url=hostUrl&token=provToken');
      return Promise.resolve({
        status: 200,
        data: '{ "serial": "a device sn" }',
        headers: {
          'content-length': '27'
        }
      });
    });

    return instance.fireApMode('wifiSsid', 'password', 'secType', 'hostUrl', 'provToken')
      .then(data => {
        expect(data.serial).toEqual('a device sn');
      });
  });

  it('Local http test case - fire ap mode with JWT mode', () => {

    instance.setup({
      solutionId: 'unit-test',
      useHttp: false,
    });

    spyOn(localHttpMock, 'setRequestTimeout').and.callFake(() => { });

    spyOn(localHttpMock, 'post').and.callFake((url, data, headers) => {
      expect(url).toEqual('https://192.168.1.1:32051/provision');
      expect(data).toEqual({
        ssid: 'wifiSsid',
        pwd: 'password',
        sec: 'secType',
        url: 'hostUrl',
        token: 'provToken',
      });
      expect(headers).toEqual({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      return Promise.resolve({
        status: 200,
        data: '{ "serial": "a device sn" }',
        headers: {
          'content-length': '27'
        }
      });
    });

    return instance.fireApMode('wifiSsid', 'password', 'secType', 'hostUrl', 'provToken', 'jwt')
      .then(data => {
        expect(data.serial).toEqual('a device sn');
      });
  });

  it('Local http test case - fire ap mode, throw error', () => {

    instance.setup({
      solutionId: 'unit-test',
      useHttp: false,
    });

    spyOn(localHttpMock, 'setRequestTimeout').and.callFake(() => { });

    spyOn(localHttpMock, 'post').and.callFake((url, data, headers) => {
      expect(url).toEqual('https://192.168.1.1:32051/provision');
      expect(data).toEqual({
        ssid: 'wifiSsid',
        pwd: 'password',
        sec: 'secType',
        url: 'hostUrl',
        token: 'provToken',
      });
      expect(headers).toEqual({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      return Promise.reject(new Error('forced local http error'));
    });

    return instance.fireApMode('wifiSsid', 'password', 'secType', 'hostUrl', 'provToken', 'jwt')
      .catch(e => {
        expect(e).toBeDefined();
        expect(e.message).toEqual('forced local http error');
      });
  });

});
