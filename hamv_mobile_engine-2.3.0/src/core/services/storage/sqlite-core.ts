import * as JsonMergePatch from 'json-merge-patch';

import { SQLite } from '@ionic-native/sqlite';
import { StorageCore, Action, ActionType } from './db-service';
import { SqliteDatabase } from './database/sqlite-database';
import { Device } from '../../models/device';
import { Group } from '../../models/group';

export class SqliteCore implements StorageCore {

    private _db: SqliteDatabase;

    constructor(
        private sqlite: SQLite
    ) {
        this._db = new SqliteDatabase(sqlite);
    }

    public setup(options = {}) {
    }

    public initialize(): Promise<any> {
        return this._db.initialize();
    }

    public close(): Promise<any> {
        return this._db.close();
    }

    public deleteStorage(): Promise<any> {
        let queries = [
            'DELETE FROM device_model',
            'DELETE FROM group_model',
            'DELETE FROM device_group_model',
        ];
        return this._db.sqlBatch(queries);
    }

    public doAction(action: Action): Promise<any> {
        switch (action.type) {
            case ActionType.CREATE_DEVICE: {
                let [sn] = action.args;
                return this.createDevice(sn);
            }
            case ActionType.CREATE_DEVICE_WITH_OWNER: {
                let [sn, owner] = action.args;
                return this.createDeviceWithOwner(sn, owner);
            }
            case ActionType.DELETE_DEVICE: {
                let [sn] = action.args;
                return this.deleteDevice(sn);
            }
            case ActionType.DELETE_DEVICE_WITH_OWNER: {
                let [sn, owner] = action.args;
                return this.deleteDeviceWithOwner(sn, owner);
            }
            case ActionType.DEVICE_UPDATE_CONFIG: {
                let [sn, config] = action.args;
                return this.deviceUpdateConfig(sn, config);
            }
            case ActionType.DEVICE_UPDATE_CALENDAR: {
                let [sn, calendar] = action.args;
                return this.deviceUpdateCalendar(sn, calendar);
            }
            case ActionType.DEVICE_UPDATE_STATUS: {
                let [sn, command] = action.args;
                return this.deviceUpdateStatus(sn, command);
            }
            case ActionType.DEVICE_UPDATE_PROFILE: {
                let [sn, profile] = action.args;
                return this.deviceUpdateProfile(sn, profile);
            }
            case ActionType.DEVICE_UPDATE_PROPERTIES: {
                let [sn, properties] = action.args;
                return this.deviceUpdateProperties(sn, properties);
            }
            case ActionType.DEVICE_DELETE_PROPERTIES: {
                let [sn, properties] = action.args;
                return this.deviceDeleteProperties(sn, properties);
            }
            case ActionType.DEVICE_ADD_USER: {
                let [sn, user] = action.args;
                return this.deviceAddUser(sn, user);
            }
            case ActionType.DEVICE_REMOVE_USER: {
                let [sn, email] = action.args;
                return this.deviceRemoveUser(sn, email);
            }
            case ActionType.DEVICE_UPDATE_USER_LIST: {
                let [sn, users] = action.args;
                return this.deviceUpdateUserList(sn, users);
            }
            case ActionType.DEVICE_UPDATE_CONNECTION_STATE: {
                let [sn, connected] = action.args;
                return this.deviceUpdateConnectionState(sn, connected);
            }
            case ActionType.DEVICE_UPDATE_DEVICE_STATE: {
                let [sn, deviceState] = action.args;
                return this.deviceUpdateDeviceState(sn, deviceState);
            }
            case ActionType.UPDATE_DEVICE: {
                let [device] = action.args;
                return this.updateDevice(device);
            }
            case ActionType.UPDATE_DEVICE_LIST: {
                let [deviceData] = action.args;
                return this.updateDeviceList(deviceData);
            }
            case ActionType.SET_GROUP: {
                let [group] = action.args;
                return this.setGroup(group);
            }
            case ActionType.DELETE_GROUP: {
                let [name] = action.args;
                return this.deleteGroup(name);
            }
            case ActionType.UPDATE_GROUP_LIST: {
                let [groups] = action.args;
                return this.updateGroupList(groups);
            }
            case ActionType.REFRESH_DEVICES: {
                let [devices] = action.args;
                return this.refreshDevices(devices);
            }
            case ActionType.FILTER_DEVICES: {
                let [filters] = action.args;
                return this.filterDevices(filters);
            }
            case ActionType.REFRESH_GROUPS: {
                let [groups] = action.args;
                return this.refreshGroups(groups);
            }
            case ActionType.FILTER_GROUPS: {
                let [filters] = action.args;
                return this.filterGroups(filters);
            }
            default:
                return Promise.reject('Action is not supported');
        }
    }

