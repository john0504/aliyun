import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-bluetooth-setting',
  templateUrl: 'bluetooth-setting.html',
})
export class BluetoothSettingPage {

  private scanTime;
  private retryTime;
  private isShowLog;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
  ) {
  }

  ionViewWillEnter() {
    this.storage.get('scanTime').then((scanTime) => {
      if (scanTime) {
        this.scanTime = scanTime;
      } else {
        this.scanTime = 0;
      }
    });
    this.storage.get('retryTime').then((retryTime) => {
      if (retryTime) {
        this.retryTime = retryTime;
      } else {
        this.retryTime = 10000;
      }
    });
    this.storage.get('isShowLog').then((isShowLog) => {
      if (isShowLog) {
        this.isShowLog = isShowLog;
      } else {
        this.isShowLog = 0;
      }
    });
  }

  ionViewWillLeave() {
    this.storage.set('scanTime', this.scanTime);
    this.storage.set('retryTime', this.retryTime);
    this.storage.set('isShowLog', this.isShowLog);
  }
}
