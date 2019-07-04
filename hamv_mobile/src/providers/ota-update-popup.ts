import { FirmwareUpdate } from './ota-update-popup';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AppTasks, StateStore } from 'app-engine';
import { AlertController } from 'ionic-angular';
import * as semver from 'semver';
import { Observable } from 'rxjs/Observable';

import { AppUtils } from '../utils/app-utils';

@Injectable()
export class OtaUpdatePopup {
  private account;
  private account$: Observable<any>;
  private devices;
  private devices$: Observable<any>;
  private devicesSn;
  private deviceDisplayList$: Observable<any>;
  private showAgain: boolean = true;
  private shouldUpdatedDevices;

  constructor(
    private alertCtrl: AlertController,
    private appTasks: AppTasks,
    private stateStore: StateStore,
    private translate: TranslateService,
  ) {
    this.account$ = this.stateStore.account$;
    this.account$.subscribe(account => this.account = account);

    this.devices$ = this.stateStore.devices$;
    this.devices$.subscribe(devices => this.devices = devices);

    this.deviceDisplayList$ = this.stateStore.deviceDisplayList$;
    this.deviceDisplayList$.subscribe(deviceDisplayList => this.devicesSn = deviceDisplayList);
  }

  private getFirmwareInfo(device: any, version: string, matchFirmwares: Array<any>) {
    if (matchFirmwares.length === 0) {
      return null;
    }

    let targetVersionObj;
    matchFirmwares.forEach((firmware) => {
      if (!semver.valid(firmware.version)) return;
      const validVersion = targetVersionObj ? semver.valid(targetVersionObj.version) : null;
      if (!targetVersionObj || semver.lt(validVersion, firmware.version)) {
        targetVersionObj = firmware;
      }
    });

    const newVersion = targetVersionObj ? targetVersionObj.version : null;
    let smallerVer = null;
    if (semver.valid(version) && semver.valid(newVersion)) {
      smallerVer = semver.lt(version, newVersion);
    }

    if (version && newVersion && smallerVer) {
      return {
        newVersion,
        sha1: targetVersionObj && targetVersionObj.sha1,
        sn: device && device.device,
        url: targetVersionObj && targetVersionObj.url,
        version,
      };
    }
    return null;
  }

  private getShouldBeUpdatedDevices() {
    if (!this.devices || !this.devicesSn) {
      return Promise.resolve([]);
    }

    const devices = this.devicesSn.map(deviceSn => this.devices[deviceSn]);
    const modelList = devices.map(({ profile: { esh: { model } } }) => model && model.trim());

    return this.appTasks.getFirmwareList(modelList)
      .then((firmwares) => {
        return devices.map((device) => {
          const version = device.profile.module.firmwareVersion;
          const model = device.profile.esh.model;
          const matchFirmwares = firmwares.filter(({ model: firmwareModel }) => model && model.trim() === firmwareModel);

          return device.connected === 1 ? this.getFirmwareInfo(device, version, matchFirmwares) : null;
        });
      });
  }

  private updateIgnoreDeviceVersion(device: FirmwareUpdate) {
    const { sn, newVersion } = device;
    const newProperties = Object.assign({}, this.devices[sn].properties, {
      ignoreUpdateVersion: newVersion,
    });
    this.appTasks.wsRequestSetPropertiesTask(sn, newProperties);
  }

  private showRemindPopup() {
    this.alertCtrl.create({
      title: this.translate.instant('OTA_UPDATE_POPUP.REMIND_POPUP_TITLE'),
      buttons: [
        {
          handler: () => {
            this.shouldUpdatedDevices.forEach(device => this.updateIgnoreDeviceVersion(device));
          },
          text: this.translate.instant('OTA_UPDATE_POPUP.NO_THANKS'),
        },
        {
          handler: () => { this.showAgain = false; },
          role: 'cancel',
          text: this.translate.instant('OTA_UPDATE_POPUP.LATER'),
        },
      ]
    })
      .present();
  }

  private updateDevices(devices: Array<FirmwareUpdate>) {
    return devices.forEach((device) => {
      const { sha1, sn, url, version } = device;
      this.appTasks.wsRequestOtaTask(sn, url, sha1, version);

      this.updateIgnoreDeviceVersion(device);
    });
  }

  private validateShouldPopupShows(devices: Array<FirmwareUpdate>) {
    const shouldUpdatedDevices = devices
      .filter(device => device && this.devices[device.sn].properties.ignoreUpdateVersion !== device.newVersion);
    this.shouldUpdatedDevices = shouldUpdatedDevices;

    const showPopup = shouldUpdatedDevices.some(({ newVersion, sn }) => {
      const device = this.devices[sn];
      const isOwner = AppUtils.isOwner(device, this.account.account);
      const ignoreVersion = device.properties.ignoreUpdateVersion;

      if (!newVersion || !isOwner) {
        return false;
      }
      return semver.valid(ignoreVersion) ? semver.lt(ignoreVersion, newVersion) : true;
    });

    if (shouldUpdatedDevices.length > 0 && showPopup) {
      this.alertCtrl.create({
        title: this.translate.instant('OTA_UPDATE_POPUP.NEW_AVAILABLE_TITLE'),
        message: this.translate.instant('OTA_UPDATE_POPUP.NEW_AVAILABLE_MSG'),
        buttons: [
          {
            handler: () => this.showRemindPopup(),
            role: 'cancel',
            text: this.translate.instant('OTA_UPDATE_POPUP.CANCEL'),
          },
          {
            handler: () => this.updateDevices(shouldUpdatedDevices),
            text: this.translate.instant('OTA_UPDATE_POPUP.UPDATE_ALL'),
          },
        ]
      })
        .present();
    }
  }

  public showOTAPopup() {
    if (!this.showAgain) {
      return Promise.resolve();
    }

    return this.getShouldBeUpdatedDevices()
      .then((devices: Array<FirmwareUpdate>) => this.validateShouldPopupShows(devices));
  }
}

export interface FirmwareUpdate {
  newVersion: string;
  sha1: string;
  sn: string;
  url: string;
  version: string;
}
