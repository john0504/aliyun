import { Injectable } from '@angular/core';
import { SQLite } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';

import { SqliteCore } from './sqlite-core';
import { WebSqlCore } from './web-sql-core';
import { Logger } from '../../../log/log-service';

@Injectable()
export class DatabaseService {

    private storageCore: StorageCore;

    constructor(
        private platform: Platform,
        private sqlite: SQLite,
    ) {
    }

    public setup(options = {}) {
        this.platform.ready()
            .then(() => {
                if (SQLite.installed()) {
                    this.storageCore = new SqliteCore(this.sqlite);
                } else {
                    // Now only works on Chrome and Safari (Webkit-based browser)
                    // Does not support Firefox, IE, or other non-webkit-based browsers
                    // Indexed DB would be better
                    this.storageCore = new WebSqlCore();
                }
            })
            .then(() => {
                this.storageCore.setup(options);
            });
    }

    public start(): Promise<any> {
        Logger.log('DatabaseModule initialize');
        return this.storageCore.initialize();
    }

    public stop(): Promise<any> {
        return this.storageCore.close();
    }

    public deleteStorage(): Promise<any> {
        return this.storageCore.deleteStorage();
    }

    public createDevice(sn: string): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.CREATE_DEVICE,
            args: [sn],
        });
    }

    public createDeviceWithOwner(sn: string, owner: string): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.CREATE_DEVICE_WITH_OWNER,
            args: [sn, owner],
        });
    }

    public deleteDeviceWithOwner(sn: string, owner: string): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DELETE_DEVICE_WITH_OWNER,
            args: [sn, owner],
        });
    }
    public deleteDevice(sn: string): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DELETE_DEVICE,
            args: [sn],
        });
    }

    public deviceUpdateConfig(sn: string, config: any): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_UPDATE_CONFIG,
            args: [sn, config],
        });
    }

    public deviceUpdateProfile(sn: string, profile: any): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_UPDATE_PROFILE,
            args: [sn, profile],
        });
    }

    public deviceUpdateCalendar(sn: string, calendar): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_UPDATE_CALENDAR,
            args: [sn, calendar],
        });
    }

    public deviceUpdateStatus(sn: string, command: Object): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_UPDATE_STATUS,
            args: [sn, command],
        });
    }

    public deviceUpdateProperties(sn: string, properties: Object): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_UPDATE_PROPERTIES,
            args: [sn, properties],
        });
    }

    public deviceDeleteProperties(sn: string, properties: Array<string>): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_DELETE_PROPERTIES,
            args: [sn, properties],
        });
    }

    public deviceAddUser(sn: string, user): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_ADD_USER,
            args: [sn, user],
        });
    }

    public deviceRemoveUser(sn: string, email: string): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_REMOVE_USER,
            args: [sn, email],
        });
    }

    public deviceUpdateUserList(sn: string, users): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_UPDATE_USER_LIST,
            args: [sn, users],
        });
    }

    public deviceUpdateConnectionState(sn: string, connected: number): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_UPDATE_CONNECTION_STATE,
            args: [sn, connected],
        });
    }

    public deviceUpdateDeviceState(sn: string, deviceState: string): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DEVICE_UPDATE_DEVICE_STATE,
            args: [sn, deviceState],
        });
    }

    public updateDevice(device): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.UPDATE_DEVICE,
            args: [device],
        });
    }

    public updateDeviceList(deviceData): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.UPDATE_DEVICE_LIST,
            args: [deviceData],
        });
    }

    public setGroup(group): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.SET_GROUP,
            args: [group],
        });
    }

    public deleteGroup(name: string): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.DELETE_GROUP,
            args: [name],
        });
    }

    public updateGroupList(groups: Array<string>): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.UPDATE_GROUP_LIST,
            args: [groups],
        });
    }

    public refreshDevices(devices?: Array<string>): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.REFRESH_DEVICES,
            args: [devices],
        });
    }

    public filterDevices(filters?): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.FILTER_DEVICES,
            args: [filters],
        });
    }

    public refreshGroups(groups?: Array<string>): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.REFRESH_GROUPS,
            args: [groups],
        });
    }

    public filterGroups(filters?): Promise<any> {
        return this.storageCore.doAction({
            type: ActionType.FILTER_GROUPS,
            args: [filters],
        });
    }
}

export interface StorageIO {

    setup(options);

    initialize(): Promise<any>;

    close(): Promise<any>;

    deleteStorage(): Promise<any>;
}

export interface ProcessCore {

    doAction(action: Action): Promise<any>;
}

export interface Action {
    type: string;
    args?: Array<any>;
}

export interface StorageCore extends StorageIO, ProcessCore {
}

export const ActionType = {
    CREATE_DEVICE: 'create-device',
    CREATE_DEVICE_WITH_OWNER: 'create-device-with-owner',
    UPDATE_DEVICE: 'update-device',
    DELETE_DEVICE: 'delete-device',
    DELETE_DEVICE_WITH_OWNER: 'delete-device-with-owner',
    UPDATE_DEVICE_LIST: 'update-device-list',

    DEVICE_UPDATE_CONFIG: 'device-update-config',
    DEVICE_UPDATE_PROFILE: 'device-update-profile',
    DEVICE_UPDATE_STATUS: 'device-update-status',
    DEVICE_UPDATE_CALENDAR: 'device-update-calendar',
    DEVICE_UPDATE_PROPERTIES: 'device-update-properties',
    DEVICE_DELETE_PROPERTIES: 'device-delete-properties',
    DEVICE_ADD_USER: 'device-add-user',
    DEVICE_REMOVE_USER: 'device-remove-user',
    DEVICE_UPDATE_USER_LIST: 'device-update-user-list',
    DEVICE_UPDATE_CONNECTION_STATE: 'device-update-connection-state',
    DEVICE_UPDATE_DEVICE_STATE: 'device-update-device-state',

    SET_GROUP: 'set-group',
    DELETE_GROUP: 'delete-group',
    UPDATE_GROUP_LIST: 'update-group-list',

    REFRESH_DEVICES: 'refresh-devices',
    FILTER_DEVICES: 'filter-devices',
    REFRESH_GROUPS: 'refresh-groups',
    FILTER_GROUPS: 'filter-groups',
};
