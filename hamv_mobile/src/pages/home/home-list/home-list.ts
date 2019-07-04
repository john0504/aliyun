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
} from 'app-engine';

import { ThemeService } from '../../../providers/theme-service';
import { HomePageBase } from '../home-page-base';
import { ListGroupItemComponent } from "../../../components/list-group-item/list-group-item";
import { LargeListItemComponent } from '../../../components/large-list-item/large-list-item';

import {
  connect,
  IClientOptions
} from 'mqtt';

@IonicPage()
@Component({
  selector: 'page-home-list',
  templateUrl: 'home-list.html'
})
export class HomeListPage extends HomePageBase {
  message;
  _deviceList = [{
    name: "test1",
    serial: "CLAW_0111",
    type: "AAA",
    bank: 1,
    money: 2,
    gift: 3,
    status: 1,
    expiredate: this.getDate(1593077109000),
    showDetails: false
  }, {
    name: "test2",
    serial: "CLAW_0222",
    type: "AAA",
    bank: 4,
    money: 5,
    gift: 6,
    status: 0,
    expiredate: this.getDate(1594077109000),
    showDetails: false
  }];

  constructor(
    navCtrl: NavController,
    public navCtrl2: NavController,
    platform: Platform,
    stateStore: StateStore,
    translate: TranslateService,
    public translate2: TranslateService,
    public appTasks: AppTasks,
    storage: Storage,
    themeService: ThemeService,
    public alertCtrl: AlertController,
  ) {
    super(navCtrl, platform, stateStore, translate, storage, themeService);

    this.deviceComponent = LargeListItemComponent;
    this.groupComponent = ListGroupItemComponent;
  }

  getDate(timestamp) {
    var date = new Date(timestamp / 1);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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
    var serial = deviceItem.serial;
    var data = {
      bank: deviceItem.bank,
      money: deviceItem.money,
      gift: deviceItem.gift
    };
    this.appTasks.updatedeviceTask(serial, data);
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
      totalmoney: 23,
      totalgift: 9,
      money: 23,
      gift: 9,
      name: "機台2",
      serial: "Capsule_998",
      typename: "EFAN_Capsule_001",
      lat: 25.0871996,
      lng: 121.5253001,
      cardreader: "0123456789ab"
    };
    var opts: IClientOptions = {
      port: 1883,
      host: 'cectco.homeip.net',
      protocol: 'mqtt'
    };
    const client = connect('', opts);
    client.on('connect', () => {
      client.subscribe('presence', (err) => {
        if (!err) {
          client.publish("TENX/EFAN_Capsule_001/Capsule_998/status_up", JSON.stringify(message), { qos: 1, retain: true });
        } else {
          console.log(err);
        }
      });
    });
  }
}
