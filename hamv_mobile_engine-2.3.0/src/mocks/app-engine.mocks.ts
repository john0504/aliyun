export class AccountServiceMock {
  setup(options?) { return Promise.resolve(); }
  start() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  setAccount(user) { return Promise.resolve(); }
  setPassword(user, password) { return Promise.resolve(); }
  getAccount() { return Promise.resolve(); }
  checkSession(sessionUser) { return Promise.resolve(); }
  getPassword(user) { return Promise.resolve(); }
  logout() { return Promise.resolve(); }
  setProvisionToken(token) { return Promise.resolve(); }
  setUserMe(userMe) { return Promise.resolve(); }
  getUserMe() { return Promise.resolve(); }
  mergeUserData(userData) { return Promise.resolve(); }
  deleteUserDataByKeys(userDataKeys) { return Promise.resolve(); }
  setUserData(userData) { return Promise.resolve(); }
  getUserData() { return Promise.resolve(); }
  clear() { return Promise.resolve(); }
}

export class DatabaseServiceMock {
  setup(options?) { return Promise.resolve(); }
  start() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  deleteStorage() { return Promise.resolve(); }
  refreshDevices(devices?: Array<string>) { return Promise.resolve(); }
  filterDevices(filters?) { return Promise.resolve(); }
  refreshGroups(groups?: Array<string>) { return Promise.resolve(); }
  filterGroups(filters?) { return Promise.resolve(); }
  createDevice(sn) { return Promise.resolve(); }
  deviceUpdateConfig(sn, config) { return Promise.resolve(); }
  deviceUpdateStatus(sn, command) { return Promise.resolve(); }
  updateDevice(device) { return Promise.resolve(); }
  deviceUpdateCalendar(sn, calendar) { return Promise.resolve(); }
  deviceAddUser(sn, user) { return Promise.resolve(); }
  deviceRemoveUser(sn, email) { return Promise.resolve(); }
  deviceUpdateUserList(sn, userList) { return Promise.resolve(); }
  updateDeviceList(deviceList) { return Promise.resolve(); }
  deviceUpdateProperties(sn, properties) { return Promise.resolve(); }
  deviceDeleteProperties(sn, properties) { return Promise.resolve(); }
  deleteDevice(sn) { return Promise.resolve(); }
  setGroup(group) { return Promise.resolve(); }
  deleteGroup(name) { return Promise.resolve(); }
  updateGroupList(groupList) { return Promise.resolve(); }
  deviceUpdateProfile(sn, profile) { return Promise.resolve(); }
  deviceUpdateConnectionState(sn, connected) { return Promise.resolve(); }
  deviceUpdateDeviceState(sn, deviceState) { return Promise.resolve(); }
  createDeviceWithOwner(sn, owner) { return Promise.resolve(); }
  deleteDeviceWithOwner(sn, owner) { return Promise.resolve(); }
}

export class MuranoApiServiceMock {
  setup(options?) { return Promise.resolve(); }
  start() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  getBaseUrl() { return ''; }
  setCallbacks(callbacks?) { return; }
  register(account, password) { return Promise.resolve(); }
  session(user) { return Promise.resolve(); }
  refreshToken(account, password) { return Promise.resolve(); }
  login(account, password) { return Promise.resolve(); }
  loginWithFacebook() { return Promise.resolve(); }
  requestResetPassword(email) { return Promise.resolve(); }
  disconnectWebsocket() { return Promise.resolve(); }
  logout(user) { return Promise.resolve(); }
  deleteAccount(user) { return Promise.resolve(); }
  requestUserData(user) { return Promise.resolve(); }
  queryDeviceInfo() { return Promise.resolve(); }
  fireApMode(ssid, password, security, url, provToken, provisionType?) { return Promise.resolve(); }
  getFirmwareList(model?: string | Array<string>) { return Promise.resolve(); }
  getHistoricalData(deviceSn: string, field: string, query: { [ key: string ]: any } = {}) { return Promise.resolve(); }
  websocketLogin() { return Promise.resolve(); }
  requestProvisionToken(ttl?) { return Promise.resolve({ res: { data: undefined } }); }
  requestGetMe() { return Promise.resolve({ res: { data: undefined } }); }
  requestConfig(sn, config) { return Promise.resolve({ res: { data: undefined } }); }
  requestSet(sn, command) { return Promise.resolve({ res: { data: undefined } }); }
  requestGet(sn) { return Promise.resolve({ res: { data: undefined } }); }
  requestOta(sn, url, sha1, firmwareVersion) { return Promise.resolve({ res: { data: undefined } }); }
  requestCalendar(sn, calendar) { return Promise.resolve({ res: { data: undefined } }); }
  requestAddUser(sn, user) { return Promise.resolve({ res: { data: undefined } }); }
  requestAddSharingDevice(token) { return Promise.resolve({ res: { data: undefined } }); }
  requestGetSharingToken(sn, userRole) { return Promise.resolve({ res: { data: undefined } }); }
  requestRemoveUser(sn, email) { return Promise.resolve({ res: { data: undefined } }); }
  requestListUser(sn) { return Promise.resolve({ res: { data: undefined } }); }
  requestListDevice() { return Promise.resolve({ res: { data: undefined } }); }
  requestSetProperties(sn, properties) { return Promise.resolve({ res: { data: undefined } }); }
  requestDeleteProperties(sn, properties) { return Promise.resolve({ res: { data: undefined } }); }
  requestDeleteDevice(sn) { return Promise.resolve({ res: { data: undefined } }); }
  requestSetGroup(group) { return Promise.resolve({ res: { data: undefined } }); }
  requestGetGroup(name) { return Promise.resolve({ res: { data: undefined } }); }
  requestDeleteGroup(name) { return Promise.resolve({ res: { data: undefined } }); }
  requestListGroup() { return Promise.resolve({ res: { data: undefined } }); }
  requestSetUserData(userData) { return Promise.resolve({ res: { data: undefined } }); }
  requestDeleteUserData(userDataKeys) { return Promise.resolve({ res: { data: undefined } }); }
  requestGetUserData() { return Promise.resolve({ res: { data: undefined } }); }
  isWebSocketOpened() { return true; }
}

export class DnssdServiceMock {
  setup(options?) { return Promise.resolve(); }
  start() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  setCallbacks(callbacks) { }
  watch() { return Promise.resolve(); }
  unwatch() { return Promise.resolve(); }
}

export class WebSocketMessageDispatcherMock {
  onEventReceived(event) { }
  subscribe(eventId: string, next: Function, error: Function) { }
  unsubscribe(eventId: string) { }
}

export class AppEngineMock {
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
  deleteAccount() { return Promise.resolve(); }
  removeAllData() { return Promise.resolve(); }
  requestUserData() { return Promise.resolve(); }
  queryDeviceInfo() { return Promise.resolve(); }
  fireApMode(ssid, password, security, url, provToken, provisionType?) { return Promise.resolve(); }
  getFirmwareList(model?: string | Array<string>) { return Promise.resolve(); }
  getHistoricalData(deviceSn: string, field: string, query: { [ key: string ]: any } = {}) { return Promise.resolve(); }
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
}