    private createDevice(sn: string): Promise<any> {
        let query = {
            sql: 'INSERT OR IGNORE INTO device_model (device_sn) VALUES (?);',
            params: [sn]
        };

        return this.executeSql(query);
    }

    private createDeviceWithOwner(sn: string, owner: string): Promise<any> {
        let queries = [];
        queries.push({
            sql: 'INSERT OR IGNORE INTO device_model (device_sn) VALUES (?);',
            params: [sn]
        });
        queries.push({
            sql: 'UPDATE device_model SET owner=? WHERE device_sn=?;',
            params: [owner, sn]
        });

        return this.executeSqlBatch(queries);
    }

    private deleteDeviceWithOwner(sn: string, owner: string): Promise<any> {
        let query = {
            sql: 'DELETE FROM device_model WHERE device_sn=? AND owner=?;',
            params: [sn, owner]
        };

        return this.executeSql(query);
    }

    private deleteDevice(sn: string): Promise<any> {
        let query = {
            sql: 'DELETE FROM device_model WHERE device_sn=?;',
            params: [sn]
        };

        return this.executeSql(query);
    }

    private deviceUpdateConfig(sn: string, config: any): Promise<any> {
        let fields = config ? config.fields : [];
        let query = {
            sql: 'UPDATE device_model SET fields=? WHERE device_sn=?;',
            params: [JSON.stringify(fields), sn]
        };

        return this.executeSql(query);
    }

    private deviceUpdateStatus(sn: string, command?: Object): Promise<any> {
        if (!command) return Promise.resolve();
        return this._db.transaction((tx) => {
            tx.executeSql(
                'SELECT status FROM device_model WHERE device_sn=?',
                [sn],
                (tx, rx) => {
                    if (rx.rows.length > 0) {
                        let statusString = rx.rows.item(0).status;
                        let status = statusString ? JSON.parse(statusString) : {};
                        Object.assign(status, command);
                        tx.executeSql(
                            'UPDATE device_model SET status=? WHERE device_sn=?;',
                            [JSON.stringify(status), sn]
                        );
                    }
                });
        });
    }

    private deviceUpdateProfile(sn: string, profile: any): Promise<any> {
        if (!profile) return Promise.resolve();
        let profile_esh_class = '',
            profile_esh_esh_version = '',
            profile_esh_device_id = '',
            profile_esh_brand = '',
            profile_esh_model = '',
            profile_module_fw_version = '',
            profile_module_mac_address = '',
            profile_module_local_ip = '',
            profile_module_ssid = '',
            profile_cert = '{}';
        if (profile && profile.esh) {
            profile_esh_class = profile.esh.class || '';
            profile_esh_esh_version = profile.esh.esh_version || '';
            profile_esh_device_id = profile.esh.device_id || '';
            profile_esh_brand = profile.esh.brand || '';
            profile_esh_model = profile.esh.model || '';
        }
        if (profile && profile.module) {
            profile_module_fw_version = profile.module.firmware_version || '';
            profile_module_mac_address = profile.module.mac_address || '';
            profile_module_local_ip = profile.module.local_ip || '';
            profile_module_ssid = profile.module.ssid || '';
        }
        if (profile && profile.cert) {
            profile_cert = JSON.stringify(profile.cert);
        }

        let query = {
            sql: 'UPDATE device_model SET profile_esh_class=?, profile_esh_esh_version=?, profile_esh_device_id=?, profile_esh_brand=?, profile_esh_model=?, profile_module_fw_version=?, profile_module_mac_address=?, profile_module_local_ip=?, profile_module_ssid=?, profile_cert=? WHERE device_sn=?;',
            params: [profile_esh_class, profile_esh_esh_version, profile_esh_device_id, profile_esh_brand, profile_esh_model, profile_module_fw_version, profile_module_mac_address, profile_module_local_ip, profile_module_ssid, profile_cert, sn]
        };
        return this.executeSql(query);
    }

