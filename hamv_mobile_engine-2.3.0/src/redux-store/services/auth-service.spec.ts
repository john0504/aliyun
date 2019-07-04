import { Component } from '@angular/core';
import { TestBed, getTestBed } from '@angular/core/testing';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { Network } from '@ionic-native/network';
import { ModalController, IonicModule } from 'ionic-angular';
import { ModalControllerMock } from 'ionic-mocks';

import { AuthService } from './auth-service';
import { ErrorsService } from './errors-service';
import { StateStore } from '../store/state-store';
import { AppTasks } from '../actions/app-tasks';
import { AppTasksMock } from '../../mocks/redux-module.mocks';
import { NetworkMock } from '../../mocks/services.mocks';

import { AccountError } from '../../core/errors/account-error';
import { AuthError } from '../../core/errors/auth-error';
import { HttpError } from '../../core/errors/http-error';
import { NetworkError } from '../../core/errors/network-error';
import { AppActions } from '../actions/app-actions';

describe('Auth service', () => {

  let instance: AuthService;
  let network;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgReduxTestingModule,
        IonicModule,
      ],
      providers: [
        { provide: AppTasks, useClass: AppTasksMock },
        { provide: Network, useClass: NetworkMock },
        { provide: ModalController, useFactory: () => ModalControllerMock.instance(ModalMock.instance()) },
        StateStore,
        ErrorsService,
        AuthService,
      ],
    });

    const injector = getTestBed();
    instance = injector.get(AuthService);
    network = injector.get(Network);
    expect(instance).toBeTruthy();
  });

  afterEach(() => MockNgRedux.reset());

  it('set login page', () => {
    instance.setLoginPage(TestPage);
  });

  it('start service', () => {
    instance.start();
  });

  it('stop service', () => {
    instance.start();
    instance.stop();
  });

  it('response when an errors is coming', () => {
    instance.start();

    const stub = MockNgRedux.getSelectorStub(['errors']);
    stub.next([new Error('abcde')]);
    stub.complete();
  });

  it('how it response session errors coming', () => {
    instance.start();
    const stub = MockNgRedux.getSelectorStub(['errors']);
    const sessionDoneWithAuthError = AppActions.action(AppActions.SESSION_DONE, new AuthError('auth error'), true);
    stub.next([sessionDoneWithAuthError]);
    const sessionDoneWithAccountError = AppActions.action(AppActions.SESSION_DONE, new AccountError('account error'), true);
    stub.next([sessionDoneWithAccountError]);
    const sessionDoneWithNetworkError = AppActions.action(AppActions.SESSION_DONE, new NetworkError('network error'), true);
    stub.next([sessionDoneWithNetworkError]);
    const sessionDoneWithHttpError = AppActions.action(AppActions.SESSION_DONE, new HttpError(400, 'http error'), true);
    stub.next([sessionDoneWithHttpError]);
    const sessionDoneWithError = AppActions.action(AppActions.SESSION_DONE, new Error('an error'), true);
    stub.next([sessionDoneWithError]);
    stub.complete();
  });

  it('how it response session errors coming', () => {
    instance.start();
    const stub = MockNgRedux.getSelectorStub(['errors']);
    const refreshTokenDoneWithError = AppActions.action(AppActions.REFRESH_TOKEN_DONE, new Error('an error'), true);
    stub.next([refreshTokenDoneWithError]);
    stub.complete();
  });

  it('response when isAuthutenticted has changed', () => {
    instance.start();

    const stub = MockNgRedux.getSelectorStub(['core', 'isAuthenticated']);
    stub.next(false);
    stub.next(true);
    stub.complete();
  });

  it('response when account state has changed', () => {
    instance.start();

    const stub = MockNgRedux.getSelectorStub(['core', 'account']);
    stub.next(null);
    stub.next({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: false,
    });
    stub.next({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
    });
    stub.next({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-facebook',
      isLoggedIn: true,
    });
    stub.next({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-facebook',
      isLoggedIn: false,
    });
    stub.complete();
  });

  it('response when network state is connected', () => {
    instance.start();

    network.setConnected();

    const stub = MockNgRedux.getSelectorStub(['core', 'isAuthenticated']);
    stub.next(true);
    stub.complete();
  });

});

@Component({
  template: '<b>Test page</b>'
})
class TestPage {
}

class ModalMock {
  public static instance(): any {
    let _didDismissCallback: Function;
    let _willDismissCallback: Function;
    let instance = jasmine.createSpyObj('Modal', ['present', 'dismiss', 'onDidDismiss', 'onWillDismiss']);
    instance.present.and.returnValue(Promise.resolve());

    instance.dismiss.and.callFake(() => {
      _willDismissCallback();
      return Promise.resolve().then(() => _didDismissCallback());
    });

    instance.onDidDismiss.and.callFake((callback: Function) => {
      _didDismissCallback = callback;
    });

    instance.onWillDismiss.and.callFake((callback: Function) => {
      _willDismissCallback = callback;
    });

    return instance;
  }
}