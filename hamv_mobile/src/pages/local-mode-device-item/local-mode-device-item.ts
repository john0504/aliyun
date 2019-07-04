import { Component } from '@angular/core';

import { IonicPage, NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { NgRedux } from '@angular-redux/store';

import { AppActions, AppTasks, ErrorsService } from 'app-engine';

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

var isTimeout = false;
var timeoutNumber;

@IonicPage()
@Component({
  selector: 'local-mode-device-item',
  templateUrl: 'local-mode-device-item.html'
})
export class LocalModeDeviceItemPage {

  private subs: Array<Subscription>;
  private response$: Observable<any>;
  deviceItem: any;
  uiModel: any;
  popitPopular: Array<any>;
  popitExpanded: Array<any>;
  logs = [];
  myCommand = [];
  token: string = "";
  isPollingCmd: boolean = false;
  testMode: boolean = false;

  constructor(

    private ngRedux: NgRedux<any>,
    private appTasks: AppTasks,
    private errorsService: ErrorsService,
    public navCtrl: NavController,
    public themeService: ThemeService,
    private ims: InformationModelService,
    public deviceConfigService: DeviceConfigService,
    public deviceCtrlService: DeviceControlService,
    public viewStateService: ViewStateService,
    private translate: TranslateService,
    private popupService: PopupService,
    public checkNetworkService: CheckNetworkService,
    private storage: Storage,
  ) {
    this.subs = [];
    this.popitPopular = [];
    this.popitExpanded = [];
    this.response$ = this.ngRedux.select(['localMode', 'response']);
    this.deviceItem = this.makeDeviceItem();
  }


  ionViewDidLoad() {
    this.checkNetworkService.pause();
    this.setupTestMode();

    let cmd = {};
    cmd["LocalMode"] = 1;
    cmd["timestamp"] = Math.floor(this.getTimestamp() / 1000);
    let arr = ["", cmd];
    this.myCommand.push(arr);
  }

  ionViewDidEnter() {
    isTimeout = false;
    this.updateLayout();
    this.deviceItem.viewState = this.updateViewState(this.deviceItem.viewState);

    this.subs.push(
      this.response$
        .subscribe(response => {
          if (timeoutNumber) {
            clearTimeout(timeoutNumber);
          }
          this.printLog("get", JSON.stringify(response));
          if (!response)
            return;
          const topic = response[0];
          const payload = response[1];
          switch (topic) {
            case "":
              if (this.isPollingCmd) {
                this.sleep(500);
              }
              break;
            case "$resource/states":
              this.deviceItem._device.status = payload;
              this.deviceItem.viewState.isConnected = true;
              this.updateLayout();
              this.deviceItem.viewState = this.updateViewState(this.deviceItem.viewState);
              break;
            case "$resource/ota":
              break;
            case "$resource/module":
              this.deviceItem._device.profile.module = payload;
              break;
            case "$resource/cert":
              this.deviceItem._device.profile.cert = payload;
              break;
            case "$resource/esh":
              this.deviceItem._device.profile.esh = payload;
              this.deviceItem._device.properties.displayName =
                this.deviceItem._device.profile.esh.brand + ' '
                + this.deviceItem._device.profile.esh.model;
              break;
            case "$resource/fields":
              this.deviceItem._device.fields = payload;
              this.updateLayout();
              this.deviceItem.viewState = this.updateViewState(this.deviceItem.viewState);
              break;
            case "$resource/schedules":
              break;
            case "$resource/token":
              this.token = payload;
              this.sendLocalModeCommands("provisioned");
              let arr = [`$resource/owner/${this.getTimestamp()}000`, "5"];
              this.myCommand.push(arr);
              break;
            case "$resource/owner":
              break;
            case "$resource/result":
              break;
            case "$resource/action":
              break;
          }
        })
    );
    this.subs.push(
      defer(() => this.sendPolling())
        .pipe(repeatWhen(attampes => attampes.pipe(delay(100))))
        .subscribe()
    );

    this.subs.push(
      this.errorsService.getSubject()
        .subscribe(error => this.handleErrors(error))
    );
  }

  ionViewWillLeave() {
    isTimeout = false;
    let cmd = {};
    cmd["LocalMode"] = 0;
    cmd["timestamp"] = Math.floor(this.getTimestamp() / 1000);
    let arr = ["", cmd];
    this.myCommand.push(arr);
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
    this.popupService.makeToast({
      message: this.translate.instant('DEVICE_CREATE.LOCAL_MODE_LEAVE'),
      duration: 3000
    });
  }

  ionViewWillUnload() {
    this.checkNetworkService.resume();
  }

  private setupTestMode() {
    return this.storage.get('testMode')
      .then((testMode) => {
        if (testMode) {
          this.testMode = testMode;
        } else {
          this.testMode = false;
        }
      });
  }

  callLocalModeTask(command): Promise<any> {
    this.printLog("send", JSON.stringify(command));
    return this.appTasks.postLocalModeTask(command);
  }

  sendLocalModeCommands(request, command?) {
    let cmd = {};
    cmd["request"] = request;

    if (command) {
      cmd["data"] = command;
    }

    if (request == "provisioned") {
      cmd["id"] = Math.floor(this.getTimestamp() / 1000);
    } else {
      cmd["id"] = this.token;
    }

    let arr = [`$resource/action/${this.getTimestamp()}000`, cmd];
    this.myCommand.push(arr);
  }

  sendCommands(commands) {
    let cmd = {};
    cmd[commands.key] = commands.value;
    this.sendLocalModeCommands("set", cmd);

    this.deviceItem.viewState = Object.assign({}, this.deviceItem.viewState, cmd);
    this.viewStateService.setViewState(this.deviceItem._deviceSn, this.deviceItem.viewState);
  }

  sendPolling(): Promise<any> {
    if (timeoutNumber) {
      clearTimeout(timeoutNumber);
    }
    if (isTimeout) {
      if (!this.testMode) {
        this.navCtrl.pop();
        this.printLog("Pring Error", "Time out");
      }
    } else {
      timeoutNumber = setTimeout(() => { isTimeout = true; }, 3000);
    }
    this.printLine();
    if (this.myCommand.length != 0) {
      this.isPollingCmd = false;
      return this.sendNormalCommand();
    } else {
      let cmd = {};
      cmd["PollingStatus"] = 1;
      let arr = ["", cmd];
      this.isPollingCmd = true;
      return this.callLocalModeTask(arr)
        .catch(() => {
          if (!this.testMode) {
            this.navCtrl.pop();
            this.printLog("Pring Error", "callLocalModeTask PollingStatus");
          }
        });
    }
  }

  sendNormalCommand(): Promise<any> {
    return this.callLocalModeTask(this.myCommand.pop())
      .catch(() => {
        if (!this.testMode) {
          this.navCtrl.pop();
          this.printLog("Pring Error", "callLocalModeTask NormalCommand");
        }
      });
  }

  sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds) {
        break;
      }
    }
  }

  private updateViewState(current): any {
    let viewState: any = this.viewStateService.getViewState(this.deviceItem._deviceSn) || {};
    if (this.deviceItem._device && this.deviceItem._device.status) {
      for (let key in this.deviceItem._device.status) {
        if (this.deviceCtrlService.isAvailable(this.deviceItem._device.device, key)) {
          viewState[key] = this.deviceItem._device.status[key];
        }
      }
    }

    viewState = Object.assign({}, current, viewState);
    this.viewStateService.setViewState(this.deviceItem._deviceSn, viewState);

    return viewState;
  }

  private updateLayout() {
    if (this.deviceItem._device) {
      let uiModel = this.ims.getUIModel(this.deviceItem._device);
      if (uiModel && !isEqual(this.uiModel, uiModel)) {
        this.uiModel = uiModel;

        let controlLayout = this.uiModel.controlLayout;
        if (controlLayout && controlLayout.primary) {
          let popitPopular: Array<any> = [];
          controlLayout.primary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitPopular.push(m);
            }
          });
          this.popitPopular = popitPopular;
        }

        if (controlLayout && controlLayout.secondary) {
          let popitExpanded: Array<any> = [];
          controlLayout.secondary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitExpanded.push(m);
            }
          });
          this.popitExpanded = popitExpanded;
        }

        this.requestConfig(this.deviceItem._deviceSn, uiModel.config);
      }
    }
  }

  private requestConfig(sn: string, config: Array<string>) {
    if (!sn || !config) return;
    this.deviceConfigService.requestConfig(sn, config);
  }

  toggleDetails() {
    if (this.deviceItem.showDetails) {
      this.deviceItem.showDetails = false;
    } else {
      this.deviceItem.showDetails = true;
    }
  }

  printLog(title, msg) {
    console.log(title, msg);
    this.logs.reverse();
    this.logs.push(title + "=>" + msg);
    this.logs.reverse();
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  printLine() {
    this.logs.reverse();
    this.logs.push("======================");
    this.logs.reverse();
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  private makeDeviceItem(): any {
    let deviceItem = {
      _device: {
        device: "1",
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
        properties: { displayName: this.translate.instant('DEVICE_CREATE.LOCAL_MODE_DEVICE') },
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

  // error is an action
  private handleErrors(error) {
    switch (error.type) {
      case AppActions.POST_LOCAL_MODE_DONE:
        this.navCtrl.setRoot('HomePage');
        this.printLog("error", JSON.stringify(error));
        break;
    }
  }

  getTimestamp() {
    return Date.now();
  }
}

const INITIAL_STATE = {
  response: null,
};

export function localModeReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case AppActions.POST_LOCAL_MODE_DONE:
      console.log("get", state);
      if (!action.error) {
        return Object.assign({}, state, { response: action.payload, });
      }
      return state;
    default:
      return state;
  }
}