    private deviceUpdateProperties(sn: string, properties?: Array<string>): Promise<any> {
        if (!properties) return Promise.resolve();
        return this._db.transaction((tx) => {
            tx.executeSql(
                'SELECT properties FROM device_model WHERE device_sn=?',
                [sn],
                (tx, rx) => {
                    if (rx.rows.length > 0) {
                        let propertiesString = rx.rows.item(0).properties;
                        let p = propertiesString ? JSON.parse(propertiesString) : {};
                        JsonMergePatch.apply(p, properties);
                        tx.executeSql(
                            'UPDATE device_model SET properties=? WHERE device_sn=?;',
                            [JSON.stringify(properties), sn]
                        );
                    }
                });
        });
    }

    private deviceDeleteProperties(sn: string, properties: Object): Promise<any> {
        return this._db.transaction((tx) => {
            tx.executeSql(
                'SELECT properties FROM device_model WHERE device_sn=?',
                [sn],
                (tx, rx) => {
                    if (rx.rows.length > 0) {
                        let propertiesString = rx.rows.item(0).properties;
                        let p = propertiesString ? JSON.parse(propertiesString) : {};
                        for (let key in properties) {
                            delete p[key];
                        }
                        tx.executeSql(
                            'UPDATE device_model SET properties=? WHERE device_sn=?;',
                            [JSON.stringify(p), sn]
                        );
                    }
                });
        });
    }

    private deviceUpdateCalendar(sn: string, calendar): Promise<any> {
        calendar = Array.isArray(calendar) ? calendar : [];
        let query = {
            sql: 'UPDATE device_model SET calendar=? WHERE device_sn=?;',
            params: [JSON.stringify(calendar), sn]
        };

        return this.executeSql(query);
    }

    private deviceAddUser(sn: string, user): Promise<any> {
        return this._db.transaction((tx) => {
            tx.executeSql(
                'SELECT users FROM device_model WHERE device_sn=?',
                [sn],
                (tx, rx) => {
                    if (rx.rows.length > 0) {
                        let usersString = rx.rows.item(0).users;
                        let users = usersString ? JSON.parse(usersString) : [];
                        users.push(user);
                        tx.executeSql(
                            'UPDATE device_model SET users=? WHERE device_sn=?;',
                            [JSON.stringify(users), sn]
                        );
                    }
                });
        });
    }

    private deviceRemoveUser(sn: string, email: string): Promise<any> {
        return this._db.transaction((tx) => {
            tx.executeSql(
                'SELECT users FROM device_model WHERE device_sn=?',
                [sn],
                (tx, rx) => {
                    if (rx.rows.length > 0) {
                        let usersString = rx.rows.item(0).users;
                        let users = usersString ? JSON.parse(usersString) : [];
                        let index = users.findIndex((element, index, array) => {
                            return element.email === email;
                        });
                        if (index > -1) {
                            users.splice(index, 1);
                        }
                        tx.executeSql(
                            'UPDATE device_model SET users=? WHERE device_sn=?;',
                            [JSON.stringify(users), sn]
                        );
                    }
                });
        });
    }

    private deviceUpdateUserList(sn: string, users?): Promise<any> {
        if (!users) return Promise.resolve();
        let query = {
            sql: 'UPDATE device_model SET users=? WHERE device_sn=?;',
            params: [JSON.stringify(users), sn]
        };

        return this.executeSql(query);
    }

