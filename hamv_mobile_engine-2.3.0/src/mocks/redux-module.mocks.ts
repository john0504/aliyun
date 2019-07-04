import { Group } from './../core/models/group';
import { UserRole } from './../core/models/device';
import { Component } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Schedule } from '../core/models/schedule';
import { User } from '../core/models/device';

export class ErrorsServiceMock {
  getSubject(): Subject<any> { return new Subject(); }
}

export class AuthServiceMock {
  setLoginPage(loginPage) { }
  start() { }
  stop() { }
}

export class AppTasksMock {
  getAccountTask(): Promise<any> { return Promise.resolve(); }
  setAccountTask(account: Account): Promise<any> { return Promise.resolve(); }
  getUserDataTask(): Promise<any> { return Promise.resolve(); }
  setUserDataTask(userData: Object): Promise<any> { return Promise.resolve(); }
  getUserMeTask(): Promise<any> { return Promise.resolve(); }
  setUserMeTask(me: Object): Promise<any> { return Promise.resolve(); }
  registerTask(account: string, password: string): Promise<any> { return Promise.resolve(); }
  sessionTask(): Promise<any> { return Promise.resolve(); }
  refreshTokenTask(): Promise<any> { return Promise.resolve(); }
  loginTask(account: string, password: string): Promise<any> { return Promise.resolve(); }
  loginWithFacebookTask(): Promise<any> { return Promise.resolve(); }
  requestResetPasswordTask(email: string): Promise<any> { return Promise.resolve(); }
  logoutTask(): Promise<any> { return Promise.resolve(); }
  deleteAccountTask(): Promise<any> { return Promise.resolve(); }
  removeAllDataTask() { return Promise.resolve(); }
  requestUserDataTask() { return Promise.resolve(); }
  queryDeviceInfoTask(): Promise<any> { return Promise.resolve(); }
  fireApModeTask(ssid: string, password: string, security: string, url: string, provToken: string, provisionType?: string): Promise<any> { return Promise.resolve(); }
  getFirmwareList(model?: string | Array<string>): Promise<any> { return Promise.resolve(); }
  getHistoricalData(deviceSn: string, field: string, query: { [ key: string ]: any } = {}): Promise<any> { return Promise.resolve(); }
  refreshDevicesTask(devices?: Array<string>): Promise<any> { return Promise.resolve(); }
  filterDevicesTask(filters?): Promise<any> { return Promise.resolve(); }
  refreshGroupsTask(groups?: Array<string>): Promise<any> { return Promise.resolve(); }
  filterGroupsTask(filters?): Promise<any> { return Promise.resolve(); }
  startWatchDnssdTask(): Promise<any> { return Promise.resolve(); }
  stopWatchDnssdTask(): Promise<any> { return Promise.resolve(); }
  wsRequestLoginTask(): Promise<any> { return Promise.resolve(); }
  wsRequestProvisionTokenTask(ttl?: number): Promise<any> { return Promise.resolve(); }
  wsRequestGetMeTask(): Promise<any> { return Promise.resolve(); }
  requestConfigTask(sn: string, config: any): Promise<any> { return Promise.resolve(); }
  wsRequestSetTask(sn: string, commands: Object): Promise<any> { return Promise.resolve(); }
  wsRequestGetTask(sn: string): Promise<any> { return Promise.resolve(); }
  wsRequestOtaTask(sn: string, url: string, sha1: string, firmwareVersion: string): Promise<any> { return Promise.resolve(); }
  wsRequestCalendarTask(sn: string, calendar: Array<Schedule>): Promise<any> { return Promise.resolve(); }
  wsRequestAddUserTask(sn: string, user: User): Promise<any> { return Promise.resolve(); }
  wsRequestAddSharingDeviceTask(token: string): Promise<any> { return Promise.resolve(); }
  wsRequestGetSharingTokenTask(sn: string, userRole: UserRole): Promise<any> { return Promise.resolve(); }
  wsRequestRemoveUserTask(sn: string, email: string): Promise<any> { return Promise.resolve(); }
  wsRequestListUserTask(sn: string): Promise<any> { return Promise.resolve(); }
  wsRequestListDeviceTask(): Promise<any> { return Promise.resolve(); }
  wsRequestSetPropertiesTask(sn: string, properties: Object): Promise<any> { return Promise.resolve(); }
  wsRequestDeletePropertiesTask(sn: string, properties: Array<string>): Promise<any> { return Promise.resolve(); }
  wsRequestDeleteDeviceTask(sn: string): Promise<any> { return Promise.resolve(); }
  wsRequestSetGroupTask(group: Group): Promise<any> { return Promise.resolve(); }
  wsRequestGetGroupTask(name: string): Promise<any> { return Promise.resolve(); }
  wsRequestDeleteGroupTask(name: string): Promise<any> { return Promise.resolve(); }
  wsRequestListGroupTask(): Promise<any> { return Promise.resolve(); }
  wsRequestSetUserDataTask(userData: Object): Promise<any> { return Promise.resolve(); }
  wsRequestDeleteUserDataTask(keys: Array<string>): Promise<any> { return Promise.resolve(); }
  wsRequestGetUserDataTask(): Promise<any> { return Promise.resolve(); }
}
