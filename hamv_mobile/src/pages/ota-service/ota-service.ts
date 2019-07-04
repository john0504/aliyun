import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, Loading } from 'ionic-angular';

import { WifiSecurityType } from 'app-engine';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { defer } from 'rxjs/observable/defer';
import { delay, repeatWhen, retry } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';

import { AppActions, AppTasks, ErrorsService } from 'app-engine';

import { ThemeService } from '../../providers/theme-service';
import { CheckNetworkService } from '../../providers/check-network';

import { AppUtils } from '../../utils/app-utils';
import { PopupService } from '../../providers/popup-service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-ota-service',
  templateUrl: 'ota-service.html'
})
export class OtaServicePage {

  private subs: Array<Subscription>;
  private deviceInfo$: Observable<any>;
  deviceInfo;
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
  serial: string = "";
  otaInfo: string = "";
  log: string = "";

  constructor(
    private ngRedux: NgRedux<any>,
    private appTasks: AppTasks,
    private errorsService: ErrorsService,
    public checkNetworkService: CheckNetworkService,
    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
    private translate: TranslateService,
    private popupService: PopupService,
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
    if (!this.otaInfo || this.otaInfo === '')
      return false;
    if (this.otaInfo) {
      const otaObj = JSON.parse(this.otaInfo);
      if (!otaObj || !otaObj.sha1 || !otaObj.url || !otaObj.port)
        return false;
    }

    return true;
  }

  onNext() {
    // const otaObj = JSON.parse(this.otaInfo);
    // this.log += ("\r\nurl=" + otaObj.url + "&sha1=" + otaObj.sha1 + "&port=" + otaObj.port);
    this.otaService()
      .pipe(delay(10000))
      .subscribe(() => {
        this.loading.dismiss();
        this.viewCtrl.dismiss();
      }, (error) => {
        this.loading.dismiss();
        this.log += ("\r\n" + JSON.stringify(error));
      });
  }

  private otaService() {
    this.loading = this.popupService.makeLoading({
      content: this.translate.instant('PROVISION_LOADING.CONNECTING')
    });
    return defer(() => this.otaServicePromise())
      .pipe(retry(2));
  }

  private otaServicePromise() {
    const w = this.wifiAp;
    const ssid = w.ssid && w.ssid.trim();
    const pMethod = this.deviceInfo.provision;
    const otaObj = JSON.parse(this.otaInfo);
    if (/^jwt$/i.test(pMethod)) {
      return this.appTasks.otaServiceTask(ssid, w.password, w.sec, otaObj.url, otaObj.sha1, otaObj.port, pMethod);
    }

    return this.appTasks.otaServiceTask(ssid, w.password, w.sec, otaObj.url, otaObj.sha1, otaObj.port);
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
      case AppActions.OTA_SERVICE_DONE:
        break;
    }
  }

  closePage() {
    this.viewCtrl.dismiss();
  }
}

const INITIAL_STATE = {
  deviceInfo: null
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