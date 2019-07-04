import { Component, ChangeDetectorRef } from '@angular/core';

import { IonicPage, NavController, Platform, ViewController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { BLE } from '@ionic-native/ble';
import { Subscription } from 'rxjs/Subscription';
import { delay } from 'rxjs/operators';

import { ThemeService } from '../../providers/theme-service';
import { isEqual } from 'lodash';
import { TranslateService } from '@ngx-translate/core';

import { InformationModelService } from '../../modules/information-model';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { ViewStateService } from '../../providers/view-state-service';
import { PopupService } from '../../providers/popup-service';
import { CheckNetworkService } from '../../providers/check-network';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-ble-led-device',
  templateUrl: 'ble-led-device.html'
})
export class BleLedDevicePage {

  private subs: Array<Subscription>;
  isShowLog = 0;
  _deviceList = [];
  logs = [];
  bleList = [];

  constructor(

    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
    private ims: InformationModelService,
    public deviceConfigService: DeviceConfigService,
    public deviceCtrlService: DeviceControlService,
    public viewStateService: ViewStateService,
    private translate: TranslateService,
    private popupService: PopupService,
    private bleService: BLE,
    private storage: Storage,
    public checkNetworkService: CheckNetworkService,
    public cd: ChangeDetectorRef,
    private platform: Platform,
    private insomnia: Insomnia,
  ) {
    this.subs = [];
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
    this.platform.ready()
      .then(() => {
        return this.insomnia.keepAwake();
      });
  }

  ionViewDidEnter() {
    this.loadStorage();
  }

  ionViewWillLeave() {
    this._deviceList.forEach(deviceItem => {
      this.bleService.isConnected(deviceItem.deviceId).then(() =>
        this.bleService.disconnect(deviceItem.deviceId));
    });
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
    this.popupService.makeToast({
      message: this.translate.instant('BLUETOOTH.BLUETOOTH_LEAVE'),
      duration: 3000
    });
    this.bleService.stopScan();
  }

  ionViewWillUnload() {
    this.checkNetworkService.resume();
    this.insomnia.allowSleepAgain();
  }

  private loadStorage() {
    this.storage.get('isShowLog').then((isShowLog) => {
      if (isShowLog) {
        this.isShowLog = isShowLog;
      } else {
        this.isShowLog = 0;
      }
    });
    this.storage.get('connectDevices').then((connectDevices) => {
      if (connectDevices) {
        this.bleList = connectDevices;
        this.bleList.forEach(device => {
          this.linkDevice(device);
        });
        this.scanDevice();
      } else {
        this.navCtrl.setRoot('BleLedListPage').then(() => {
          this.viewCtrl.dismiss();
        });
      }
    });
  }

  private scanDevice() {
    this.printLog("", "Start scan", "");
    this.subs.push(
      this.bleService.startScan([]).subscribe(device => {
        this._deviceList.forEach(listItem => {
          if (device.id == listItem.deviceId) {
            this.connectDevice(listItem);
            delay(500);
          }
        });
      })
    );
    setTimeout(() => {
      this.bleService.stopScan();
    }, 5000);
  }

  private connectDevice(deviceItem) {
    this.printLog(deviceItem.deviceName, "Connect", JSON.stringify(deviceItem.deviceId));
    this.subs.push(this.bleService.connect(deviceItem.deviceId).subscribe(peripheralData => {
      peripheralData.characteristics.forEach(
        service => {
          let count = 0;
          service.properties.forEach(property => {
            this.printLog(deviceItem.deviceName, "property", JSON.stringify(service));
            switch (property) {
              case "WriteWithoutResponse":
              case "Write":
                count++;
                if (count >= 2) {
                  this.printLog(deviceItem.deviceName, "property", JSON.stringify(service));
                  deviceItem.txServiceId = service.service;
                  deviceItem.txCharacteristicId = service.characteristic;
                }
                break;
              case "Notify": this.printLog(deviceItem.deviceName, "property", JSON.stringify(service));
                deviceItem.rxServiceId = service.service;
                deviceItem.rxCharacteristicId = service.characteristic;
                break;
            }
          });
        },
        () => {
          this.printLog(deviceItem.deviceName, "disconnect", JSON.stringify(deviceItem.deviceId));
          this.bleService.disconnect(deviceItem.deviceId);
        });
    }));
  }

  private callBluetoothTask(deviceItem, command): Promise<any> {
    this.printLog(deviceItem.deviceName, "send", JSON.stringify(command));
    return this.writeService(deviceItem, command);
  }