    private deviceUpdateConnectionState(sn: string, connected?: number): Promise<any> {
        if (!(connected === 0 || connected === 1)) return Promise.resolve();
        let query = {
            sql: 'UPDATE device_model SET connected=? WHERE device_sn=?;',
            params: [connected, sn]
        };

        return this.executeSql(query);
    }

    private deviceUpdateDeviceState(sn: string, deviceState?: string): Promise<any> {
        if (!deviceState) return Promise.resolve();
        let query = {
            sql: 'UPDATE device_model SET device_state=? WHERE device_sn=?;',
            params: [deviceState, sn]
        };

        return this.executeSql(query);
    }

    private updateDevice(device): Promise<any> {
        let sn = device.device,
            connected = device.connected,
            device_state = device.device_state,
            profile_esh_class = '',
            profile_esh_esh_version = '',
            profile_esh_device_id = '',
            profile_esh_brand = '',
            profile_esh_model = '',
            profile_module_fw_version = '',
            profile_module_mac_address = '',
            profile_module_local_ip = '',
            profile_module_ssid = '',
            profile_cert = '{}',
            calendar = '[]',
            status = '{}',
            fields = '[]',
            fields_range = '[]',
            users = '[]';
        if (device.profile && device.profile.esh) {
            profile_esh_class = device.profile.esh.class || '';
            profile_esh_esh_version = device.profile.esh.esh_version || '';
            profile_esh_device_id = device.profile.esh.device_id || '';
            profile_esh_brand = device.profile.esh.brand || '';
            profile_esh_model = device.profile.esh.model || '';
        }
        if (device.profile && device.profile.module) {
            profile_module_fw_version = device.profile.module.firmware_version || '';
            profile_module_mac_address = device.profile.module.mac_address || '';
            profile_module_local_ip = device.profile.module.local_ip || '';
            profile_module_ssid = device.profile.module.ssid || '';
        }
        if (device.profile && device.profile.cert) {
            profile_cert = JSON.stringify(device.profile.cert);
        }
        if (device.calendar) {
            let c = Array.isArray(device.calendar) ? device.calendar : [];
            calendar = JSON.stringify(c);
        }
        if (device.status) {
            status = JSON.stringify(device.status);
        }
        if (device.fields) {
            let f = Array.isArray(device.fields) ? device.fields : [];
            fields = JSON.stringify(f);
        }
        if (device.fields_range) {
            let f = Array.isArray(device.fields_range) ? device.fields_range : [];
            fields_range = JSON.stringify(f);
        }
        if (device.users) {
            let u = Array.isArray(device.users) ? device.users : [];
            users = JSON.stringify(u);
        }

        let queries = [];
        queries.push({
            sql: 'UPDATE device_model SET connected=?, device_state=?, profile_esh_class=?, profile_esh_esh_version=?, profile_esh_device_id=?, profile_esh_brand=?, profile_esh_model=?, profile_module_fw_version=?, profile_module_mac_address=?, profile_module_local_ip=?, profile_module_ssid=?, profile_cert=?, calendar=?, status=?, fields=?, fields_range=?, users=? WHERE device_sn=?;',
            params: [connected, device_state, profile_esh_class, profile_esh_esh_version, profile_esh_device_id, profile_esh_brand, profile_esh_model, profile_module_fw_version, profile_module_mac_address, profile_module_local_ip, profile_module_ssid, profile_cert, calendar, status, fields, fields_range, users, sn]
        });

        return this.executeSqlBatch(queries);
    }

    private updateDeviceList(deviceData): Promise<any> {
        let devices = [];
        deviceData = Array.isArray(deviceData) ? deviceData : [];
        let queries = [];
        deviceData.forEach((role) => {
            queries.push({
                sql: 'INSERT OR IGNORE INTO device_model (device_sn) VALUES (?);',
                params: [role.device]
            });
            queries.push({
                sql: 'UPDATE device_model SET owner=?, role=?, properties=? WHERE device_sn=?;',
                params: [role.owner, role.role, JSON.stringify(role.properties || {}), role.device]
            });
            devices.push(role.device);
        });

        let sqlBase = 'DELETE FROM device_model';
        let sqlQuery;
        let params = devices;

        if (!devices || devices.length === 0) {
            sqlQuery = sqlBase + ';';
        } else {
            let pp = devices.reduce((questionMarks, deviceSn) => {
                return questionMarks + '?,'
            }, '');
            pp = pp.substr(0, pp.length - 1);
            sqlQuery = sqlBase + ' WHERE device_sn NOT IN (' + pp + ');';
        }
        queries.push({ sql: sqlQuery, params: params });
        return this.executeSqlBatch(queries)
            .then(() => {
                return devices;
            });
    }

