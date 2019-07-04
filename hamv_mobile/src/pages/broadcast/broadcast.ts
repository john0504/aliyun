import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { WifiSecurityType } from 'app-engine';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { defer } from 'rxjs/observable/defer';
import { delay, repeatWhen } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';

import { AppActions, AppTasks, ErrorsService } from 'app-engine';

import { ThemeService } from '../../providers/theme-service';
import { CheckNetworkService } from '../../providers/check-network';

import { AppUtils } from '../../utils/app-utils';

@IonicPage()
@Component({
  selector: 'page-broadcast',
  templateUrl: 'broadcast.html'
})
export class BroadcastPage {

  private subs: Array<Subscription>;
  private deviceInfo$: Observable<any>;
  deviceInfo;
  selectAp;
  wifiAps = [];
  wifiAp: { ssid?: string, password?: string, sec?: string } = {};
  sec;
  useText: boolean = false;
  isSelectFocus = false;
  isLocalBroadcast = false;

  iconName: string = "eye";
  inputType: string = "password";
  showPassword: boolean = false;

  vendorVer: string = "";
  vendorName: string = "";
  semiVer: string = "";

  constructor(
    private ngRedux: NgRedux<any>,
    private appTasks: AppTasks,
    private errorsService: ErrorsService,
    public checkNetworkService: CheckNetworkService,
    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
    public params: NavParams,
  ) {
    this.subs = [];
    this.deviceInfo$ = this.ngRedux.select(['ssidConfirm', 'deviceInfo']);
    this.wifiAp = { ssid: '', password: '', sec: WifiSecurityType.WPA2 };
  }

  clearSSID() {
    if (this.useText) {
      this.selectAp = null;
    }
    this.wifiAp.ssid = '';
  }

  needPassword() {
    return this.wifiAp && this.wifiAp.sec !== WifiSecurityType.OPEN;
  }

  clearPassword() {
    if (this.wifiAp && this.wifiAp.sec === WifiSecurityType.OPEN) {
      this.wifiAp.password = '';
    }
  }

  wifiApSelected() {
    if (this.selectAp) {
      this.wifiAp.ssid = this.selectAp.ssid;
      this.wifiAp.sec = this.selectAp.sec;
      this.clearPassword();
    }
  }

  isValid(): boolean {
    if (!this.wifiAp) return false;
    if (!this.wifiAp.ssid || this.wifiAp.ssid === '')
      return false;
    if (!(this.wifiAp.sec === WifiSecurityType.OPEN || this.wifiAp.sec === WifiSecurityType.WEP ||
      this.wifiAp.sec === WifiSecurityType.WPA2 || this.wifiAp.sec === WifiSecurityType.WPA))
      return false;
    if ((!this.wifiAp.password || this.wifiAp.password === '') &&
      this.wifiAp.sec !== WifiSecurityType.OPEN)
      return false;
    if (this.wifiAp.password && this.wifiAp.password.length < 8)
      return false;

    return true;
  }

  onNext() {
    this.appTasks.broadcastTask(this.wifiAp.ssid, this.wifiAp.password, this.wifiAp.sec, this.deviceInfo.provision)
      .then(() => {
        this.closePage();
      });
  }

  onShowHidePassword() {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      this.inputType = "text";
      this.iconName = "eye-off";
    }
    else {
      this.inputType = "password";
      this.iconName = "eye";
    }
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
  }

  ionViewDidEnter() {
    this.subs.push(
      this.errorsService.getSubject()
        .subscribe(error => this.handleErrors(error))
    );
    this.subs.push(
      this.queryDeviceInfo()
        .pipe(repeatWhen(attampes => attampes.pipe(delay(10000))))
        .subscribe()
    );
    this.subs.push(
      this.deviceInfo$
        .subscribe(deviceInfo => {
          this.deviceInfo = deviceInfo;
          if (deviceInfo["VendorVer"]) {
            this.vendorVer = "FW Version : " + deviceInfo["VendorVer"];
          }
          if (deviceInfo["VendorStr"]) {
            this.vendorName = "FW Name : " + deviceInfo["VendorStr"];
          }
          if (deviceInfo["SemiVer"]) {
            this.semiVer = "Semi Version : " + deviceInfo["SemiVer"];
          }
          if (!this.isSelectFocus && !this.useText) {
            let _wifiAps  = [];
            _wifiAps = deviceInfo && deviceInfo.wifi ? deviceInfo.wifi : [];
            _wifiAps = _wifiAps.sort((a, b) => AppUtils.compareWifiSignalStrength(a, b));
            _wifiAps = JSON.parse(JSON.stringify(_wifiAps));
            const mode = this.params.get('mode');
            if (mode == "Local Broadcast") {
              this.wifiAps = [];
              _wifiAps.forEach(_wifiAp => {
                if (_wifiAp && _wifiAp.ssid.indexOf('tenx-') != -1) {
                  this.wifiAps.push(_wifiAp);
                }
              });
            } else {
              this.wifiAps = [];
              _wifiAps.forEach(_wifiAp => {
                if (_wifiAp && _wifiAp.ssid.indexOf('tenx-') == -1) {                  
                  this.wifiAps.push(_wifiAp);
                }
              });
            }
            const _selectAp = _wifiAps.find(wifiAp => wifiAp.ssid === this.wifiAp.ssid);
            if (_selectAp) {
              this.selectAp = _selectAp;
            } else if (this.selectAp) {
              _wifiAps.push(this.selectAp);
            }
          }
        })
    );
  }

  ionViewWillLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  ionViewWillUnload() {
    this.checkNetworkService.resume();
  }

  compareFn(e1, e2): boolean {
    return e1.ssid === e2.ssid;
  }

  private queryDeviceInfo() {
    return defer(() => this.appTasks.queryDeviceInfoTask());
  }

  // error is an action
  private handleErrors(error) {
    switch (error.type) {
      case AppActions.QUERY_DEVICE_INFO_DONE:
        break;
    }
  }

  closePage() {
    this.viewCtrl.dismiss();
  }
}

const INITIAL_STATE = {
  deviceInfo: null,
  caResponse: null
};

export function ssidConfirmReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case AppActions.QUERY_DEVICE_INFO_DONE:
      if (!action.error) {
        return Object.assign({}, state, { deviceInfo: action.payload, });
      }
      return state;
    default:
      return state;
  }
}
