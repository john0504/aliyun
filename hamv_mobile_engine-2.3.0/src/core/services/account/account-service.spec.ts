import { TestBed, inject } from '@angular/core/testing';
import { IonicStorageModule, Storage } from '@ionic/storage';

import { AccountService } from './account-service';
import { Account } from '../../models/account';
import { AccountError } from '../../errors/account-error';
import { UserMe } from './../../models/user-me';

describe('Account Service', () => {

  let instance: AccountService;
  const account: Account = {
    account: 'testing@exosite.com',
    token: 'a token',
    isOAuth: false,
    authProvider: 'auth-provider-none',
    isLoggedIn: false,
  };

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountService,
      ],
      imports: [
        IonicStorageModule.forRoot(),
      ]
    }).compileComponents();
  });

  beforeAll(inject([AccountService], (service) => {
    instance = service;
    instance.setup();
    return instance.start();
  }));

  beforeEach(() => {
    return instance.clear();
  });

  afterAll(() => {
    instance.stop();
  });

  it('Create account service', () => {
    expect(instance).toBeTruthy();
  });

  it('Save account info', () => {
    const p = instance.setAccount(account);
    return p.then(a => expect(a).toEqual(account));
  });

  it('Save account info with nothing', () => {
    return instance.setAccount(undefined)
      .then(a => expect(a).toEqual({}));
  });

  it('Get account info', () => {
    return instance.getAccount()
      .then(a => expect(a).toEqual({}))
      .then(() => instance.setAccount(account))
      .then(() => instance.getAccount())
      .then(a => expect(a).toEqual(account));
  });

  it('Check session account info', () => {
    const loggedInAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: true,
    };

    return instance.setAccount(account)
      .then(() => instance.checkSession(account))
      .catch(e => expect(e instanceof AccountError).toBeTruthy())
      .then(() => instance.setAccount(loggedInAccount))
      .then(() => instance.checkSession(account))
      .then(passAccount => expect(passAccount).toEqual(account))
  });

  it('Test setting provision token', () => {
    const tokenBundle = {
      token: 'abc',
    };

    const accountWithProvisionTokenBundle: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: false,
      authProvider: 'auth-provider-none',
      isLoggedIn: false,
      pTokenBundle: {
        token: 'abc',
      },
    };

    return instance.setAccount(account)
      .then(() => instance.setProvisionToken(tokenBundle))
      .then(passAccount => expect(passAccount).toEqual(accountWithProvisionTokenBundle));
  });

  it('Test setting password', () => {
    const testPassword = 'aliceCallBob';

    return instance.setAccount(account)
      .then(() => instance.setPassword(account, testPassword))
      .then(() => instance.getPassword(account))
      .then(password => expect(password).toEqual(testPassword));
  });

  it('Test setting userData', () => {
    const testData = {
      testingContent: 'testing content',
    };

    return instance.setUserData(testData)
      .then(() => instance.getUserData())
      .then(data => expect(data).toEqual(testData))
      .then(() => instance.clear())
      .then(() => instance.getUserData())
      .then(emptyData => expect(emptyData).toEqual({}));
  });

  it('Test setting userData with nothing', () => {

    return instance.setUserData(undefined)
      .then(() => instance.getUserData())
      .then(data => expect(data).toEqual({}))
      .then(() => instance.clear())
      .then(() => instance.getUserData())
      .then(emptyData => expect(emptyData).toEqual({}));
  });

  it('Test merging user data', () => {
    const testData = {
      testingContent: 'testing content',
    };

    return instance.mergeUserData(testData)
      .then(() => instance.getUserData())
      .then(data => expect(data).toEqual(testData));
  });

  it('Test setting user me', () => {
    const testUserMe: UserMe = {
      alexa_link: {
        status: 1,
      },
      id: 'string',
      email: 'testing@exosite.com',
      name: 'Testing User',
      status: 1,
    };

    return instance.getUserMe()
      .then(emptyMe => expect(emptyMe).toEqual({}))
      .then(() => instance.setUserMe(testUserMe))
      .then(() => instance.getUserMe())
      .then(userMe => expect(userMe).toEqual(testUserMe));
  });

  it('Test setting user me with nothing', () => {

    return instance.getUserMe()
      .then(emptyMe => expect(emptyMe).toEqual({}))
      .then(() => instance.setUserMe(undefined))
      .then(() => instance.getUserMe())
      .then(userMe => expect(userMe).toEqual({}));
  });

  it('Test modify user data', () => {
    const testData = {
      testingContent: 'testing content',
      testingContent2: 'testing content 2',
    };

    const testResultData = {
      testingContent2: 'testing content 2',
    };

    const deleteKey = 'testingContent';

    return instance.setUserData(testData)
      .then(() => instance.deleteUserDataByKeys([deleteKey]))
      .then(() => instance.getUserData())
      .then(data => expect(data).toEqual(testResultData));
  });

  it('Test modify user data with nothing', () => {
    const testData = {
      testingContent: 'testing content',
      testingContent2: 'testing content 2',
    };

    return instance.setUserData(testData)
      .then(() => instance.deleteUserDataByKeys(null))
      .then(() => instance.getUserData())
      .then(data => expect(data).toEqual(testData));
  });

  it('Test logout function', () => {
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

    const normalLogoutAccount: Account = {
      account: 'testing@exosite.com',
      token: null,
      isOAuth: false,
      authProvider: null,
      isLoggedIn: false,
      pTokenBundle: null,
    };

    const oauthAccount: Account = {
      account: 'testing@exosite.com',
      token: 'a token',
      isOAuth: true,
      authProvider: 'auth-provider-facebook',
      isLoggedIn: true,
      pTokenBundle: {
        token: 'abc',
      },
    };

    const oauthLogoutAccount: Account = {
      account: null,
      token: null,
      isOAuth: false,
      authProvider: null,
      isLoggedIn: false,
      pTokenBundle: null,
    };

    return instance.setAccount(normalAccount)
      .then(() => instance.logout())
      .then(() => instance.getAccount())
      .then(a => expect(a).toEqual(normalLogoutAccount))
      .then(() => instance.clear())
      .then(() => instance.setAccount(oauthAccount))
      .then(() => instance.logout())
      .then(() => instance.getAccount())
      .then(a => expect(a).toEqual(oauthLogoutAccount));
  });

  it('Test logout function with no account', () => {
    return instance.logout()
      .then(emptyMe => expect(emptyMe).toEqual({
        token: null,
        isLoggedIn: false,
        authProvider: null,
        pTokenBundle: null,
      }));
  });

});