    private setGroup(group): Promise<any> {
        if (!group || !group.name) return Promise.reject('Illegal group or no group name');
        let queries = [];
        if (group.name) {
            queries.push({
                sql: 'INSERT OR IGNORE INTO group_model (group_id) VALUES (?);',
                params: [group.name]
            });
        }
        if (group.properties) {
            queries.push({
                sql: 'UPDATE group_model SET properties=? WHERE group_id=?;',
                params: [JSON.stringify(group.properties || {}), group.name]
            });
        }
        if (group.devices) {
            group.devices = Array.isArray(group.devices) ? group.devices : [];
            queries.push({
                sql: 'DELETE FROM device_group_model WHERE group_id=?;',
                params: [group.name]
            });
            group.devices.forEach(
                (deviceSn) => {
                    queries.push({
                        sql: 'INSERT OR IGNORE INTO device_group_model (device_sn, group_id) VALUES (?, ?);',
                        params: [deviceSn, group.name]
                    });
                });
        }

        return this.executeSqlBatch(queries);
    }

    private deleteGroup(name: string): Promise<any> {
        if (!name) return Promise.reject('No group name');
        let query = {
            sql: 'DELETE FROM group_model WHERE group_id=?;',
            params: [name]
        };

        return this.executeSql(query);
    }

    private updateGroupList(groups: Array<string>): Promise<any> {
        return this._db
            .transaction((tx) => {
                let sqlBase = 'DELETE FROM group_model';
                let sqlQuery;
                groups = Array.isArray(groups) ? groups : [];
                if (!groups || groups.length === 0) {
                    sqlQuery = sqlBase + ';';
                } else {
                    groups.forEach((groupId) => {
                        tx.executeSql(
                            'INSERT OR IGNORE INTO group_model (group_id) VALUES (?);',
                            [groupId]
                        );
                    });

                    let pp = groups.reduce((questionMarks, deviceSn) => {
                        return questionMarks + '?,'
                    }, '');
                    pp = pp.substr(0, pp.length - 1);
                    sqlQuery = sqlBase + ' WHERE group_id NOT IN (' + pp + ');';
                }
                tx.executeSql(sqlQuery, groups);
            })
            .then(() => {
                return groups;
            });
    }

    private executeSql(query): Promise<any> {
        return this._db.query(query.sql, query.params);
    }

    private executeSqlBatch(queries): Promise<any> {
        const batch = [];
        queries.forEach((query) => {
            batch.push([query.sql, query.params]);
        });
        return this._db.sqlBatch(batch);
    }

    private refreshDevices(devices?: Array<string>): Promise<any> {
        let sqlBase = 'SELECT * FROM device_model';
        let sqlQuery;
        let params = devices || [];
        devices = Array.isArray(devices) ? devices : [];
        if (!devices || devices.length === 0) {
            sqlQuery = sqlBase + ';';
        } else {
            let pp = devices.reduce((questionMarks, deviceSn) => {
                return questionMarks + '?,'
            }, '');
            pp = pp.substr(0, pp.length - 1);
            sqlQuery = sqlBase + ' WHERE device_sn IN (' + pp + ');';
        }

        return this._db.query(sqlQuery, params)
            .then((res) => {
                let result = {};
                let promises = [];
                for (let i = 0; i < res.rows.length; i++) {
                    let device: Device = this.makeDevice(res.rows.item(i));
                    result[device.device] = device;
                    let p = this.groupsForDevice(device);
                    promises.push(p);
                }
                return Promise.all(promises)
                    .then(() => {
                        return result;
                    });
            });
    }

