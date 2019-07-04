import { Component } from '@angular/core';

import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { NgRedux } from '@angular-redux/store';

import { AppActions, AppTasks, ErrorsService } from 'app-engine';

import { defer } from 'rxjs/observable/defer';
import {
  delay,
  // repeatWhen 
} from 'rxjs/operators';

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
  selector: 'support-mode',
  templateUrl: 'support-mode.html'
})
export class SupportModePage {

  private subs: Array<Subscription>;
  private response$: Observable<any>;
  deviceItem: any;
  uiModel: any;
  logs = [];
  myCommand = [];
  testMode: boolean = false;
  isFirst: boolean = true;
  isTimeout = false;
  timeoutNumber;

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
    public params: NavParams,
  ) {
    this.subs = [];
    this.response$ = this.ngRedux.select(['supportMode', 'response']);
    this.deviceItem = this.makeDeviceItem();
  }

  ionViewDidLoad() {
    this.isFirst = true;
    this.checkNetworkService.pause();
    this.setupTestMode();
  }

  ionViewDidEnter() {
    this.isTimeout = false;
    this.updateLayout();
    this.deviceItem.viewState = this.updateViewState(this.deviceItem.viewState);
    this.subs.push(
      this.response$
        .pipe(delay(500))
        .subscribe(response => {
          if (this.timeoutNumber) {
            clearTimeout(this.timeoutNumber);
          }
          this.printLog("response", JSON.stringify(response));
          if (this.isFirst) {
            this.isFirst = false;
            var cmd = { LocalMode: 3, timestamp: Math.floor(this.getTimestamp() / 1000) };
            var arr: any = ["", cmd];
            this.appTasks.postLocalModeTask(arr);
          } else if (!response || response == "") {
            this.callSupportModeTask();
          } else {
            if (response["data"]) {
              const status = response;
              if (!this.deviceItem.viewState.isConnected) {
                this.deviceItem._device.status = status;
                this.deviceItem._device.fields = Object.keys(status["data"]);
                this.deviceItem._device.properties.displayName = this.params.get('serial');
                this.deviceItem.viewState.isConnected = true;
              }
              if (this.myCommand.length == 0) {
                this.deviceItem._device.status = status["data"];
                this.updateLayout();
                this.deviceItem.viewState = this.updateViewState(this.deviceItem.viewState);
              }
            }
            this.sendPolling();
          }
        })
    );
    // this.subs.push(
    //   defer(() => this.sendPolling())
    //     .pipe(repeatWhen(attampes => attampes.pipe(delay(1000))))
    //     .subscribe()
    // );

    this.subs.push(
      this.errorsService.getSubject()
        .subscribe(error => this.handleErrors(error))
    );
  }

  ionViewWillLeave() {
    this.isTimeout = false;
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;

    var cmd = { LocalMode: 0, timestamp: Math.floor(this.getTimestamp() / 1000) };
    var arr: any = ["", cmd];

    defer(() => this.appTasks.postLocalModeTask(arr).then(() => {
      this.popupService.makeToast({
        message: this.translate.instant('DEVICE_CREATE.SUPPORT_MODE_LEAVE'),
        duration: 3000
      });
    })).pipe(delay(1000)).subscribe();
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

  callSupportModeTask(command?): Promise<any> {
    if (command) {
      this.printLog("callSupportModeTask post", JSON.stringify(command));
      return this.appTasks.postServiceStatusTask(this.getToken(), command);
    } else {
      this.printLog("callSupportModeTask get", "");
      return this.appTasks.getServiceStatusTask(this.getToken());
    }
  }

  sendSupportModeCommands(command) {
    var cmd = { data: command };
    if (this.myCommand.length > 0) {
      var cmds = this.myCommand.pop();
      cmd = { data: Object.assign({}, cmds.data, command) };
    }
    this.myCommand.push(cmd);
  }

  sendCommands(commands) {
    var cmd = {};
    cmd[commands.key] = commands.value;
    this.sendSupportModeCommands(cmd);

    this.deviceItem.viewState = Object.assign({}, this.deviceItem.viewState, cmd);
    this.viewStateService.setViewState(this.deviceItem._deviceSn, this.deviceItem.viewState);
  }

  sendPolling(): Promise<any> {
    if (this.timeoutNumber) {
      clearTimeout(this.timeoutNumber);
    }
    if (this.isTimeout) {
      this.printLog("Pring Error", "Time out");
      if (!this.testMode) {
        this.navCtrl.pop();
      }
    } else {
      this.timeoutNumber = setTimeout(() => { this.isTimeout = true; }, 3000);
    }
    this.printLine();
    if (this.myCommand.length != 0) {
      return this.sendNormalCommand();
    } else {
      return this.callSupportModeTask()
        .catch(() => {
          this.printLog("Pring Error", "callLocalModeTask PollingStatus");
          if (!this.testMode) {
            this.navCtrl.pop();
          }
        });
    }
  }

  sendNormalCommand(): Promise<any> {
    return this.callSupportModeTask(this.myCommand.pop()).catch(() => {
      this.printLog("Pring Error", "callSupportModeTask NormalCommand");
      if (!this.testMode) {
        this.navCtrl.pop();
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
          this.deviceItem.popitPopular = popitPopular;
        }

        if (controlLayout && controlLayout.secondary) {
          let popitExpanded: Array<any> = [];
          controlLayout.secondary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitExpanded.push(m);
            }
          });
          this.deviceItem.popitExpanded = popitExpanded;
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
    const currentDate: Date = new Date();
    this.logs.reverse();
    this.logs.push('[' + currentDate + ']' + title + "=>" + msg);
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
            brand: this.params.get('brand'), model: this.params.get('model')
          },
          module: {
            firmware_version: "0.6.3", mac_address: this.params.get('serial'),
            local_ip: "10.1.7.110", ssid: "tenx-hc2_2.4G"
          }, cert: {
            fingerprint: { sha1: "01234567890123456789" },
            validity: { not_before: "01/01/15", not_after: "12/31/25" }
          }
        },
        properties: { displayName: this.params.get('serial') },
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
      case AppActions.GET_SERVICE_STATUS_DONE:
        // this.navCtrl.setRoot('HomePage');
        this.printLog("get error", JSON.stringify(error));
        break;
      case AppActions.POST_SERVICE_STATUS_DONE:
        // this.navCtrl.setRoot('HomePage');
        this.printLog("post error", JSON.stringify(error));
        break;
      case AppActions.POST_LOCAL_MODE_DONE:
        // this.navCtrl.setRoot('HomePage');
        this.printLog("local error", JSON.stringify(error));
        break;
    }
  }

  getTimestamp() {
    return Date.now();
  }

  getToken() {
    return btoa(this.params.get('brand') + this.params.get('model') + ':' + this.params.get('serial'));
  }
}

const INITIAL_STATE = {
  response: null,
};

export function supportModeReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case AppActions.GET_SERVICE_STATUS_DONE:
      if (!action.error) {
        return Object.assign({}, state, { response: action.payload, });
      }
      return state;
    case AppActions.POST_SERVICE_STATUS_DONE:
      if (!action.error) {
        return Object.assign({}, state, { response: action.payload, });
      }
      return state;
    case AppActions.POST_LOCAL_MODE_DONE:
      if (!action.error) {
        return Object.assign({}, state, { response: action.payload, });
      }
      return state;
    default:
      return state;
  }
}