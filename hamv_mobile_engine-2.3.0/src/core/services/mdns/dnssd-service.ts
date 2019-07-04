import { Injectable } from '@angular/core';

import { Zeroconf, ZeroconfService, ZeroconfResult } from '@ionic-native/zeroconf';
import { Logger } from '../../../log/log-service';

@Injectable()
export class DnssdService {

    private static SERVICE_TYPE = '_exosh1._tcp.';

    private serviceMap;
    private dnssdCallback;

    constructor(
        private zeroconf: Zeroconf,
    ) {
        this.serviceMap = {};
    }

    public setup(options?) {
        let {brand, model} = options;
    }

    public start(): Promise<any> {
        Logger.log('DnssdModule initialize');
        return Promise.resolve();
    }

    public stop(): Promise<any> {
        return this.unwatch();
    }

    public setCallbacks(callbacks) {
        this.dnssdCallback = callbacks.dnssdCallback;
    }

    public watch(): Promise<any> {
        return this.unwatch()
            .then(() => {
                this.zeroconf.watch(DnssdService.SERVICE_TYPE, 'local')
                    .subscribe((record: ZeroconfResult) => {
                        Logger.log('dnssd record => ', record);
                        if (record.action === 'added') {
                            this.serviceMap[record.service.name] = record.service;
                        } else {
                            delete this.serviceMap[record.service.name];
                        }
                        this.notifyCallback();
                    }, (error) => {
                        Logger.log('mdns error => ', error);
                    }, () => {
                        Logger.log('onCompleted');
                    });
            });
    }

    public unwatch(): Promise<any> {
        return this.zeroconf.unwatch(DnssdService.SERVICE_TYPE, 'local')
            .then((message) => {
                Logger.log('unwatch => ', message);
                this.serviceMap = {};
                this.notifyCallback();
            });
    }

    private notifyCallback() {
        if (this.dnssdCallback) {
            let serviceList = [];
            for (let key in this.serviceMap) {
                serviceList.push(this.serviceMap[key]);
            }
            this.dnssdCallback(serviceList);
        }
    }
}
