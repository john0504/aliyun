import { Component } from '@angular/core';
import {
  IonicPage,
  ViewController,
} from 'ionic-angular';
import { Storage } from '@ionic/storage';

const SSID_LIST = '_ssid_list';

@IonicPage()
@Component({
  selector: 'page-wifi-ap-manage',
  templateUrl: 'wifi-ap-manage.html',
})
export class WifiApManagePage {

  ssidList: Array<{ ssid: string, password?: string, sec?: string }>;

  constructor(
    private storage: Storage,
    private viewCtrl: ViewController
  ) {
    this.ssidList = [];
    this.storage.get(SSID_LIST).then(list => this.ssidList = list || this.ssidList);
  }

  removeSsid(wifiAp) {
    const index = this.ssidList.findIndex(wifiSetting => wifiAp.ssid === wifiSetting.ssid);
    if (index !== -1) {
      this.ssidList.splice(index, 1);
    }
    this.storage.set(SSID_LIST, this.ssidList);
  }

  closePage() {
    this.viewCtrl.dismiss();
  }
}