    private makeDevice(dCursor): Device {
        return {
            device: dCursor.device_sn,
            connected: dCursor.connected,
            deviceState: dCursor.device_state,
            profile: {
                esh: {
                    class: dCursor.profile_esh_class,
                    eshVersion: dCursor.profile_esh_esh_version,
                    deviceId: dCursor.profile_esh_device_id,
                    brand: dCursor.profile_esh_brand,
                    model: dCursor.profile_esh_model,
                },
                module: {
                    firmwareVersion: dCursor.profile_module_fw_version,
                    macAddress: dCursor.profile_module_mac_address,
                    localIp: dCursor.profile_module_local_ip,
                    ssid: dCursor.profile_module_ssid,
                },
                cert: dCursor.profile_cert ? JSON.parse(dCursor.profile_cert) : {},
            },
            calendar: dCursor.calendar ? JSON.parse(dCursor.calendar) : [],
            status: dCursor.status ? JSON.parse(dCursor.status) : {},
            fields: dCursor.fields ? JSON.parse(dCursor.fields) : [],
            fields_range: dCursor.fields_range ? JSON.parse(dCursor.fields_range) : [],
            users: dCursor.users ? JSON.parse(dCursor.users) : [],
            groups: [],
            role: dCursor.role,
            owner: dCursor.owner,
            properties: dCursor.properties ? JSON.parse(dCursor.properties) : {},
        };
    }

    private groupsForDevice(device): Promise<any> {
        return this._db.query('SELECT * FROM device_group_model WHERE device_sn=?', [device.device])
            .then((res) => {
                if (res.rows.length > 0) {
                    for (let j = 0; j < res.rows.length; j++) {
                        device.groups.push(res.rows.item(j).group_id);
                    }
                }
            });
    }

    private filterDevices(filters?): Promise<any> {
        return this._db.query('SELECT device_sn FROM device_model')
            .then((res) => {
                let result = [];
                if (res.rows.length > 0) {
                    for (let i = 0; i < res.rows.length; i++) {
                        result.push(res.rows.item(i).device_sn);
                    }
                }
                return result;
            });
    }

    private refreshGroups(groups?: Array<string>): Promise<any> {
        let sqlBase = 'SELECT * FROM group_model';
        let sqlQuery;
        let params = groups || [];
        groups = Array.isArray(groups) ? groups : [];
        if (!groups || groups.length === 0) {
            sqlQuery = sqlBase + ';';
        } else {
            let pp = groups.reduce((questionMarks, groupId) => {
                return questionMarks + '?,'
            }, '');
            pp = pp.substr(0, pp.length - 1);
            sqlQuery = sqlBase + ' WHERE group_id IN (' + pp + ');';
        }

        return this._db.query(sqlQuery, params)
            .then((res) => {
                let result = {};
                let promises = [];
                for (let i = 0; i < res.rows.length; i++) {
                    let group: Group = this.makeGroup(res.rows.item(i));
                    result[group.name] = group;
                    let p = this.devicesForGroup(group);
                    promises.push(p);
                }
                return Promise.all(promises)
                    .then(() => {
                        return result;
                    });
            });
    }

    private makeGroup(gCursor): Group {
        return {
            name: gCursor.group_id,
            devices: [],
            properties: gCursor.properties ? JSON.parse(gCursor.properties) : null,
        };
    }

    private devicesForGroup(group: Group): Promise<any> {
        return this._db.query('SELECT * FROM device_group_model WHERE group_id=?', [group.name])
            .then((res) => {
                if (res.rows.length > 0) {
                    for (let j = 0; j < res.rows.length; j++) {
                        group.devices.push(res.rows.item(j).device_sn);
                    }
                }
            });
    }

    private filterGroups(filters?): Promise<any> {
        return this._db.query('SELECT group_id FROM group_model ORDER BY group_id ASC')
            .then((res) => {
                let result = [];
                if (res.rows.length > 0) {
                    for (let i = 0; i < res.rows.length; i++) {
                        result.push(res.rows.item(i).group_id);
                    }
                }
                return result;
            });
    }
}
