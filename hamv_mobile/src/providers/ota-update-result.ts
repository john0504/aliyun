import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { StateStore } from 'app-engine';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { flatMap, filter, throttleTime } from 'rxjs/operators';
import * as semver from 'semver';

import { debounceImmediate } from '../app/app.extends';
import { PopupService } from '../providers/popup-service';
import { AppUtils } from '../utils/app-utils';

@Injectable()
export class OtaUpdateResult {
  private account$: Observable<any>;
  private devices$: Observable<any>;
  private updatingDevices = {};

  isOwner: boolean;
  subs: Array<Subscription>;

  constructor(
    private popupService: PopupService,
    private stateStore: StateStore,
    private translate: TranslateService,
  ) {
    this.account$ = this.stateStore.account$;
    this.devices$ = this.stateStore.devices$;
    this.subs = [];
  }

  public start() {
    this.stateStore.isAuthenticated$
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.getUpdatingDevices();
        } else {
          this.subs.forEach(sub => sub.unsubscribe());
        }
      });
  }

  private getUpdatingDevices() {
    this.subs.push(
      this.devices$
        .pipe(
          throttleTime(500),
          flatMap(devices => Object.keys(devices).map(sn => devices[sn])),
          filter(device => AppUtils.isDeviceUpdate(device)),
        )
        .subscribe(device => {
          this.account$.subscribe(account => this.isOwner = AppUtils.isOwner(device, account.account));
          const sn = device.device;
          if (!this.updatingDevices[sn] && this.isOwner) {
            this.updatingDevices[sn] = device;
          }
        })
    );

    this.subs.push(
      this.devices$
        .pipe(
          debounceImmediate(5000),
          flatMap(devices => Object.keys(devices).map(sn => devices[sn])),
          filter(device => this.updatingDevices[device.device] && !AppUtils.isDeviceUpdate(device)),
          throttleTime(500),
        )
        .subscribe((device) => {
          const sn = device.device;
          const preVersion = this.updatingDevices[sn].profile.module.firmwareVersion;
          const version = device.profile.module.firmwareVersion;
          const deviceName = device.properties.displayName;

          this.showOTAResultPopup(deviceName, version, preVersion);
          delete this.updatingDevices[sn];
        })
    );
  }

  private showOTAResultPopup(deviceName: string, version: string, preVersion: string) {
    let validVersion = null;
    if (semver.valid(preVersion) && semver.valid(version)) {
      validVersion = semver.lt(preVersion, version);
    }

    let message;
    if (validVersion) {
      message = this.translate.instant('OTA_UPDATE_RESULT.SUCCEED_MSG', { deviceName });
    } else {
      message = this.translate.instant('OTA_UPDATE_RESULT.FAILED_MSG', { deviceName });
    }

    this.popupService.makeToast({
      duration: 5000,
      message,
      position: 'bottom',
    });
  }
}
