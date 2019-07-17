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
  ) {
    super(navCtrl, platform, stateStore, translate, storage, themeService, appEngine);

    this.deviceComponent = LargeListItemComponent;
    this.groupComponent = ListGroupItemComponent;
  }

  deleteDeviceConfirm(deviceItem) {
    const alertTitle = this.translate2.instant('DEVICE_SETTINGS.DELETE_ALERT_TITLE', { deviceName: deviceItem.name });
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
            this.appTasks.deletedeviceTask(deviceItem.serial);
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

  clearBank(deviceItem) {
    deviceItem.bank = 0;
    var message = {
      H62: 0
    };
    this.sendData(deviceItem, message);
  }

  clearMoney(deviceItem) {
    deviceItem.money = 0;
    var message = {
      H60: 0
    };
    this.sendData(deviceItem, message);
  }

  clearGift(deviceItem) {
    deviceItem.gift = 0;
    var message = {
      H61: 0
    };
    this.sendData(deviceItem, message);
  }

  sendData(deviceItem, message) {
    var topic = `CECT/WAWA/${deviceItem.DevNo}/D`;
    this.client.publish(topic, JSON.stringify(message), { qos: 1, retain: true });
  }

  goPayment(deviceItem) {
    this.navCtrl2.push('DevicePaymentPage', { serial: deviceItem.DevNo });
  }

  refresh() {
    var topic = `CECT/WAWA/${this.accountToken}/G`;
    this.client.publish(topic, "{}", { qos: 1, retain: true });
  }
}
