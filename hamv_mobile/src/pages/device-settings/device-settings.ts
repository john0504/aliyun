import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  AppTasks,
  StateStore,
  Account,
} from 'app-engine';
import {
  AlertController,
  AlertOptions,
  IonicPage,
  NavParams,
  ViewController,
} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { first } from 'rxjs/operators';
// import * as semver from 'semver';

import { debounceImmediate } from '../../app/app.extends';
import { PopupService } from '../../providers/popup-service';
import { DeviceCore } from '../../item-models/device/device-core';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';

@IonicPage()
@Component({
  selector: 'page-device-settings',
  templateUrl: 'device-settings.html'
})
export class DeviceSettingsPage {

  private subs: Array<Subscription>;
  private account$: Observable<any>;
  private devices$: Observable<any>;

  deviceSn: string;
  account: Account;
  deviceCore: DeviceCore;
  deviceName: string;
  isOwner: boolean = false;
  isVersionLoading: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private appTasks: AppTasks,
    private dcInjector: DeviceCoreInjector,
    private popupService: PopupService,
    private stateStore: StateStore,
    private translate: TranslateService,
    public params: NavParams,
    public viewCtrl: ViewController,
  ) {
    this.deviceSn = this.params.get('deviceSn');
    this.subs = [];
    this.account$ = this.stateStore.account$;
    this.devices$ = this.stateStore.devices$;
    this.deviceCore = this.dcInjector.create();
  }

  ionViewDidLoad() {
    if (this.deviceSn) {
      // this.appTasks.wsRequestGetTask(this.deviceSn);
      this.account$.pipe(first()).subscribe(account => this.account = account);
    }
  }

  ionViewWillEnter() {
    this.subs.push(
      this.devices$
        .pipe(debounceImmediate(500))
        .subscribe(latestValues => {
          if (this.validateDevices(latestValues)) {
            this.processValues(latestValues);
          } else {
            this.viewCtrl.dismiss();
          }
        })
    );
  }

  private validateDevices(devices) {
    return this.deviceSn && devices && devices[this.deviceSn];
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  canSaveDeviceName(): boolean {
    return this.deviceName && this.deviceName.trim() && this.deviceCore.displayName !== this.deviceName.trim();
  }

  processValues(devices) {
    const device = devices[this.deviceSn];
    this.deviceCore = this.dcInjector.bind(this.deviceCore, device);
    this.deviceCore.selfUpdate();
    this.isOwner = this.deviceCore.isOwner(this.account.account);
    if (!this.deviceName) {
      this.deviceName = this.deviceCore.displayName;
    }
  }

  saveDevice() {
    if (!this.canSaveDeviceName()) return;
    const newProperties = Object.assign({}, this.deviceCore.properties, {
      displayName: this.deviceName,
    });
    const saving = this.appTasks.wsRequestSetPropertiesTask(this.deviceSn, newProperties);
    const loadingContent = {
      content: this.translate.instant('DEVICE_SETTINGS.UPDATING'),
    };
    this.popupService
      .loadingPopup(saving, loadingContent)
      .then(() => this.saveDeviceSuccess())
      .catch(() => this.saveDeviceFailure());
  }

  private saveDeviceSuccess() {
    const alertTitle = this.translate.instant('DEVICE_SETTINGS.HAS_UPDATED');
    this.showMessageAlert(alertTitle);
  }

  private saveDeviceFailure() {
    const alertTitle = this.translate.instant('DEVICE_SETTINGS.ISSUE_HAPPENED_WHEN_UPDATE');
    this.showMessageAlert(alertTitle);
  }

  private showErrorAlert() {
    const alertTitle = this.translate.instant('DEVICE_SETTINGS.ISSUE_HAPPENED_WHEN_CHECK_UPDATES');
    const alertMsg = this.translate.instant('DEVICE_SETTINGS.CHECK_NETWORK_AGAIN');
    this.showMessageAlert(alertTitle, alertMsg);
  }

  private showMessageAlert(alertTitle, alertMsg?) {
    const alertOK = this.translate.instant('DEVICE_SETTINGS.OK');
    const alert = this.alertCtrl.create({
      title: alertTitle,
      message: alertMsg,
      buttons: [alertOK],
    });
    alert.present();
  }

  checkForUpdates() {
    const fwVersion = this.deviceCore.firmwareVersion;
    const deviceModel = this.deviceCore.model;
    if (!fwVersion || !deviceModel) {
      this.showErrorAlert();
      return;
    }
    // let versionNew;
    // let targetVersionObj = null;
    this.isVersionLoading = true;
    // this.appTasks.getFirmwareList(deviceModel)
    //   .then((items: any) => {
    //     this.isVersionLoading = false;
    //     items.forEach(element => {
    //       if (targetVersionObj === null || semver.lt(targetVersionObj.version, element.version)) {
    //         targetVersionObj = element;
    //       }
    //     });

    //     if (targetVersionObj != null) {
    //       versionNew = targetVersionObj.version;
    //     }

    //     if (!fwVersion) {
    //       this.showErrorAlert();
    //       return;
    //     }

    //     if (!versionNew) {
    //       this.showUpToDateAlert(fwVersion);
    //       return;
    //     }

    //     if (fwVersion && versionNew && semver.lt(fwVersion, versionNew)) {
    //       // need to update
    //       const url = targetVersionObj && targetVersionObj.url;
    //       const sha1 = targetVersionObj && targetVersionObj.sha1;
    //       this.otaService(this.deviceSn, url, sha1, fwVersion, versionNew);
    //     } else {
    //       // no need to update
    //       this.showUpToDateAlert(fwVersion);
    //     }
    //   })
    //   .catch(() => {
    //     this.isVersionLoading = false;
    //     this.showErrorAlert();
    //   });
  }

  // private showUpToDateAlert(version: string) {
  //   const alertTitle = this.translate.instant('DEVICE_SETTINGS.UP_TO_DATE_TITLE');
  //   const alertMsg = this.translate.instant('DEVICE_SETTINGS.UP_TO_DATE_MSG', { version });
  //   this.showMessageAlert(alertTitle, alertMsg);
  // }

  // private updatePopup(sn: string, url: string, sha1: string, version: string) {
  //   const loadingContent = this.translate.instant('DEVICE_SETTINGS.LOADING');
  //   const otaPromise = this.popupService.loadingPopup(
  //     this.appTasks.wsRequestOtaTask(sn, url, sha1, version),
  //     { content: loadingContent },
  //   );

  //   otaPromise
  //     .then(() => this.showOtaStringAlert())
  //     .catch(() => this.showErrorAlert());
  // }

  // private showOtaStringAlert() {
  //   const alertTitle = this.translate.instant('DEVICE_SETTINGS.UPDATE_STARTED');
  //   const alertMsg = this.translate.instant('DEVICE_SETTINGS.UPDATE_STARTED_MSG');
  //   this.showMessageAlert(alertTitle, alertMsg);
  // }

  // private otaService(sn: string, url: string, sha1: string, version: string, versionNew: string) {
  //   const alertTitle = this.translate.instant('DEVICE_SETTINGS.NEW_VERSION_TITLE', { versionNew });
  //   const alertMsg = this.translate.instant('DEVICE_SETTINGS.UPDATE_FOUND_MSG');
  //   const alertCancel = this.translate.instant('DEVICE_SETTINGS.CANCEL');
  //   const alertUpdate = this.translate.instant('DEVICE_SETTINGS.UPDATE_NOW');
  //   const alert = this.alertCtrl.create({
  //     title: alertTitle,
  //     message: alertMsg,
  //     buttons: [
  //       {
  //         text: alertCancel,
  //         role: 'cancel',
  //       },
  //       {
  //         text: alertUpdate,
  //         handler: () => this.updatePopup(sn, url, sha1, version),
  //       }
  //     ]
  //   });
  //   alert.present();
  // }

  deleteDeviceConfirm() {
    const alertTitle = this.translate.instant('DEVICE_SETTINGS.DELETE_ALERT_TITLE', { deviceName: this.deviceName });
    const alertCancel = this.translate.instant('DEVICE_SETTINGS.CANCEL');
    const alertDelete = this.translate.instant('DEVICE_SETTINGS.DELETE');

    let options: AlertOptions = {
      title: alertTitle,
      buttons: [
        {
          text: alertCancel,
          role: 'cancel',
        },
        {
          text: alertDelete,
          handler: () => {
            this.appTasks.wsRequestDeleteDeviceTask(this.deviceSn);
          },
        }
      ],
    };
    if (!this.isOwner) {
      const guestMsg = this.translate.instant('DEVICE_SETTINGS.GUEST_DELETE_MSG');
      options.message = guestMsg;
    }
    const alert = this.alertCtrl.create(options);
    alert.present();
  }
}
