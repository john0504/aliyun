import {
  Account,
  User,
  UserRole,
  Schedule,
  Group
} from 'app-engine';

export class AppEngineMock {
  getBaseUrl() { return 'baseUrl'; }
  getAccount() { return Promise.resolve(); }
  setAccount(account) { return Promise.resolve(); }
  getUserData() { return Promise.resolve(); }
  setUserData(userData) { return Promise.resolve(); }
  getUserMe() { return Promise.resolve(); }
  setUserMe(me) { return Promise.resolve(); }
  register(account, password) { return Promise.resolve(); }
  session() { return Promise.resolve(); }
  refreshToken() { return Promise.resolve(); }
  login(account, password) { return Promise.resolve(); }
  loginWithFacebook() { return Promise.resolve(); }
  requestResetPassword(email) { return Promise.resolve(); }
  logout() { return Promise.resolve(); }
  queryDeviceInfo() { return Promise.resolve(); }
  fireApMode(ssid, password, security, url, provToken, provisionType?) { return Promise.resolve(); }
  getFirmwareList(model?: string | Array<string>) { return Promise.resolve(); }
  getHistoricalData(deviceSn: string, field: string, query: { [key: string]: any } = {}) { return Promise.resolve(); }
  refreshDevices(devices?) { return Promise.resolve(); }
  filterDevices(filters?) { return Promise.resolve(); }
  refreshGroups(groups?) { return Promise.resolve(); }
  filterGroups(filters?) { return Promise.resolve(); }
  watchDnssd() { return Promise.resolve(); }
  unwatchDnssd() { return Promise.resolve(); }
  websocketLogin() { return Promise.resolve(); }
  requestProvisionToken(ttl?) { return Promise.resolve(); }
  requestGetMe() { return Promise.resolve(); }
  requestConfig(sn, config) { return Promise.resolve(); }
  requestSet(sn, commands) { return Promise.resolve(); }
  requestGet(sn) { return Promise.resolve(); }
  requestOta(sn, url, sha1, firmwareVersion) { return Promise.resolve(); }
  requestCalendar(sn, calendar) { return Promise.resolve(); }
  requestAddUser(sn, user) { return Promise.resolve(); }
  requestAddSharingDevice(token) { return Promise.resolve({ res: { data: undefined } }); }
  requestGetSharingToken(sn, userRole) { return Promise.resolve({ res: { data: undefined } }); }
  requestRemoveUser(sn, email) { return Promise.resolve(); }
  requestListUser(sn) { return Promise.resolve(); }
  requestListDevice() { return Promise.resolve(); }
  requestSetProperties(sn, properties) { return Promise.resolve(); }
  requestDeleteProperties(sn, properties) { return Promise.resolve(); }
  requestDeleteDevice(sn) { return Promise.resolve(); }
  requestSetGroup(group) { return Promise.resolve(); }
  requestGetGroup(name) { return Promise.resolve(); }
  requestDeleteGroup(name) { return Promise.resolve(); }
  requestListGroup() { return Promise.resolve(); }
  requestSetUserData(userData) { return Promise.resolve(); }
  requestDeleteUserData(keys) { return Promise.resolve(); }
  requestGetUserData() { return Promise.resolve(); }
  hasConnection(): boolean { return true; }
  hasCloudConnection(): boolean { return true; }
  disconnectWebsocket() { return Promise.resolve(); }
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
  fireApModeTask(ssid: string, password: string, security: string,
    url: string, provToken: string, provisionType?: string): Promise<any> { return Promise.resolve(); }
  getFirmwareList(model?: string | Array<string>): Promise<any> { return Promise.resolve(); }
  getHistoricalData(deviceSn: string, field: string, query: { [key: string]: any } = {}) { return Promise.resolve(); }
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

export class AccountServiceMock {
  setup(options?: any): void { }
  start(): Promise<any> { return Promise.resolve(); }
  stop(): Promise<any> { return Promise.resolve(); }
  checkSession(sessionUser: any): Promise<any> { return Promise.resolve(); }
  setAccount(account?: {}): Promise<any> { return Promise.resolve(); }
  getAccount(): Promise<any> { return Promise.resolve(); }
  setProvisionToken(tokenBundle: any): Promise<any> { return Promise.resolve(); }
  setPassword(account: any, password: any): Promise<any> { return Promise.resolve(); }
  getPassword(account: any): Promise<any> { return Promise.resolve(); }
  setUserData(userData?: Object): Promise<any> { return Promise.resolve(); }
  getUserData(): Promise<any> { return Promise.resolve(); }
  mergeUserData(newUserData: Object): Promise<any> { return Promise.resolve(); }
  getUserMe(): Promise<any> { return Promise.resolve(); }
  setUserMe(me?: Object): Promise<any> { return Promise.resolve(); }
  deleteUserDataByKeys(userDataKeys: Array<string>): Promise<any> { return Promise.resolve(); }
  logout(): Promise<any> { return Promise.resolve(); }
  clear(): Promise<any> { return Promise.resolve(); }
}