import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse,
} from '@angular/common/http';
import { isEmpty } from 'lodash';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { timeoutWith } from 'rxjs/operators';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { HTTP } from '@ionic-native/http';

import { WebsocketAuth } from './ws-auth';
import { WebsocketWrapper } from './ws-wrapper';
import { Logger } from '../../../log/log-service';
import { Account } from '../../models/account';
import { Group } from '../../models/group';
import { makeWsRequest } from '../../models/ws-message';
import { Schedule } from '../../models/schedule';
import { User, UserRole } from '../../models/device';
import { WebsocketRequestType } from '../../models/ws-message';
import { AuthError } from '../../errors/auth-error';
import { AccountError } from '../../errors/account-error';
import { HttpError } from '../../errors/http-error';
import { NetworkError } from '../../errors/network-error';
import { ResponseError } from '../../errors/response-error';
import { TimeoutError } from '../../errors/timeout-error';

const REQUEST_METHOD = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

const PROVISION_TOKEN_TTL = {
    MIN_VALUE: 432000, // 5 days
    DEFAULT: 2592000, // 30 days
    MAX_VALUE: 31536000, // 1 year
}

@Injectable()
export class MuranoApiService {

    public static AUTH_PROVIDER_NONE = 'auth-provider-none';
    public static AUTH_PROVIDER_GOOGLE = 'auth-provider-google';
    public static AUTH_PROVIDER_FACEBOOK = 'auth-provider-facebook';

    private static MURANO_API_VERSION = '/api:1';

    static STATUS_OK = 'ok';
    static STATUS_ERROR = 'error';

    private baseUrl;
    private useHttp: boolean = false;

    // https://github.com/EddyVerbruggen/cordova-plugin-googleplus
    private webClientId: string;
    private scopes: string;

    private _ws: WebsocketWrapper;

