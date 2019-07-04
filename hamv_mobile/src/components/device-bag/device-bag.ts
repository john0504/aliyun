import {
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';

import { StateStore } from 'app-engine';

@Component({
    selector: 'device-bag',
    templateUrl: 'device-bag.html'
})
export class DeviceBagComponent implements OnInit, OnDestroy {

    private subs: Array<Subscription>;
    private devices$: Observable<any>;

    _deviceId;
    _device;

    constructor(
      private stateStore: StateStore,
    ) {
        this.subs = [];

        this.devices$ = this.stateStore.devices$;
    }

    @Input()
    set deviceId(val: any) {
        if (val) {
            this._deviceId = val;
        }
    }

    get deviceId() {
        return this._deviceId;
    }

    public ngOnInit(): void {
        this.subs.push(
            this.devices$
                .subscribe(devices => {
                    if (this._deviceId && devices[this._deviceId]) {
                        this._device = devices[this._deviceId];
                    }
                })
        );
    }

    public ngOnDestroy(): void {
        this.subs && this.subs.forEach((s) => {
            s.unsubscribe();
        });
        this.subs.length = 0;
    }
}
