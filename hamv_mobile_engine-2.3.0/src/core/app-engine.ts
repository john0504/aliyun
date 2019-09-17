import { Injectable } from '@angular/core';

import { WebSocketMessageDispatcher } from './ws-message-dispatcher'
import { AppEngineTasks } from './tasks/app-engine-tasks';
import { AppEngineOptions } from './app-engine-options';

import { Group } from './models/group';
import { Schedule } from './models/schedule';
import { User, UserRole } from './models/device';

import { AccountService } from './services/account/account-service';
import { DatabaseService } from './services/storage/db-service';
import { MuranoApiService } from './services/network/murano-api-service';
import { DnssdService } from './services/mdns/dnssd-service';
import { Logger } from '../log/log-service';

@Injectable()
export class AppEngine {

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private muranoApiService: MuranoApiService,
        private dnssdService: DnssdService,
        private appEngineTasks: AppEngineTasks,
        private wsDispatcher: WebSocketMessageDispatcher,
    ) {
        Logger.log('AppEngine create');
    }

    public setup(options: AppEngineOptions) {
        Logger.log('AppEngine setup');
        let { solutionId, baseUrl, webClientId, googleScopes, brand, model, useHttp } = options;
        this.accountService.setup();
        this.databaseService.setup();
        this.muranoApiService.setup({
            solutionId: solutionId,
            baseUrl: baseUrl,
            webClientId: webClientId,
            scopes: googleScopes,
            useHttp: useHttp,
        });
        this.dnssdService.setup({
            brand: brand,
            model: model,
        });

        this.setWebsocketCallbacks({
            onEvent: (event) => {
                this.wsDispatcher.onEventReceived(event);
            }
        });
    }

    public start(): Promise<any> {
        Logger.log('AppEngine initialize');
        let moduleInitTasks = [
            this.accountService.start(),
            this.databaseService.start(),
            this.muranoApiService.start(),
            this.dnssdService.start(),
        ];
        return Promise.all(moduleInitTasks);
    }

    public stop(): Promise<any> {
        Logger.log('AppEngine initialize');
        let moduleDestroyTasks = [
            this.accountService.stop(),
            this.databaseService.stop(),
            this.muranoApiService.stop(),
            this.dnssdService.stop(),
        ];
        return Promise.all(moduleDestroyTasks);
    }

    public getBaseUrl(): string {
        return this.muranoApiService.getBaseUrl();
    }

    /*
     * Account Service
     */
    public getAccount(): Promise<any> {
        return this.accountService.getAccount();
    }

    public setAccount(user): Promise<any> {
        return this.accountService.setAccount(user);
    }

    public setUserData(userData: Object): Promise<any> {
        return this.accountService.setUserData(userData);
    }

    public getUserData(): Promise<any> {
        return this.accountService.getUserData();
    }

    public setUserMe(me: Object): Promise<any> {
        return this.accountService.setUserMe(me);
    }

    public getUserMe(): Promise<any> {
        return this.accountService.getUserMe();
    }

    public session(): Promise<any> {
        return this.appEngineTasks.sessionTask();
    }

    public refreshToken(): Promise<any> {
        return this.appEngineTasks.refreshTokenTask();
    }

    public register(account: string, password: string, token: string): Promise<any> {
        return this.appEngineTasks.registerTask(account, password, token);
    }
    
    public sendmail(account: string): Promise<any> {
        return this.appEngineTasks.sendmailTask(account);
    }
    
    public sendsms(account: string): Promise<any> {
        return this.appEngineTasks.sendSmsTask(account);
    }

    public requestResetPasswordSms(phone: string): Promise<any> {
        return this.appEngineTasks.requestResetPasswordSmsTask(phone);
    }

    public alldevice(): Promise<any> {
        return this.appEngineTasks.alldeviceTask();
    }

    public updatedevice(serial: string, data): Promise<any> {
        return this.appEngineTasks.updatedeviceTask(serial, data);
    }

    public deletedevice(serial: string): Promise<any> {
        return this.appEngineTasks.deletedeviceTask(serial);
    }

    public payment(serial: string, code: string): Promise<any> {
        return this.appEngineTasks.paymentTask(serial, code);
    }

    // Basic login
    public login(account: string, password: string): Promise<any> {
        return this.appEngineTasks.loginTask(account, password);
    }

    // Google login
    // https://github.com/EddyVerbruggen/cordova-plugin-googleplus
    public loginWithGoogle(account: string): Promise<any> {
        return Promise.reject('not implement');
    }

    // Facebook login
    public loginWithFacebook(): Promise<any> {
        return this.appEngineTasks.loginWithFacebookTask();
    }

    public requestResetPassword(email: string): Promise<any> {
        return this.appEngineTasks.requestResetPasswordTask(email);
    }

    public logout(): Promise<any> {
        return this.appEngineTasks.logoutTask();
    }

    public deleteAccount(): Promise<any> {
        return this.appEngineTasks.deleteAccountTask();
    }

    public removeAllData(): Promise<any> {
        return this.appEngineTasks.removeAllDataTask();
    }

    public requestUserData(): Promise<any> {
        return this.appEngineTasks.requestUserDataTask();
    }

    public queryDeviceInfo(): Promise<any> {
        return this.appEngineTasks.queryDeviceInfoTask();
    }

    public fireApMode(ssid: string, password: string, security: string,
        url: string, provToken: string, provisionType?: string): Promise<any> {
        return this.appEngineTasks.fireApModeTask(ssid, password, security, url, provToken, provisionType);
    }

    public otaService(ssid: string, password: string, security: string, url: string, sha1: string, port: string, provisionType?: string): Promise<any> {
        return this.appEngineTasks.otaServiceTask(ssid, password, security, url, sha1, port, provisionType);
    }

    public broadcast(ssid: string, password: string, security: string,
        provisionType?: string): Promise<any> {
        return this.appEngineTasks.broadcastTask(ssid, password, security, provisionType);
    }

    public localMode(command: string): Promise<any> {
        return this.appEngineTasks.localModeTask(command);
    }

    public getDeviceModelInfo(model: string): Promise<any> {
        return this.appEngineTasks.getDeviceModelInfo(model);
    }

    public getFirmwareList(model?: string | Array<string>): Promise<any> {
        return this.appEngineTasks.getFirmwareList(model);
    }

    public getHistoricalData(deviceSn: string, field: string, query: { [key: string]: any } = {}): Promise<any> {
        return this.appEngineTasks.getHistoricalData(deviceSn, field, query);
    }

    public getServiceStatus(token: string): Promise<any> {
        return this.appEngineTasks.getServiceStatusTask(token);
    }

    public postServiceStatus(token: string, command: string): Promise<any> {
        return this.appEngineTasks.postServiceStatusTask(token, command);
    }

    public refreshDevice(deviceSn: string): Promise<any> {
        return this.refreshDevices([deviceSn]);
    }

    public refreshDevices(devices?: Array<string>): Promise<any> {
        return this.appEngineTasks.refreshDevicesTask(devices);
    }

    public refreshAllDevices(): Promise<any> {
        return this.refreshDevices();
    }

    public filterDevices(filters?): Promise<any> {
        // TODO: does not support any custom filters now. By default, all devices are ordered by name ASC
        return this.appEngineTasks.filterDevicesTask(filters);
    }

    public refreshGroup(groupId: string): Promise<any> {
        return this.refreshGroups([groupId]);
    }

    public refreshGroups(groups?: Array<string>): Promise<any> {
        return this.appEngineTasks.refreshGroupsTask(groups);
    }

    public refreshAllGroups(): Promise<any> {
        return this.refreshGroups();
    }

    public filterGroups(filters?): Promise<any> {
        // TODO: does not support any custom filters now. By default, all groups are ordered by groupId ASC
        return this.appEngineTasks.filterGroupsTask(filters);
    }

    public websocketLogin(): Promise<any> {
        return this.appEngineTasks.wsRequestLoginTask();
    }

    public requestProvisionToken(ttl?: number): Promise<any> {
        return this.appEngineTasks.wsRequestProvisionTokenTask(ttl);
    }

    public requestGetMe(): Promise<any> {
        return this.appEngineTasks.wsRequestGetMeTask();
    }

    public requestConfig(sn: string, config: any): Promise<any> {
        return this.appEngineTasks.wsRequestConfigTask(sn, config);
    }

    public requestSet(sn: string, command): Promise<any> {
        return this.appEngineTasks.wsRequestSetTask(sn, command);
    }

    public requestGet(sn: string): Promise<any> {
        return this.appEngineTasks.wsRequestGetTask(sn);
    }

    public requestOta(sn: string, url: string, sha1: string, firmwareVersion: string): Promise<any> {
        return this.appEngineTasks.wsRequestOtaTask(sn, url, sha1, firmwareVersion);
    }

    public requestCalendar(sn: string, calendar: Array<Schedule>): Promise<any> {
        return this.appEngineTasks.wsRequestCalendarTask(sn, calendar);
    }

    public requestAddUser(sn: string, user: User): Promise<any> {
        return this.appEngineTasks.wsRequestAddUserTask(sn, user);
    }

    public requestAddSharingDevice(token: string): Promise<any> {
        return this.appEngineTasks.wsRequestAddSharingDeviceTask(token);
    }

    public requestGetSharingToken(sn: string, userRole: UserRole): Promise<any> {
        return this.appEngineTasks.wsRequestGetSharingTokenTask(sn, userRole);
    }

    public requestRemoveUser(sn: string, email: string): Promise<any> {
        return this.appEngineTasks.wsRequestRemoveUserTask(sn, email);
    }

    public requestListUser(sn: string): Promise<any> {
        return this.appEngineTasks.wsRequestListUserTask(sn);
    }

    public requestListDevice(): Promise<any> {
        return this.appEngineTasks.wsRequestListDeviceTask();
    }

    public requestSetProperties(sn: string, properties): Promise<any> {
        return this.appEngineTasks.wsRequestSetPropertiesTask(sn, properties);
    }

    public requestDeleteProperties(sn: string, properties: Array<string>): Promise<any> {
        return this.appEngineTasks.wsRequestDeletePropertiesTask(sn, properties);
    }

    public requestDeleteDevice(sn: string): Promise<any> {
        return this.appEngineTasks.wsRequestDeleteDeviceTask(sn);
    }

    public requestSetGroup(group: Group): Promise<any> {
        return this.appEngineTasks.wsRequestSetGroupTask(group);
    }

    public requestGetGroup(name: string): Promise<any> {
        return this.appEngineTasks.wsRequestGetGroupTask(name);
    }

    public requestDeleteGroup(name: string): Promise<any> {
        return this.appEngineTasks.wsRequestDeleteGroupTask(name);
    }

    public requestListGroup(): Promise<any> {
        return this.appEngineTasks.wsRequestListGroupTask();
    }

    public requestSetUserData(userData: Object): Promise<any> {
        return this.appEngineTasks.wsRequestSetUserDataTask(userData);
    }

    public requestDeleteUserData(keys: Array<string>): Promise<any> {
        return this.appEngineTasks.wsRequestDeleteUserData(keys);
    }

    public requestGetUserData(): Promise<any> {
        return this.appEngineTasks.wsRequestGetUserDataTask();
    }

    public hasConnection(): boolean {
        return this.hasCloudConnection();
    }

    public hasCloudConnection(): boolean {
        return this.muranoApiService.isWebSocketOpened();
    }

    public setWebsocketCallbacks(callbacks) {
        this.muranoApiService.setCallbacks(callbacks);
    }

    public subscribe(eventId: string, next: Function, error?: Function) {
        this.wsDispatcher.subscribe(eventId, next, error);
    }

    public unsubscribe(eventId: string) {
        this.wsDispatcher.unsubscribe(eventId);
    }

    public setDnssdCallbacks(callbacks) {
        this.dnssdService.setCallbacks(callbacks);
    }

    public watchDnssd(): Promise<any> {
        return this.dnssdService.watch();
    }

    public unwatchDnssd(): Promise<any> {
        return this.dnssdService.unwatch();
    }
}
