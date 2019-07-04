import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as CryptoJS from 'crypto-js';
import { Logger } from '../../../log/log-service';

import { AccountError } from '../../errors/account-error';

@Injectable()
export class AccountService {

    private static KEY_ACCOUNT_INFO = 'accountInfo';
    private static KEY_USER_DATA = 'userData';
    private static KEY_USER_ME = 'userMe';

    private static SECRET_PHRASE: string = 'Exosite@2017$JY#';
    private static SECRET_CONFIG = {
        iv: CryptoJS.enc.Utf8.parse(AccountService.SECRET_PHRASE),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    };

    constructor(
        private storage: Storage,
    ) {
    }

    public setup(options?) {
    }

    public start(): Promise<any> {
        Logger.log('AccountModule initialize');
        return Promise.resolve();
    }

    public stop(): Promise<any> {
        return Promise.resolve();
    }

    public checkSession(sessionUser): Promise<any> {
        return this.getAccount()
            .then(currentUser => {
                if (!currentUser.isLoggedIn) throw new AccountError('User already logout.');
                return this.setAccount(sessionUser);
            });
    }

    // store part
    public setAccount(account = {}): Promise<any> {
        return this.storage.set(AccountService.KEY_ACCOUNT_INFO, account);
    }

    public getAccount(): Promise<any> {
        return this.storage.get(AccountService.KEY_ACCOUNT_INFO)
            .then(account => account || {});
    }

    public setProvisionToken(tokenBundle): Promise<any> {
        return this.getAccount()
            .then(account => {
                account.pTokenBundle = tokenBundle;
                return this.setAccount(account);
            });
    }

    public setPassword(account, password) {
        let encrypted = CryptoJS.AES.encrypt(password, CryptoJS.enc.Utf8.parse(AccountService.SECRET_PHRASE), AccountService.SECRET_CONFIG);
        return this.storage.set(account.account, encrypted.ciphertext.toString());
    }

    public getPassword(account): Promise<any> {
        return this.storage.get(account.account)
            .then((encrypted) => {
                let b64Str = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(encrypted));
                let decrypted = CryptoJS.AES.decrypt(b64Str, CryptoJS.enc.Utf8.parse(AccountService.SECRET_PHRASE), AccountService.SECRET_CONFIG);
                return CryptoJS.enc.Utf8.stringify(decrypted);
            });
    }

    public setUserData(userData: Object = {}): Promise<any> {
        return this.storage.set(AccountService.KEY_USER_DATA, userData);
    }

    public getUserData(): Promise<any> {
        return this.storage.get(AccountService.KEY_USER_DATA)
            .then(value => value || {});
    }

    public mergeUserData(newUserData: Object): Promise<any> {
        return this.getUserData()
            .then((current) => {
                // In the future, this merge should be replaced by JSON merge patch or other merge methods
                let merged = newUserData;
                return this.setUserData(merged);
            });
    }

    public getUserMe(): Promise<any> {
        return this.storage.get(AccountService.KEY_USER_ME)
            .then(value => value || {});
    }

    public setUserMe(me: Object = {}): Promise<any> {
        return this.storage.set(AccountService.KEY_USER_ME, me);
    }

    public deleteUserDataByKeys(userDataKeys: Array<string>): Promise<any> {
        return this.getUserData()
            .then((current) => {
                if (userDataKeys) {
                    userDataKeys.forEach((key) => {
                        delete current[key];
                    });
                }
                return this.setUserData(current);
            });
    }

    public logout(): Promise<any> {
        return this.getAccount()
            .then((account) => {
                account.token = null;
                account.isLoggedIn = false;
                account.authProvider = null;
                account.pTokenBundle = null;
                if (account.isOAuth) {
                    account.account = null;
                    account.isOAuth = false;
                }
                return this.storage.remove(account.account)
                    .then(() => this.storage.remove(AccountService.KEY_USER_DATA))
                    .then(() => this.storage.remove(AccountService.KEY_USER_ME))
                    .then(() => this.setAccount(account));
            });
    }

    public clear(): Promise<any> {
        return this.getAccount()
            .then(account => this.storage.remove(account.account))
            .then(() => this.storage.remove(AccountService.KEY_ACCOUNT_INFO))
            .then(() => this.storage.remove(AccountService.KEY_USER_DATA))
            .then(() => this.storage.remove(AccountService.KEY_USER_ME));
    }
}
