import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import isEqual from 'lodash/isEqual';

import { AppUtils } from './../utils/app-utils';

import {
  AppTasks,
  Logger,
  StateStore,
} from 'app-engine';

@Injectable()
export class DeviceConfigService {

    private devices$: Observable<any>;
    private devices;
    private account$: Observable<any>;
    private account;
    private workingMap: Map<string, Array<string>>;

    constructor(
      private appTasks: AppTasks,
      private stateStore: StateStore,
    ) {
        this.workingMap = new Map<string, Array<string>>();
        this.devices$ = this.stateStore.devices$;
        this.devices$
            .subscribe((devices) => {
                this.devices = devices;
            });
        this.account$ = this.stateStore.account$;
        this.account$
            .subscribe((account) => {
                this.account = account;
            });
    }

    public requestConfig(sn: string, fields: Array<string>): Promise<any> {
        if (!sn || !this.devices || !this.devices[sn] || this.workingMap.has(sn)) {
            return Promise.resolve();
        }
        let device = this.devices[sn];
        if (!this.account || !AppUtils.isOwner(device, this.account.account)) {
            Logger.log('Not a device owner');
            return Promise.resolve();
        }
        if (!device.properties || !device.properties.deviceHasBeenConfigured) {
            if (device.fields && isEqual(fields.sort(), device.fields.sort())) {
                return this.writeProperties(device);
            } else {
                this.workingMap.set(sn, fields);
                return this.appTasks.requestConfigTask(sn, { fields })
                    .then(() => {
                        return this.writeProperties(device);
                    })
                    .then(() => {
                        this.workingMap.delete(sn);
                    })
                    .catch((e) => {
                        this.workingMap.delete(sn);
                        return Promise.reject(e);
                    });
            }
        } else {
            Logger.log('Device has been configured');
            return Promise.resolve();
        }
    }

    private writeProperties(device): Promise<any> {
        let newProperties = {
            deviceHasBeenConfigured: true,
        };
        if (device.properties) {
            newProperties = Object.assign(
                {},
                device.properties,
                newProperties,
            );
        }
        return this.appTasks.wsRequestSetPropertiesTask(device.device, newProperties);
    }

}
