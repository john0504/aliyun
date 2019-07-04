import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { BLE } from '@ionic-native/ble';
import { ThemeService } from '../../providers/theme-service';
import { PopupService } from '../../providers/popup-service';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { CheckNetworkService } from '../../providers/check-network';
import { appConfig } from '../../app/app.config';

@IonicPage()
@Component({
  selector: 'page-bluetooth-list',
  templateUrl: 'bluetooth-list.html'
})
export class BluetoothListPage {

  private subs: Array<Subscription>;
  private bluetoothList;
  canContinue: boolean;
  private connectDevices = [];
  private isClosePage = false;
  private scanTime = 0;
  appConfig;
  isShowLog = 0;
  logs = [];

  constructor(
    public viewCtrl: ViewController,
    private ble: BLE,
    public themeService: ThemeService,
    private popupService: PopupService,
    private translate: TranslateService,
    public navController: NavController,
    private storage: Storage,
    public checkNetworkService: CheckNetworkService,
  ) {
    this.subs = [];
    this.bluetoothList = [];
    this.canContinue = false;
    this.appConfig = appConfig;
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
  }

  ionViewWillEnter() {
    this.connectDevices = [];
    this.ble.isEnabled();
    this.ble.enable();
    this.loadStorage();
  }

  ionViewDidLeave() {
    this.ble.stopScan();
    if (!this.isClosePage) {
      this.bluetoothList.forEach(device => {
        this.ble.isConnected(device.id).then(() =>
          this.ble.disconnect(device.id));
      });
    }
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  ionViewWillUnload() {
    this.checkNetworkService.resume();
  }

  private loadStorage() {
    this.storage.get('isShowLog').then((isShowLog) => {
      if (isShowLog) {
        this.isShowLog = isShowLog;
      } else {
        this.isShowLog = 0;
      }
    });
    this.storage.get('scanTime').then((scanTime) => {
      if (scanTime) {
        this.scanTime = scanTime;
      } else {
        this.scanTime = 0;
      }
      this.startScanning();
    });
  }

  private printLog(deviceName, title, msg) {
    const currentDate: Date = new Date();
    console.log(deviceName + ' ' + title, msg);
    this.logs.reverse();
    this.logs.push('[' + currentDate + ']' + deviceName + ' ' + title + "=>" + msg);
    this.logs.reverse();
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  private checkDeviceName(deviceName: string, deviceId: string): boolean {
    this.bluetoothList.forEach(item => {
      if (item.name == deviceName && item.id == deviceId) {
        return false;
      }
    });
    return deviceName && /*deviceId && deviceId.indexOf("00") != -1 &&*/
      (deviceName.indexOf("AirBox") != -1 ||
        deviceName.indexOf("TlgBox") != -1 ||
        deviceName.indexOf("AirSense") != -1 ||
        deviceName.indexOf("Tenx") != -1 ||
        deviceName.indexOf("Datatran_LE") != -1 ||
        deviceName.indexOf("ALASKA") != -1 ||
        deviceName.indexOf("Nairn") != -1);
  }

  private startScanning() {
    let loading;
    if (this.scanTime != 0) {
      loading = this.popupService.makeLoading({ content: this.translate.instant('BLUETOOTH.SCANING') });
    }
    //this.subs.push(
    this.ble.startScan([]).subscribe(device => {
      if (this.checkDeviceName(device.name, device.id)) {
        this.bluetoothList.push(device);
        this.printLog(device.name, "id", device.id);
        if (this.scanTime == 0) {
          this.popupService.makeToast({
            message: this.translate.instant('BLUETOOTH.SCANING'),
            duration: 1
          });
        }
      }
    });
    if (this.scanTime != 0) {
      setTimeout(() => {
        loading.dismiss();
        this.ble.stopScan();
      }, this.scanTime);
    }
  }

  addDeviceToList(device) {
    this.connectDevices.push({
      name: device.name,
      device: device.id,
      service: "",
      characteristic: ""
    });
  }

  connectToDevice(device) {
    if (device.checked) {
      this.addDeviceToList(device);
      this.canContinue = true;
    } else {
      this.removeDevice(device.id);
    }
  }

  removeDevice(deviceId) {
    let new_connect_devices = [];
    this.connectDevices.forEach(device => {
      if (device.device != deviceId) {
        new_connect_devices.push(device);
      } else {
        this.ble.disconnect(device.device);
      }
    });
    this.connectDevices = new_connect_devices;
    if (this.connectDevices.length == 0) {
      this.canContinue = false;
    }
  }

  gotoDevicePage() {
    this.storage.set('connectDevices', this.connectDevices);
    this.closePage();
  }

  closePage() {
    if (!this.isClosePage) {
      this.navController.setRoot('BluetoothDevicePage').then(() => {
        this.viewCtrl.dismiss();
      });
      this.isClosePage = true;
    }
  }
}