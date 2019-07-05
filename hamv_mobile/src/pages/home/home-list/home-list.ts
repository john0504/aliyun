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
    this.sendData(deviceItem);
  }

  clearMoney(deviceItem) {
    deviceItem.money = 0;
    this.sendData(deviceItem);
  }

  clearGift(deviceItem) {
    deviceItem.gift = 0;
    this.sendData(deviceItem);
  }

  sendData(deviceItem) {
    // this.appTasks.updatedeviceTask(serial, data);
    var message = {
      account: this.accountName,
      serial: deviceItem.serial,
      data: {
        bank: deviceItem.bank,
        money: deviceItem.money,
        gift: deviceItem.gift
      }
    };
    var topic = "CECT/updatedevice";
    this.client.publish(topic, JSON.stringify(message), { qos: 1, retain: true });
  }

  goPayment(deviceItem) {
    this.navCtrl2.push('DevicePaymentPage', { serial: deviceItem.serial });
  }

  refresh() {

    // this.appTasks.alldeviceTask().then((list) => {
    //   console.log(JSON.stringify(list));
    //   if (list) {
    //     this._deviceList = list;
    //   }
    // });
    var message = {
      account: this.accountName
    };
    var topic = "CECT/alldevice";
    this.client.publish(topic, JSON.stringify(message), { qos: 1, retain: true });
  }
}