    constructor(
        private facebook: Facebook,
        private http: HttpClient,
        private HTTP: HTTP,
        private auth: WebsocketAuth,
    ) {
    }

    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8'
        });
    }

    private getAuthHeaders(user) {
        if (!user || !user.token) {
            throw new AccountError('Account invalid');
        }
        const token = user.token;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: 'Bearer ' + token
        });

        return headers;
    }

    public setup(options?) {
        this.baseUrl = options.solutionId ? options.solutionId + '.apps.exosite.io' : options.baseUrl;
        let wsUrl = 'wss://' + this.baseUrl + MuranoApiService.MURANO_API_VERSION + '/phone';
        this._ws = new WebsocketWrapper(wsUrl);
        this.webClientId = options.webClientId;
        this.scopes = options.scopes;
        this.useHttp = options.useHttp;

        this._ws.setAuthenticator(this.auth);
    }

    public start(): Promise<any> {
        Logger.log('MuranoApiService initialize');

        return Promise.resolve();
    }

    public stop(): Promise<any> {
        return this.disconnectWebsocket();
    }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public setCallbacks(callbacks) {
        this._ws.onOpen(callbacks.onOpen);
        this._ws.onEvent(callbacks.onEvent);
        this._ws.onError(callbacks.onError);
        this._ws.onClose(callbacks.onClose);
    }

    public register(account: string, password: string, token: string): Promise<any> {
        const body = JSON.stringify({ account: account, password: password, token: token });
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/user`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.PUT, url, body, { headers });
        return this.executeHttpRequest(request)
            .then((res) => {
                let user = {
                    account,
                    isOAuth: false,
                    authProvider: MuranoApiService.AUTH_PROVIDER_NONE,
                    token: res.body.token,
                    isLoggedIn: true,
                    isNewUser: true,
                };
                return user;
            });
    }

    public session(user): Promise<any> {
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/session`;
        const body = JSON.stringify({ account: user.account, token: user.token });
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.PUT, url, body, { headers });
        return this.executeHttpRequest(request)
            .then(() => {
                user.isNewUser = false;
                return user;
            })
            .catch((e) => {
                if (e instanceof HttpError) {
                    let he: HttpError = e as HttpError;
                    switch (he.code) {
                        case 403:
                            return Promise.reject(new AuthError(he.message));
                        case 404:
                            return Promise.reject(new AccountError(he.message, 404));
                    }
                }
                return Promise.reject(e);
            });
    }

    public refreshToken(user, password): Promise<any> {
        if (!user) {
            return Promise.reject(new AccountError('No account'));
        }
        let account = user.account,
            isOAuth = user.isOAuth,
            authProvider = user.authProvider;
        if (isOAuth) {
            switch (authProvider) {
                case MuranoApiService.AUTH_PROVIDER_GOOGLE:
                    return this.loginWithGoogle(account);
                case MuranoApiService.AUTH_PROVIDER_FACEBOOK:
                    return this.getFacebookSession();
                default:
                    return Promise.reject(new AuthError('Incorrect auth provider'));
            }
        } else if (account && password) {
            return this.login(account, password);
        } else {
            return Promise.reject(new AuthError('Invalid account'));
        }
    }

    public sendsms(account: string): Promise<any> {
        const body = JSON.stringify({ phone: account });
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/sendsms`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request);
    }

    

    public requestResetPasswordSms(phone: string): Promise<any> {
        const body = JSON.stringify({ phone: phone });
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/resetsms`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request);
    }

    public sendmail(account: string): Promise<any> {
        const body = JSON.stringify({ email: account });
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/sendmail`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request);
    }

    public alldevice(user): Promise<any> {
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/alldevice`;
        const body = JSON.stringify({ account: user.account, token: user.token });
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request)
            .then((res) => {
                let list = res.body.data;
                return list;
            })
            .catch((e) => {
                if (e instanceof HttpError) {
                    let he: HttpError = e as HttpError;
                    switch (he.code) {
                        case 403:
                            return Promise.reject(new AuthError(he.message));
                        case 404:
                            return Promise.reject(new AccountError(he.message, 404));
                    }
                }
                return Promise.reject(e);
            });
    }

    public updatedevice(user, serial: string, data): Promise<any> {
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/updatedevice`;
        const body = JSON.stringify({ account: user.account, token: user.token, serial: serial, data: data});
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request)            
            .catch((e) => {
                if (e instanceof HttpError) {
                    let he: HttpError = e as HttpError;
                    switch (he.code) {
                        case 403:
                            return Promise.reject(new AuthError(he.message));
                        case 404:
                            return Promise.reject(new AccountError(he.message, 404));
                    }
                }
                return Promise.reject(e);
            });
    }

    public deletedevice(user, serial: string): Promise<any> {
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/deletedevice`;
        const body = JSON.stringify({ account: user.account, token: user.token, serial: serial });
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request)            
            .catch((e) => {
                if (e instanceof HttpError) {
                    let he: HttpError = e as HttpError;
                    switch (he.code) {
                        case 403:
                            return Promise.reject(new AuthError(he.message));
                        case 404:
                            return Promise.reject(new AccountError(he.message, 404));
                    }
                }
                return Promise.reject(e);
            });
    }

    public payment(user, serial: string, code: string): Promise<any> {
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/payment`;
        const body = JSON.stringify({ account: user.account, token: user.token, serial: serial, code: code });
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request)            
            .catch((e) => {
                if (e instanceof HttpError) {
                    let he: HttpError = e as HttpError;
                    switch (he.code) {
                        case 403:
                            return Promise.reject(new AuthError(he.message));
                        case 404:
                            return Promise.reject(new AccountError(he.message, 404));
                    }
                }
                return Promise.reject(e);
            });
    }

    public login(account: string, password: string): Promise<any> {
        const body = JSON.stringify({ email: account, password: password });
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/session`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request)
            .then((res) => {
                let user = {
                    account,
                    isOAuth: false,
                    authProvider: MuranoApiService.AUTH_PROVIDER_NONE,
                    token: res.body.token,
                    isLoggedIn: true,
                    isNewUser: false,
                };
                return user;
            });
    }

    public logout(user): Promise<any> {
        if (!user) return Promise.reject(new AccountError('No account'));
        const { account, isOAuth, authProvider } = user;
        if (!isOAuth) return Promise.resolve();
        switch (authProvider) {
            case MuranoApiService.AUTH_PROVIDER_GOOGLE:
                return Promise.resolve();
            case MuranoApiService.AUTH_PROVIDER_FACEBOOK:
                this.facebook.logout();
                return Promise.resolve();
            default:
                return Promise.reject(new AuthError('Incorrect auth provider'));
        }
    }

    public deleteAccount(user): Promise<any> {
        const headers = this.getAuthHeaders(user);
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/users/me`;
        const request: HttpRequest<any> = new HttpRequest(REQUEST_METHOD.DELETE, url, '', { headers });
        return this.executeHttpRequest(request)
            .catch((e) => {
                if (e instanceof HttpError) {
                    let he: HttpError = e as HttpError;
                    switch (he.code) {
                        case 404: // No user, it is fine.
                            return Promise.resolve();
                    }
                }
                return Promise.reject(e);
            });
    }

    public requestUserData(user): Promise<any> {
        const headers = this.getAuthHeaders(user);
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/request/userdata`;
        const request: HttpRequest<any> = new HttpRequest(REQUEST_METHOD.GET, url, '', { headers });
        return this.executeHttpRequest(request);
    }

    public requestResetPassword(email: string): Promise<any> {
        const body = JSON.stringify({ email: email });
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/reset`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });
        return this.executeHttpRequest(request);
    }

    // Google login
    // https://github.com/EddyVerbruggen/cordova-plugin-googleplus
    public loginWithGoogle(account: string) {
        return null;
    }

    public loginWithFacebook(): Promise<any> {
        return this.facebook.login(["email", "public_profile"])
            .then(() => this.getFacebookSession());
    }

    private getFacebookSession(): Promise<any> {
        return this.checkFacebookLoginStatus()
            .then((infos: FacebookLoginResponse) => this.getTokenWithFacebook(infos));
    }

    private checkFacebookLoginStatus(): Promise<any> {
        return this.facebook.getLoginStatus()
            .then(infos => {
                if (infos.status !== 'connected') {
                    return Promise.reject(new AuthError(`Failed to connect with facebook, please try again.`));
                }
                return infos;
            })
            .catch(error => Promise.reject(new AuthError(`Failed to get log in status (Error: ${error}).`)));
    }

    private getFacebookUserInfo(infos: FacebookLoginResponse, res: any): Promise<any> {
        const requiredData = [
            "email",
            "first_name",
            "id",
            "last_name",
            "middle_name",
            "name",
        ].join(',');

        return this.facebook.api(`/${infos.authResponse.userID}?fields=${requiredData}`, [
            "email",
            "public_profile",
        ]).then(({ email }) => {
            if (!email) {
                throw new AuthError(`Facebook login failed (Error: email is required)`);
            }
            const userInfos: Account = {
                account: email,
                authProvider: MuranoApiService.AUTH_PROVIDER_FACEBOOK,
                isLoggedIn: true,
                isOAuth: true,
                token: res.token,
                isNewUser: res.new_user,
            };

            return userInfos;
        }, e => Promise.reject(new AuthError(`Failed to get user information from facebook (Error: ${e})`)));
    }

    private getTokenWithFacebook(infos: FacebookLoginResponse): Promise<any> {
        const body = JSON.stringify({ token: infos.authResponse.accessToken });
        const headers = this.getHeaders();
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/social/handle/Facebook/login`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.POST, url, body, { headers });

        return this.executeHttpRequest(request)
            .then(res => this.getFacebookUserInfo(infos, res.body));
    }

    public requestProvisionToken(ttl: number = PROVISION_TOKEN_TTL.DEFAULT): Promise<any> {
        if (ttl < PROVISION_TOKEN_TTL.MIN_VALUE) {
            ttl = PROVISION_TOKEN_TTL.MIN_VALUE;
        } else if (ttl > PROVISION_TOKEN_TTL.MAX_VALUE) {
            ttl = PROVISION_TOKEN_TTL.MAX_VALUE;
        }
        let request = makeWsRequest(WebsocketRequestType.PROVISION_TOKEN, { expires_in: ttl });
        return this.sendWsRequest(request);
    }

    public queryDeviceInfo(): Promise<any> {
        const scheme: string = this.useHttp ? 'http' : 'https';
        return this.HTTP.acceptAllCerts(true)
            .then(() => {
                this.HTTP.setRequestTimeout(5);
                return this.HTTP.get(`${scheme}://192.168.1.1:32051/info`, {}, {});
            })
            .then((res) => {
                this.HTTP.acceptAllCerts(false);
                return JSON.parse(res.data);
            })
            .catch((error) => {
                this.HTTP.acceptAllCerts(false);
                return Promise.reject(error);
            });
    }

    public fireApMode(ssid: string, password: string, security: string, url: string, provToken: string, provisionType?: string): Promise<any> {
        const scheme: string = this.useHttp ? 'http' : 'https';
        const target = `${scheme}://192.168.1.1:32051/provision`;
        return this.HTTP.acceptAllCerts(true)
            .then(() => {
                this.HTTP.setRequestTimeout(5);
                if (/^jwt$/i.test(provisionType)) {
                    this.HTTP.setDataSerializer('urlencoded');
                    const body = {
                        ssid: ssid,
                        pwd: password,
                        sec: security,
                        url: url,
                        token: provToken,
                    };
                    const header = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    return this.HTTP.post(target, body, header);
                } else {
                    let paramsStr = '';
                    if (ssid) {
                        paramsStr += 'ssid=' + encodeURIComponent(ssid) + '&';
                    }
                    if (password) {
                        paramsStr += 'pwd=' + encodeURIComponent(password) + '&';
                    }
                    if (security) {
                        paramsStr += 'sec=' + encodeURIComponent(security) + '&';
                    }
                    if (url) {
                        paramsStr += 'url=' + encodeURIComponent(url) + '&';
                    }
                    if (provToken) {
                        paramsStr += 'token=' + encodeURIComponent(provToken) + '&';
                    }
                    paramsStr = paramsStr.substr(0, paramsStr.length - 1);
                    return this.HTTP.get(`${target}?${paramsStr}`, {}, {});
                }
            })
            .then((res) => {
                this.HTTP.acceptAllCerts(false);
                return JSON.parse(res.data);
            })
            .catch((error) => {
                this.HTTP.acceptAllCerts(false);
                return Promise.reject(error);
            });
    }

    public otaService(ssid: string, password: string, security: string, url: string, sha1: string, port: string, provisionType?: string): Promise<any> {
        const scheme: string = this.useHttp ? 'http' : 'https';
        const target = `${scheme}://192.168.1.1:32051/otaservice`;
        return this.HTTP.acceptAllCerts(true)
            .then(() => {
                this.HTTP.setRequestTimeout(5);
                if (/^jwt$/i.test(provisionType)) {
                    this.HTTP.setDataSerializer('urlencoded');
                    const body = {
                        ssid: ssid,
                        pwd: password,
                        sec: security,
                        url: url,
                        sha1: sha1,
                        port: port,
                    };
                    const header = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    return this.HTTP.post(target, body, header);
                } else {
                    let paramsStr = '';
                    if (ssid) {
                        paramsStr += 'ssid=' + encodeURIComponent(ssid) + '&';
                    }
                    if (password) {
                        paramsStr += 'pwd=' + encodeURIComponent(password) + '&';
                    }
                    if (security) {
                        paramsStr += 'sec=' + encodeURIComponent(security) + '&';
                    }
                    if (url) {
                        paramsStr += 'url=' + encodeURIComponent(url) + '&';
                    }
                    if (sha1) {
                        paramsStr += 'sha1=' + encodeURIComponent(sha1) + '&';
                    }
                    if (port) {
                        paramsStr += 'port=' + encodeURIComponent(port) + '&';
                    }
                    paramsStr = paramsStr.substr(0, paramsStr.length - 1);
                    return this.HTTP.get(`${target}?${paramsStr}`, {}, {});
                }
            })
            .then((res) => {
                this.HTTP.acceptAllCerts(false);
                return JSON.parse(res.data);
            })
            .catch((error) => {
                this.HTTP.acceptAllCerts(false);
                return Promise.reject(error);
            });
    }

    public broadcast(ssid: string, password: string, security: string, provisionType?: string): Promise<any> {
        const scheme: string = this.useHttp ? 'http' : 'https';
        const target = `${scheme}://192.168.1.1:32051/broadcast`;
        return this.HTTP.acceptAllCerts(true)
            .then(() => {
                this.HTTP.setRequestTimeout(5);
                if (/^jwt$/i.test(provisionType)) {
                    this.HTTP.setDataSerializer('urlencoded');
                    const body = {
                        ssid: ssid,
                        pwd: password,
                        sec: security,
                        url: "broadcast",
                        token: "broadcast",
                    };
                    const header = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };
                    return this.HTTP.post(target, body, header);
                } else {
                    let paramsStr = '';
                    if (ssid) {
                        paramsStr += 'ssid=' + encodeURIComponent(ssid) + '&';
                    }
                    if (password) {
                        paramsStr += 'pwd=' + encodeURIComponent(password) + '&';
                    }
                    if (security) {
                        paramsStr += 'sec=' + encodeURIComponent(security) + '&';
                    }
                    paramsStr += 'url=' + encodeURIComponent("broadcast") + '&';
                    paramsStr += 'token=' + encodeURIComponent("broadcast") + '&';
                    paramsStr = paramsStr.substr(0, paramsStr.length - 1);
                    return this.HTTP.get(`${target}?${paramsStr}`, {}, {});
                }
            })
            .then((res) => {
                this.HTTP.acceptAllCerts(false);
                return JSON.parse(res.data);
            })
            .catch((error) => {
                this.HTTP.acceptAllCerts(false);
                return Promise.reject(error);
            });
    }

    public localMode(user, command: string): Promise<any> {
        const scheme: string = this.useHttp ? 'http' : 'https';
        const target = `${scheme}://192.168.1.1:32051/provision`;
        var cmdObj = JSON.parse(command);        
        cmdObj.Account = user.token;
        return this.HTTP.acceptAllCerts(true)
            .then(() => {
                this.HTTP.setDataSerializer('json');
                const body = cmdObj;
                const header = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };
                return this.HTTP.post(target, body, header);
            })
            .then((res) => {
                this.HTTP.acceptAllCerts(false);
                return JSON.parse(res.data);
            })
            .catch((error) => {
                this.HTTP.acceptAllCerts(false);
                return Promise.reject(error);
            });
    }

    public getDeviceModelInfo(user, model: string) {
        if (!user || !user.token) {
            return Promise.reject(new AccountError('Account invalid'));
        }
        const token = user.token;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: 'Bearer ' + token
        });
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/device_model_info/${encodeURIComponent(model)}`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.GET, url, '', { headers });
        return this.executeHttpRequest(request)
            .then((res) => {
                let body = res.body;
                if (!Array.isArray(body)) {
                    body = [];
                }
                return body;
            });
    }

    public getFirmwareList(model?: string | Array<string>): Promise<any> {
        const headers = this.getHeaders();
        const base = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/fw/list`;
        const stringifyModel = Array.isArray(model) ? JSON.stringify(model) : model;
        const url = model ? `${base}/${stringifyModel}` : base;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.GET, url, '', { headers });
        return this.executeHttpRequest(request)
            .then((res) => {
                let body = res.body;
                if (!Array.isArray(body)) {
                    body = [];
                }
                return body;
            });
    }

    public getHistoricalData(user, deviceSn: string, field: string, queryObj: { [key: string]: any } = {}): Promise<any> {
        const headers = this.getAuthHeaders(user);
        const query = !isEmpty(queryObj) ? '?' + Object.keys(queryObj).map(key => key + '=' + queryObj[key]).join('&') : ''
        const url = `https://${this.baseUrl}${MuranoApiService.MURANO_API_VERSION}/data/${deviceSn}/${field}${query}`;
        const request: HttpRequest<string> = new HttpRequest(REQUEST_METHOD.GET, url, '', { headers });
        return this.executeHttpRequest(request)
            .then((res) => {
                let body = res.body;
                if (!Array.isArray(body)) {
                    body = [];
                }
                return body;
            });
    }

    public getServiceStatus(token: string): Promise<any> {
        const scheme: string = this.useHttp ? 'http' : 'https';
        return this.HTTP.acceptAllCerts(true)
            .then(() => {
                this.HTTP.setRequestTimeout(5);
                this.HTTP.setDataSerializer('json');
                const header = new HttpHeaders({
                    Authorization: 'Basic ' + token
                });
                return this.HTTP.get(`${scheme}://192.168.1.1:32051/service/status`, {}, {});
            })
            .then((res) => {
                this.HTTP.acceptAllCerts(false);
                return JSON.parse(res.data);
            })
            .catch((error) => {
                this.HTTP.acceptAllCerts(false);
                return Promise.reject(error);
            });
    }

    public postServiceStatus(token: string, command: string): Promise<any> {
        const scheme: string = this.useHttp ? 'http' : 'https';
        const target = `${scheme}://192.168.1.1:32051/service/status`;
        return this.HTTP.acceptAllCerts(true)
            .then(() => {
                this.HTTP.setRequestTimeout(5);
                this.HTTP.setDataSerializer('json');
                const body = command;
                const header = {
                    Authorization: 'Basic ' + token,
                    'Content-Type': 'application/json; charset=utf-8',
                };
                return this.HTTP.post(target, body, header);

            })
            .then(() => {
                this.HTTP.acceptAllCerts(false);
                return;
            })
            .catch((error) => {
                this.HTTP.acceptAllCerts(false);
                return Promise.reject(error);
            });
    }

    public executeHttpRequest(httpRequest: HttpRequest<string>, timeout: number = 10000): Promise<any> {
        return this.http.request(httpRequest)
            .pipe(timeoutWith(timeout, ErrorObservable.create(new TimeoutError('Request timeout'))))
            .toPromise()
            .catch((err) => {
                if (err instanceof TimeoutError) {
                    return Promise.reject(err);
                } else if (err instanceof HttpErrorResponse) {
                    const { message, status, statusText } = err;
                    const e = status < 100 ?
                        new NetworkError(message ? message : err.toString()) :
                        new HttpError(status, status + ' - ' + (statusText || ''));
                    return Promise.reject(e);
                } else {
                    const { message } = err;
                    const e = new NetworkError(message ? message : err.toString());
                    return Promise.reject(e);
                }
            });
    }

    public websocketLogin(): Promise<any> {
        return this._ws.authenticate();
    }

    public requestGetMe(): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.GET_ME);
        return this.sendWsRequest(request);
    }

    public requestConfig(sn: string, config: any): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.CONFIG, config, sn);
        return this.sendWsRequest(request);
    }

    public requestSet(sn: string, command): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.SET, command, sn);
        return this.sendWsRequest(request);
    }

    public requestGet(sn: string): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.GET, null, sn);
        return this.sendWsRequest(request);
    }

    public requestOta(sn: string, url: string, sha1: string, firmwareVersion: string): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.OTA, { url, sha1, last_firmware: firmwareVersion }, sn);
        return this.sendWsRequest(request);
    }

    public requestCalendar(sn: string, calendar: Array<Schedule>): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.CALENDAR, calendar, sn);
        return this.sendWsRequest(request);
    }

    public requestAddUser(sn: string, user: User): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.ADD_USER, user, sn);
        return this.sendWsRequest(request);
    }

    public requestAddSharingDevice(token: string): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.ADD_SHARING_DEVICE, { token });
        return this.sendWsRequest(request);
    }

    public requestGetSharingToken(sn: string, userRole: UserRole): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.GET_SHARING_TOKEN, userRole, sn);
        return this.sendWsRequest(request);
    }

    public requestRemoveUser(sn: string, email: string): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.REMOVE_USER, { email }, sn);
        return this.sendWsRequest(request);
    }

    public requestListUser(sn: string): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.LIST_USER, {}, sn);
        return this.sendWsRequest(request);
    }

    public requestListDevice(): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.LIST_DEVICE);
        return this.sendWsRequest(request);
    }

    public requestSetProperties(sn: string, properties): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.SET_PROPERTIES, properties, sn);
        return this.sendWsRequest(request);
    }

    public requestDeleteProperties(sn: string, properties: Array<string>): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.DELETE_PROPERTIES, properties, sn);
        return this.sendWsRequest(request);
    }

    public requestDeleteDevice(sn: string): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.DELETE_DEVICE, null, sn);
        return this.sendWsRequest(request);
    }

    public requestSetGroup(group: Group): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.SET_GROUP, group);
        return this.sendWsRequest(request);
    }

    public requestGetGroup(name: string): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.GET_GROUP, { name });
        return this.sendWsRequest(request);
    }

    public requestDeleteGroup(name: string): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.DELETE_GROUP, { name });
        return this.sendWsRequest(request);
    }

    public requestListGroup(): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.LIST_GROUP);
        return this.sendWsRequest(request);
    }

    public requestSetUserData(userData: Object): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.SET_USER_DATA, userData);
        return this.sendWsRequest(request);
    }

    public requestDeleteUserData(userDataKeys: Array<string>): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.DELETE_USER_DATA, userDataKeys);
        return this.sendWsRequest(request);
    }

    public requestGetUserData(): Promise<any> {
        let request = makeWsRequest(WebsocketRequestType.GET_USER_DATA);
        return this.sendWsRequest(request);
    }

    public connectWebsocket(): Promise<any> {
        return this._ws.connect();
    }

    public disconnectWebsocket(): Promise<any> {
        this._ws.disconnect();
        return Promise.resolve();
    }

    public isWebSocketOpened() {
        return this._ws.isOpened();
    }

    public send(wsMessage, timeout: number = 10000): Promise<any> {
        return this._ws.send(wsMessage, timeout);
    }

    public sendWsRequest(wsRequest, timeout?: number): Promise<any> {
        return this._ws.send(wsRequest, timeout)
            .then((res) => {
                if (res.status &&
                    res.status.toUpperCase() === MuranoApiService.STATUS_OK.toUpperCase()) {
                    return Promise.resolve<any>({ res, req: wsRequest });
                } else {
                    return Promise.reject(new ResponseError(res.code || -1, res.message || 'Response error'));
                }
            });
    }

}
