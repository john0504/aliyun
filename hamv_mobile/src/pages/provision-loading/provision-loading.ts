import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';

import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { defer } from 'rxjs/observable/defer';
import { delay, first, flatMap, map, retry, retryWhen, timeoutWith } from 'rxjs/operators';

import { CheckNetworkService } from '../../providers/check-network';

import {
  AppEngine,
  AppTasks,
  StateStore,
  TimeoutError,
} from 'app-engine';
// import { appConfig } from '../../app/app.config';

import { ThemeService } from '../../providers/theme-service';

@IonicPage()
@Component({
  selector: 'page-provision-loading',
  templateUrl: 'provision-loading.html'
})
export class ProvisionLoadingPage {

  private unregister;
  private pToken: string;
  private serial: string;

  constructor(
    private appEngine: AppEngine,
    private stateStore: StateStore,
    private appTasks: AppTasks,
    private platform: Platform,
    private insomnia: Insomnia,
    public checkNetworkService: CheckNetworkService,
    public navCtrl: NavController,
    public params: NavParams,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
  ) {
    this.stateStore.account$
      .pipe(
        first(),
      )
      .subscribe(account => {
        this.pToken = account.pTokenBundle.token;
      });
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
    this.platform.ready()
      .then(() => {
        this.unregister = this.platform.registerBackButtonAction(() => {
          console.log('Preventing users from pressing the hardware back button on the phone');
        }, 100);
        return this.insomnia.keepAwake();
      })
      .then(() => {
        this.fireApMode()
          .pipe(
            delay(10000),
            flatMap(newDevice => this.provision(newDevice)),
          )
          .subscribe(({ serial }) => {
            this.navCtrl.push('ProvisionDonePage', { deviceSn: serial })
              .then(() => this.viewCtrl.dismiss());
          }, (error) => {
            this.navCtrl.push('ProvisionFailurePage', { deviceSn: this.serial });
            this.viewCtrl.dismiss();
          });
      })
      .catch((error) => {
        this.navCtrl.push('ProvisionFailurePage');
        this.viewCtrl.dismiss();
      });
  }

  private fireApMode() {
    return defer(() => this.fireApModePromise())
      .pipe(retry(2));
  }

  private fireApModePromise() {
    const w = this.params.get('wifiAp');
    const ssid = w.ssid && w.ssid.trim();
    // const pMethod = this.params.get('method');

    // if (/^jwt$/i.test(pMethod)) {
    //   return this.appTasks.fireApModeTask(ssid, w.password, w.sec,
    //     `mqtts://${appConfig.appEngine.productId}.m2.exosite.io:443`, this.pToken, pMethod);
    // }

    return this.appTasks.fireApModeTask(ssid, w.password, w.sec,
      `wss://${this.appEngine.getBaseUrl()}/device`, this.pToken);
  }

  private provision(newDevice) {
    this.serial = newDevice.serial;
    return this.stateStore.deviceDisplayList$
      .pipe(
        first(),
        map(list => {
          if (list.findIndex(deviceId => newDevice.serial === deviceId) === -1) {
            throw new Error('Not found');
          }
          return newDevice;
        }),
        retryWhen(error => error.pipe(delay(3000))),
        timeoutWith(50000, ErrorObservable.create(new TimeoutError('Provision timeout'))),
      );
  }

  ionViewWillUnload() {
    this.unregister && this.unregister();
    this.insomnia.allowSleepAgain();
    this.checkNetworkService.resume();
  }
}
