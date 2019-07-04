import { Component, ChangeDetectorRef } from '@angular/core';

import { IonicPage, NavController, Platform, ViewController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { BLE } from '@ionic-native/ble';
import { Subscription } from 'rxjs/Subscription';
import { defer } from 'rxjs/observable/defer';
import { delay, repeatWhen } from 'rxjs/operators';

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
  selector: 'page-bluetooth-device',
  templateUrl: 'bluetooth-device.html'
})
export class BluetoothDevicePage {

  private subs: Array<Subscription>;
  private retryTime = 5000;
  isShowLog = 0;
  private lostNotifyCount = 0;
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
    this.storage.get('retryTime').then((retryTime) => {
      if (retryTime) {
        this.retryTime = retryTime;
      } else {
        this.retryTime = 5000;
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
        this.navCtrl.setRoot('BluetoothListPage').then(() => {
          this.viewCtrl.dismiss();
        });
      }
    });
  }

  refreshData() {
    this._deviceList.forEach((deviceItem) => {
      this.subs.push(
        defer(() => this.pollingService(deviceItem))
          .subscribe()
      );
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
              case "Notify":
                count++;
                if (count >= 3) {
                  this.printLog(deviceItem.deviceName, "property", JSON.stringify(service));
                  deviceItem.serviceId = service.service;
                  deviceItem.characteristicId = service.characteristic;
                  this.startNotification(deviceItem);
                }
                break;
            }
          });
        },
        error => {
          this.printLog(deviceItem.deviceName, "disconnect", JSON.stringify(deviceItem.deviceId));
          this.bleService.disconnect(deviceItem.deviceId);
        });
    }));
  }

  private callBluetoothTask(deviceItem, command): Promise<any> {
    this.printLog(deviceItem.deviceName, "send", JSON.stringify(command));
    return this.writeService(deviceItem, JSON.stringify(command));
  }

  private sendBluetoothCommands(deviceItem, request, command): Promise<any> {
    let cmd = {};
    cmd[request] = command;
    return this.callBluetoothTask(deviceItem, cmd);
  }

  sendCommands(deviceItem, commands) {
    let cmd = {};
    cmd[commands.key] = commands.value;
    this.sendBluetoothCommands(deviceItem, "data", cmd);
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

  private writeService(deviceItem, string): Promise<any> {
    return this.bleService.write(
      deviceItem.deviceId,
      deviceItem.serviceId,
      deviceItem.characteristicId,
      this.stringToBytes(string))
      .then((data) => {
        this.printLog(deviceItem.deviceName, "response", JSON.stringify(data));
        if (deviceItem.model != "TlgBox") {
          deviceItem.connectCount = 0;
        }
        this.cd.detectChanges();
      }, (error) => {
        this.printLog(deviceItem.deviceName, "writeError", JSON.stringify(error));
      });
  }

  private stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  private bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  private makeDeviceItem(device): any {
    let deviceItem = {
      deviceName: device.name,
      deviceId: device.device,
      serviceId: device.service,
      characteristicId: device.characteristic,
      _device: {
        device: device.device + device.service + device.characteristic,
        profile: {
          esh: {
            class: 0, esh_version: "4.0.0", device_id: "1",
            brand: "HITACHI", model: ""
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
        fields: [],
        status: {}
      },
      _deviceSn: "",
      viewState: { isConnected: false },
      showDetails: false,
      popitPopular: [],
      popitExpanded: []
    };
    return deviceItem;
  }

  startNotification(deviceItem) {
    let count = 0;
    let message = "";
    let sub = defer(() => this.sendBluetoothCommands(deviceItem, "request", "info"))
      .pipe(repeatWhen(attampes => attampes.pipe(delay(3000))))
      .subscribe();
    // this.subs.push(
    //   defer(() => this.sendBluetoothCommands(deviceItem, "request", "info"))
    //     .pipe(repeatWhen(attampes => attampes.pipe(delay(this.retryTime))))
    //     .subscribe());
    this.subs.push(
      this.bleService.startNotification(
        deviceItem.deviceId,
        deviceItem.serviceId,
        deviceItem.characteristicId
      ).subscribe((buffer) => {
        this.printLog(deviceItem.deviceName, "buffer", this.bytesToString(buffer));
        message += this.bytesToString(buffer);
        let endzero = false;
        let array = new Uint8Array(buffer);
        array.forEach(byte => {
          if (byte === 0x7B) {
            count++;
          } else if (byte === 0x7D) {
            count--;
          }
          if (byte === 0x00) {
            endzero = true;
          }
        });
        if (count === 0) {
          this.lostNotifyCount = 0;
          if (endzero) {
            message = message.substring(0, message.length - 1);
          }

          let jsonObj;
          try {
            jsonObj = JSON.parse(message);
            if (jsonObj.online == 1) {
              this.printLog(deviceItem.deviceName, "message", message);
              deviceItem.connectCount = 0;
            }
            switch (jsonObj.response) {
              case "info":
                sub.unsubscribe();
                if (deviceItem._device.profile.esh.model == "") {
                  this.printLog(deviceItem.deviceName, "info", message);
                  deviceItem._device.profile.esh.model = jsonObj ? jsonObj.data.profile.esh.model : "";
                  deviceItem._device.fields = jsonObj ? jsonObj.data.fields : [];
                  deviceItem._deviceSn = deviceItem._device.device;
                  this.updateLayout(deviceItem);
                  deviceItem.viewState = this.updateViewState(deviceItem);
                  this.cd.detectChanges();
                }
                break;
            }
            switch (jsonObj.request) {
              case "status_change":
                this.printLog(deviceItem.deviceName, "status_change", message);
                deviceItem._device.status = jsonObj.data;
                this.updateLayout(deviceItem);
                deviceItem.viewState = this.updateViewState(deviceItem);
                this.sendBluetoothCommands(deviceItem, "response", "ok");
                deviceItem.viewState.isConnected = true;
                this.cd.detectChanges();
                break;
            }
          } catch (e) {
            this.printLog(deviceItem.deviceName, "error", message);
            if (deviceItem._device.profile.esh.model == "") {
              this.sendBluetoothCommands(deviceItem, "request", "info");
            }
          }
          message = "";
          count = 0;
        } else if (count < 0) {
          count = 0;
          message = "";
        } else {
          this.lostNotifyCount++;
          if (this.lostNotifyCount >= 10) {
            this.lostNotifyCount = 0;
            count = 0;
            message = "";
          }
        }
      }, (error) => {
        this.printLog(deviceItem.deviceName, "readError", JSON.stringify(error));
      })
    );
  }

  private pollingService(deviceItem): Promise<any> {
    if (deviceItem.connectCount > 3 || !deviceItem.viewState.isConnected) {
      deviceItem.connectCount = 0;
      this.scanDevice();
      this.printLog(deviceItem.deviceName, "Start disconnect", deviceItem.deviceId);
      return this.bleService.disconnect(deviceItem.deviceId).then(() => {
        deviceItem.viewState.isConnected = false;
        this.printLog(deviceItem.deviceName, "Disconnect done", deviceItem.deviceId);
      });
    } else {
      deviceItem.connectCount++;
    }

    return this.bleService.isConnected(deviceItem.deviceId).then(
      () => {
        deviceItem.viewState.isConnected = true;
        this.sendBluetoothCommands(deviceItem, "online", deviceItem.connectCount);
      },
      () => {
        this.printLog(deviceItem.deviceName,
          "is not connected (" + deviceItem.connectCount + ")",
          deviceItem.deviceId);
      });
  }

  linkDevice(device) {
    let deviceItem = this.makeDeviceItem(device);
    this.updateLayout(deviceItem);
    deviceItem.viewState = this.updateViewState(deviceItem);
    this._deviceList.push(deviceItem);
    this.printLog(deviceItem.deviceName, "", deviceItem.deviceId);
    deviceItem.connectCount = 0;
    this.subs.push(
      defer(() => this.pollingService(deviceItem))
        .pipe(repeatWhen(attampes => attampes.pipe(delay(this.retryTime))))
        .subscribe()
    );
  }
}