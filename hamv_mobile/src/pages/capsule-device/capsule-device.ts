import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, Loading } from 'ionic-angular';

import { WifiSecurityType } from 'app-engine';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { defer } from 'rxjs/observable/defer';
import { delay, repeatWhen, retry } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';
import { debounceImmediate } from '../../app/app.extends';

import { 
  AppActions, 
  AppTasks, 
  ErrorsService,
  StateStore, 
  AppEngine,
} from 'app-engine';

import { ThemeService } from '../../providers/theme-service';
import { CheckNetworkService } from '../../providers/check-network';

import { AppUtils } from '../../utils/app-utils';
import { Geolocation } from '@ionic-native/geolocation';
import { PopupService } from '../../providers/popup-service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-capsule-device',
  templateUrl: 'capsule-device.html'
})
export class CapsuleDevicePage {

  private subs: Array<Subscription>;
  private deviceInfo$: Observable<any>;
  selectAp;
  wifiAps;
  wifiAp: { ssid?: string, password?: string, sec?: string } = {};
  sec;
  useText: boolean = false;
  isSelectFocus: boolean = false;

  iconName: string = "eye";
  inputType: string = "password";
  showPassword: boolean = false;
  loading: Loading;

  vendorVer: string = "";
  vendorName: string = "";
  semiVer: string = "";
  money: string = "";
  gift: string = "";
  bank: string = "";
  devicename: string = "";
  serial: string = "";
  latitude: number = 0;
  longitude: number = 0;
  log: string = "";
  accountToken;

  constructor(
    private ngRedux: NgRedux<any>,
    private appTasks: AppTasks,
    private errorsService: ErrorsService,
    public checkNetworkService: CheckNetworkService,
    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
    private geolocation: Geolocation,
    private translate: TranslateService,
    private popupService: PopupService,
    private stateStore: StateStore,
    private appEngine: AppEngine,
  ) {
    this.subs = [];
    this.deviceInfo$ = this.ngRedux.select(['ssidConfirm', 'deviceInfo']);
    this.wifiAp = { ssid: '', password: '', sec: WifiSecurityType.WPA2 };
    
    const account$ = this.stateStore.account$;
    this.subs.push(
      account$
        .pipe(debounceImmediate(500))
        .subscribe(account => this.accountToken = (account && account.token) || '')
    );
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

  isMoneyValid(): boolean {
    if (this.money && this.money !== '' && (parseInt(this.money) > 65535 || parseInt(this.money) < 0)) {
      return false;
    } else {
      return true;
    }
  }

  isGiftValid(): boolean {
    if (this.gift && this.gift !== '' && (parseInt(this.gift) > 65535 || parseInt(this.gift) < 0)) {
      return false;
    } else {
      return true;
    }
  }

  isBankValid(): boolean {
    if (this.bank && this.bank !== '' && (parseInt(this.bank) > 65535 || parseInt(this.bank) < 0)) {
      return false;
    } else {
      return true;
    }
  }

  isDevicenameValid(): boolean {
    if (this.devicename && this.devicename !== '') {
      var str = encodeURIComponent(this.devicename);
      var len = str.replace(/%[A-F\d]{2}/g, 'U').length;
      if (len > 30)
        return false;
    }
    return true;
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

    if (!this.money || this.money === '')
      return false;
    if (!this.gift || this.gift === '')
      return false;
      if (!this.bank || this.bank === '')
        return false;
    if (!this.devicename || this.devicename === '')
      return false;

    if (!this.isMoneyValid() || !this.isGiftValid()  || !this.isBankValid() || !this.isDevicenameValid())
      return false;
      
    return true;
  }

  onNext() {
    this.localMode()
      .pipe(delay(10000))
      .subscribe(() => {
        this.loading.dismiss();
        this.viewCtrl.dismiss();
      }, (error) => {
        this.loading.dismiss();
        this.log += ("\r\n" + JSON.stringify(error));
      });
  }

  private localMode() {
    this.loading = this.popupService.makeLoading({
      content: this.translate.instant('PROVISION_LOADING.CONNECTING')
    });
    return defer(() => this.localModePromise())
      .pipe(retry(2));
  }

  private localModePromise() {
    var url = this.appEngine.getBaseUrl();
    let command = {
      "DevSsid": this.wifiAp.ssid,
      "DevPass": this.wifiAp.password,
      "DevSec": this.wifiAp.sec,
      "DevUrl": url,
      "PrjName": "WAWA",
      "DevName": this.devicename,
      "Account": this.accountToken,
      "H60": this.money,
      "H61": this.gift,
      "H62": this.bank,
      "S01": round(this.latitude, 7).toString(),
      "S02": round(this.longitude, 7).toString()
    };
    this.log = JSON.stringify(command);
    return this.appTasks.localModeTask(JSON.stringify(command));
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
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
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
          if (deviceInfo) {
            this.vendorVer = "FW Version : " + deviceInfo ? deviceInfo["VendorVer"] : "";
            this.vendorName = "FW Name : " + deviceInfo ? deviceInfo["VendorStr"] : "";
            this.semiVer = "Semi Version : " + deviceInfo ? deviceInfo["SemiVer"] : "";
          }
          if (!this.isSelectFocus && !this.useText) {
            let _wifiAps = deviceInfo && deviceInfo.wifi ? deviceInfo.wifi : [];
            _wifiAps = _wifiAps.sort((a, b) => AppUtils.compareWifiSignalStrength(a, b));
            _wifiAps = JSON.parse(JSON.stringify(_wifiAps));
            this.wifiAps = _wifiAps;
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

function round(value: number, precision: number) {
  const base = 10 ** precision;
  return Math.round(value * base) / base;
}