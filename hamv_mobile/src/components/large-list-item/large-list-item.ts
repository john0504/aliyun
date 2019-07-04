import { Component, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { StateStore } from 'app-engine';
import { NavController, ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { debounceImmediate } from '../../app/app.extends';
import { DeviceCore } from '../../item-models/device/device-core';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';

@Component({
  selector: "large-list-item",
  templateUrl: "large-list-item.html"
})
export class LargeListItemComponent implements OnInit, OnDestroy {
  private subs: Array<Subscription>;
  private devices$: Observable<any>;

  _deviceSn: any;
  deviceCore: DeviceCore;
  isValidDevice: Boolean = false;

  constructor(
    private dcInjector: DeviceCoreInjector,
    private navCtrl: NavController,
    private stateStore: StateStore,
    public viewCtrl: ViewController
  ) {
    this.subs = [];
    this.devices$ = this.stateStore.devices$;
    this.deviceCore = this.dcInjector.create();
  }

  @Input()
  get deviceSn(): any {
    return this._deviceSn;
  }

  set deviceSn(val: any) {
    this._deviceSn = val;
  }

  @HostListener("window:model-loaded", ["$event"])
  reload(event) {
    this.deviceCore && this.deviceCore.selfUpdate();
  }

  ngOnInit() {
    this.subs.push(
      this.devices$
        .pipe(debounceImmediate(500))
        .subscribe(devices => this.processValues(devices))
    );
  }

  ngOnDestroy() {
    this.subs && this.subs.forEach(s => {
        s.unsubscribe();
      });
    this.subs.length = 0;
  }

  private processValues(devices) {
    this.isValidDevice = this.validateDevices(devices);
    if (this.isValidDevice) {
      const device = devices[this._deviceSn];

      this.deviceCore = this.dcInjector.bind(this.deviceCore, device);
      this.deviceCore.selfUpdate();
    }
  }

  private validateDevices(devices) {
    return this._deviceSn && devices && devices[this._deviceSn];
  }

  goDeviceDetailPage() {
    this.navCtrl.push("DeviceDetailPage", { deviceSn: this._deviceSn });
  }
}
