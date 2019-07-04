
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgRedux } from '@angular-redux/store';

import { AppState } from './app-state';
import { ZeroconfService } from '@ionic-native/zeroconf';
import { Account } from '../../core/models/account';
import { UserMe } from '../../core/models/user-me';

@Injectable()
export class StateStore {

    constructor(
        private ngRedux: NgRedux<any>,
    ) { }

    public get core$(): Observable<AppState> {
        return this.ngRedux.select(['core']);
    }

    public get isInitialized$(): Observable<boolean> {
        return this.ngRedux.select(['core', 'isInitialized']);
    }

    public get account$(): Observable<Account> {
        return this.ngRedux.select(['core', 'account']);
    }

    public get isAuthenticated$(): Observable<boolean> {
        return this.ngRedux.select(['core', 'isAuthenticated']);
    }

    public get userData$(): Observable<Object> {
        return this.ngRedux.select(['core', 'userData']);
    }

    public get userMe$(): Observable<UserMe> {
        return this.ngRedux.select(['core', 'userMe']);
    }

    public get devices$(): Observable<Object> {
        return this.ngRedux.select(['core', 'devices']);
    }

    public get deviceDisplayList$(): Observable<Array<string>> {
        return this.ngRedux.select(['core', 'deviceDisplayList']);
    }
    public get groups$(): Observable<Array<string>> {
        return this.ngRedux.select(['core', 'groups']);
    }

    public get groupDisplayList$(): Observable<Array<string>> {
        return this.ngRedux.select(['core', 'groupDisplayList']);
    }

    public get dnssdServices$(): Observable<any> {
        return this.ngRedux.select(['core', 'dnssdServices']);
    }

    public get error$(): Observable<any> {
        return this.ngRedux.select(['errors']);
    }
}
