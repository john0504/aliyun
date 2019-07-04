import {
  ComponentFixture,
  TestBed,
  getTestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NavControllerMock } from 'ionic-mocks';
import {
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import {
  TranslateModule,
  TranslateLoader,
} from '@ngx-translate/core';
import { AppTasks, AccountService } from 'app-engine';
import {
  IonicModule,
  AlertController,
  NavController,
} from 'ionic-angular';
import { MockComponent } from 'ng-mocks';

import { ViewStateService } from '../../providers/view-state-service';
import { createTranslateLoader } from '../../mocks/providers.mocks';
import {
  AccountServiceMock,
  AppTasksMock,
} from '../../mocks/app-engine.mocks';
import {
  AlertMock,
  AlertControllerMock,
} from '../../mocks/ionic-module.mocks';
import { MyAccountPage } from './my-account';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector';

describe('Page - my account', () => {

  let component: MyAccountPage;
  let fixture: ComponentFixture<MyAccountPage>;
  let alertMock;
  let alerCtrlMock;
  let navCtrl;
  let accountService: AccountService;
  let appTasks: AppTasks;

  beforeEach(() => {
    navCtrl = NavControllerMock.instance();
    alertMock = AlertMock.instance();
    alerCtrlMock = AlertControllerMock.instance(alertMock);
    TestBed.configureTestingModule({
      declarations: [
        MyAccountPage,
        MockComponent(LanguageSelectorComponent),
      ],
      imports: [
        IonicModule.forRoot(MyAccountPage),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: AppTasks, useClass: AppTasksMock },
        { provide: AlertController, useFactory: () => alerCtrlMock },
        { provide: NavController, useFactory: () => navCtrl },
        ViewStateService,
        { provide: AccountService, useClass: AccountServiceMock },
      ],
    });

    fixture = TestBed.createComponent(MyAccountPage);
    component = fixture.componentInstance;

    const injector = getTestBed();
    accountService = injector.get(AccountService);
    appTasks = injector.get(AppTasks);
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof MyAccountPage).toBeTruthy();
  });

  it('test request user data', fakeAsync(() => {
    const spy = spyOn(appTasks, 'requestUserDataTask').and.callThrough();

    component.requestData();

    tick(100);

    expect(spy).toHaveBeenCalled();
    expect(alerCtrlMock.create).toHaveBeenCalled();
  }));

  it('test delete account - normal account', fakeAsync(() => {
    const spyDelete = spyOn(appTasks, 'deleteAccountTask').and.callThrough();
    spyOn(accountService, 'getAccount').and.returnValue(Promise.resolve({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    }));
    spyOn(accountService, 'getPassword').and.returnValue(Promise.resolve('12345678'));

    component.deleteAccount();

    tick(100);

    expect(alerCtrlMock.create).toHaveBeenCalled();
    alertMock.triggerButtonHandler(1, { password: '12345678' });

    tick(100);

    expect(spyDelete).toHaveBeenCalled();
    expect(navCtrl.setRoot).toHaveBeenCalled();
  }));

  it('test delete account - normal account, wrong password', fakeAsync(() => {
    const spyDelete = spyOn(appTasks, 'deleteAccountTask').and.callThrough();
    spyOn(accountService, 'getAccount').and.returnValue(Promise.resolve({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    }));
    spyOn(accountService, 'getPassword').and.returnValue(Promise.resolve('12345678'));

    component.deleteAccount();

    tick(100);

    expect(alerCtrlMock.create).toHaveBeenCalled();
    alertMock.triggerButtonHandler(1, { password: 'wrong_password' });

    tick(100);

    expect(spyDelete).not.toHaveBeenCalled();
    expect(navCtrl.setRoot).not.toHaveBeenCalled();
  }));

  it('test delete account - oauth account', fakeAsync(() => {
    const spyDelete = spyOn(appTasks, 'deleteAccountTask').and.callThrough();
    spyOn(accountService, 'getAccount').and.returnValue(Promise.resolve({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-facebook',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    }));

    component.deleteAccount();

    tick(100);

    expect(alerCtrlMock.create).toHaveBeenCalled();
    alertMock.triggerButtonHandler(1);

    tick(100);

    expect(spyDelete).toHaveBeenCalled();
    expect(navCtrl.setRoot).toHaveBeenCalled();
  }));

  it('test delete account - oauth account, something wrong', fakeAsync(() => {
    const spyDelete = spyOn(appTasks, 'deleteAccountTask').and.callFake(() => Promise.reject(new Error('something wrong')));
    spyOn(accountService, 'getAccount').and.returnValue(Promise.resolve({
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-facebook',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    }));

    component.deleteAccount();

    tick(100);

    expect(alerCtrlMock.create).toHaveBeenCalled();
    alertMock.triggerButtonHandler(1);

    tick(100);

    expect(navCtrl.setRoot).not.toHaveBeenCalled();
  }));

});