  private sendBluetoothCommands(deviceItem, command): Promise<any> {
    return this.callBluetoothTask(deviceItem, command);
  }

  sendCommands(deviceItem, commands) {
    let cmd = {};
    cmd[commands.key] = commands.value;
    this.sendBluetoothCommands(deviceItem, commands.value);
    deviceItem.viewState = Object.assign({}, deviceItem.viewState, cmd);
    this.viewStateService.setViewState(deviceItem._deviceSn, deviceItem.viewState);
  }

  private updateViewState(deviceItem): any {
    let viewState: any = this.viewStateService.getViewState(deviceItem._deviceSn) || {};
    if (deviceItem && deviceItem._device && deviceItem._device.status) {
      for (let key in deviceItem._device.status) {
        if (this.deviceCtrlService.isAvailable(deviceItem._device.device, key)) {
          viewState[key] = deviceItem._device.status[key];
        }
      }
    }

    viewState = Object.assign({}, deviceItem.viewState, viewState);
    this.viewStateService.setViewState(deviceItem._deviceSn, viewState);

    return viewState;
  }

  private updateLayout(deviceItem) {
    if (deviceItem._device) {
      let uiModel = this.ims.getUIModel(deviceItem._device);
      if (uiModel && !isEqual(deviceItem.uiModel, uiModel)) {
        deviceItem.uiModel = uiModel;

        let controlLayout = deviceItem.uiModel.controlLayout;
        if (controlLayout && controlLayout.primary) {
          let popitPopular: Array<any> = [];
          controlLayout.primary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitPopular.push(m);
            }
          });
          deviceItem.popitPopular = popitPopular;
        }

        if (controlLayout && controlLayout.secondary) {
          let popitExpanded: Array<any> = [];
          controlLayout.secondary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitExpanded.push(m);
            }
          });
          deviceItem.popitExpanded = popitExpanded;
        }

        this.requestConfig(deviceItem._deviceSn, uiModel.config);
      }
    }
  }

  private requestConfig(sn: string, config: Array<string>) {
    if (!sn || !config) return;
    this.deviceConfigService.requestConfig(sn, config);
  }

  toggleDetails(deviceItem) {
    if (deviceItem.showDetails) {
      deviceItem.showDetails = false;
    } else {
      deviceItem.showDetails = true;
    }
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

  private writeService(deviceItem, value): Promise<any> {
    var arrayBuffer = new ArrayBuffer(1);
    var dataView = new DataView(arrayBuffer);
    dataView.setUint8(0, value);
    return this.bleService.write(
      deviceItem.deviceId,
      deviceItem.txServiceId,
      deviceItem.txCharacteristicId,
      arrayBuffer)
      .then((data) => {
        this.printLog(deviceItem.deviceName, "response", JSON.stringify(data));
        this.cd.detectChanges();
      }, (error) => {
        this.printLog(deviceItem.deviceName, "writeError", JSON.stringify(error));
      });
  }

  private makeDeviceItem(device): any {
    let deviceItem = {
      deviceName: device.name,
      deviceId: device.device,
      rxServiceId: device.service,
      rxCharacteristicId: device.characteristic,
      txServiceId: device.service,
      txCharacteristicId: device.characteristic,
      _device: {
        device: device.device + device.service + device.characteristic,
        profile: {
          esh: {
            class: 0, esh_version: "4.0.0", device_id: "1",
            brand: "HITACHI", model: "bleled"
          },
          module: {
            firmware_version: "0.6.3", mac_address: "AC83F3A04298",
            local_ip: "10.1.7.110", ssid: "tenx-hc2_2.4G"
          }, cert: {
            fingerprint: { sha1: "01234567890123456789" },
            validity: { not_before: "01/01/15", not_after: "12/31/25" }
          }
        },
        properties: { displayName: device.name },
        fields: ["H00", "H01", "H02", "H03"],
        status: { "H00": 0, "H01": 1, "H02": 1, "H03": 65 }
      },
      _deviceSn: "",
      viewState: { isConnected: true },
      showDetails: false,
      popitPopular: [],
      popitExpanded: []
    };
    return deviceItem;
  }

  linkDevice(device) {
    let deviceItem = this.makeDeviceItem(device);
    this.updateLayout(deviceItem);
    deviceItem.viewState = this.updateViewState(deviceItem);
    this._deviceList.push(deviceItem);
    this.printLog(deviceItem.deviceName, "", deviceItem.deviceId);
    deviceItem.connectCount = 0;
  }
}