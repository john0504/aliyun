import { Component } from '@angular/core';
import { Alert, AlertController, IonicPage, NavController, ViewController, Loading } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { Subscription } from 'rxjs/Subscription';
import { of } from 'rxjs/observable/of';
import { defer } from 'rxjs/observable/defer';
import { catchError, delay, repeatWhen, switchMap, first, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { NgRedux } from '@angular-redux/store';

import { AppActions, AppTasks, StateStore } from 'app-engine';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

import { ThemeService } from '../../providers/theme-service';
import { CheckNetworkService } from '../../providers/check-network';

@IonicPage()
@Component({
  selector: 'page-device-create',
  templateUrl: 'device-create.html'
})
export class DeviceCreatePage {

  private subs: Array<Subscription>;
  private deviceInfo$: Observable<any>;
  canContinue: boolean = false;
  isTokenValidated: boolean = false;
  appName: Promise<string>;
  alert: Alert;
  brand: string = "";
  model: string = "";
  serial: string = "";
  loading: Loading;

  constructor(
    private stateStore: StateStore,
    private appTasks: AppTasks,
    private ngRedux: NgRedux<any>,
    public alertCtrl: AlertController,
    public appVersion: AppVersion,
    public checkNetworkService: CheckNetworkService,
    public nativeSettings: OpenNativeSettings,
    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
  ) {
    this.subs = [];
    this.appName = this.appVersion.getAppName();
    this.deviceInfo$ = this.ngRedux.select(['ssidConfirm', 'deviceInfo']);
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
  }

  ionViewWillEnter() {
    this.subs.push(
      this.queryDeviceInfo()
        .pipe(repeatWhen(attampes => attampes.pipe(delay(3000))))
        .subscribe()
    );
    this.subs.push(
      this.deviceInfo$
        .subscribe(deviceInfo => {
          this.brand = deviceInfo && deviceInfo.Brand;
          this.model = deviceInfo && deviceInfo.Model;
          this.serial = deviceInfo && deviceInfo.serial;
        })
    );
  }

  private queryDeviceInfo() {
    return defer(() => this.appTasks.queryDeviceInfoTask())
      .pipe(
        switchMap(() =>
          this.stateStore.account$
            .pipe(
              first(),
              map(_ => {
                return true;
              }),
            )
        ),
        catchError(() => of(false)),
        map(result => this.canContinue = result),
      );
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  ionViewWillUnload() {
    this.checkNetworkService.resume();
  }

  onNext() {
    this.navCtrl.push('SsidConfirmPage')
      .then(() => this.closePage());
  }

  onCapsuleMode() {
    this.navCtrl.push('CapsuleDevicePage')
      .then(() => this.closePage());
  }

  closePage() {
    this.viewCtrl.dismiss();
    this.brand = "";
    this.model = "";
    this.serial = "";
  }
}

const INITIAL_STATE = {
  deviceInfo: null,
};

export function deviceCreateReducer(state = INITIAL_STATE, action) {
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
