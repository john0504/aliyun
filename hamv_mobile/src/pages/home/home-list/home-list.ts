import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  Platform,
  AlertOptions,
  AlertController,
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import {
  StateStore,
  AppTasks,
  AppEngine
} from 'app-engine';

import { ThemeService } from '../../../providers/theme-service';
import { HomePageBase } from '../home-page-base';
import { ListGroupItemComponent } from "../../../components/list-group-item/list-group-item";
import { LargeListItemComponent } from '../../../components/large-list-item/large-list-item';
import { HttpClient } from '@angular/common/http';
import { PopupService } from '../../../providers/popup-service';

@IonicPage()
@Component({
  selector: 'page-home-list',
  templateUrl: 'home-list.html'
})
export class HomeListPage extends HomePageBase {

  constructor(
    navCtrl: NavController,
    public navCtrl2: NavController,
    platform: Platform,
    stateStore: StateStore,
    translate: TranslateService,
    public translate2: TranslateService,
    appEngine: AppEngine,
    public appTasks: AppTasks,
    storage: Storage,
    themeService: ThemeService,
    public alertCtrl: AlertController,
    public stateStore2: StateStore,
    http: HttpClient,
    popupService: PopupService,
  ) {
    super(navCtrl, platform, stateStore, translate, storage, themeService, appEngine, http, appTasks, alertCtrl, popupService);

    this.deviceComponent = LargeListItemComponent;
    this.groupComponent = ListGroupItemComponent;
  }

  deleteDeviceConfirm(deviceItem) {
    const alertTitle = this.translate2.instant('DEVICE_SETTINGS.DELETE_ALERT_TITLE', { deviceName: deviceItem.DevName });
    const alertCancel = this.translate2.instant('DEVICE_SETTINGS.CANCEL');
    const alertDelete = this.translate2.instant('DEVICE_SETTINGS.DELETE');

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
            var topic = `WAWA/${this.accountToken}/U`;
            var paylod = JSON.stringify({ action: "delete", DevNo: deviceItem.DevNo });
            this.client.publish(topic, paylod, { qos: 1, retain: false });
          },
        }
      ],
    };

    const alert = this.alertCtrl.create(options);
    alert.present();
  }

  toggleDetails(deviceItem) {
    if (deviceItem.showDetails) {
      deviceItem.showDetails = false;
    } else {
      deviceItem.showDetails = true;
    }
  }

  clearConfirm(name, deviceItem, callback) {
    const alertTitle = this.translate2.instant(name);
    const alertSubTitle = this.translate2.instant('確定要清除嗎?');
    const alertCancel = this.translate2.instant('DEVICE_SETTINGS.CANCEL');
    const alertDelete = this.translate2.instant('DEVICE_SETTINGS.OK');

    let options: AlertOptions = {
      title: alertTitle,
      subTitle: alertSubTitle,
      buttons: [
        {
          text: alertCancel,
          role: 'cancel',
        },
        {
          text: alertDelete,
          handler: () => {
            callback(deviceItem);
          },
        }
      ],
    };

    const alert = this.alertCtrl.create(options);
    alert.present();
  }

  clearBank(deviceItem) {
    this.clearConfirm("中獎率銀行", deviceItem, () => {
      deviceItem.H61 = 0;
      var message = {
        H61: 0
      };
      this.sendData(deviceItem, message);
    });
  }

  clearMoney(deviceItem) {
    this.clearConfirm("投幣遊戲次數", deviceItem, () => {
      deviceItem.H60 = 0;
      var message = {
        H60: 0
      };
      this.sendData(deviceItem, message);
    });
  }

  clearGift(deviceItem) {
    this.clearConfirm("禮品出獎次數", deviceItem, () => {
      deviceItem.H62 = 0;
      var message = {
        H62: 0
      };
      this.sendData(deviceItem, message);
    });
  }

  

  getGiftTimeList(deviceItem) {
    var topic = `WAWA/${this.accountToken}/U`;
    var paylod = JSON.stringify({ action: "gifttime", DevNo: deviceItem.DevNo });
    this.client.publish(topic, paylod, { qos: 1, retain: false });
  }

  sendData(deviceItem, message) {
    var topic = `WAWA/${deviceItem.DevNo}/D`;
    this.client.publish(topic, JSON.stringify(message), { qos: 1, retain: false });
  }

  goPayment(deviceItem) {
    this.navCtrl2.push('DevicePaymentPage', { serial: deviceItem.DevNo });
  }

  getExpire(date) {
    return date - Date.now() / 1000;
  }
}
