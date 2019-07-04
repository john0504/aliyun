import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  Platform,
  ViewController
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { delay, first, map, retryWhen, timeoutWith } from 'rxjs/operators';

import {
  AppTasks,
  StateStore,
  TimeoutError,
} from 'app-engine';

import { ThemeService } from '../../providers/theme-service';
import { GoAddingDeviceService } from '../../providers/go-adding-device-service';

@IonicPage()
@Component({
  selector: 'page-provision-failure',
  templateUrl: 'provision-failure.html'
})
export class ProvisionFailurePage {

  private unregister;
  private serial: string;

  constructor(
    private alertCtrl: AlertController,
    private goService: GoAddingDeviceService,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private appTasks: AppTasks,
    private stateStore: StateStore,
    private translate: TranslateService,
    public navCtrl: NavController,
    public params: NavParams,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
  ) {
    this.serial = this.params.get('deviceSn');
  }

  ionViewDidLoad() {
    this.platform.ready()
      .then(() => {
        this.unregister = this.platform.registerBackButtonAction(() => {
          console.log('Preventing users from pressing the hardware back button on the phone');
        }, 100);
      });
  }

  ionViewWillUnload() {
    this.unregister && this.unregister();
  }

  onCheck() {
    const loading = this.loadingCtrl.create({
      content: this.translate.instant('PROVISION_FAILURE.LOADING'),
    });
    loading.present();
    this.provision(this.serial)
      .subscribe(serial => {
        const newProperties = {
          displayName: this.translate.instant('PROVISION_LOADING.MY_NEW_PRODUCT', { productName: this.themeService.productName }),
          alexaDeviceName: this.translate.instant('PROVISION_LOADING.MY_NEW_PRODUCT', { productName: this.themeService.productName }),
        };
        const goNext = () => {
          loading.dismiss();
          this.navCtrl.push('ProvisionDonePage', { deviceSn: serial });
          this.viewCtrl.dismiss();
        };
        this.appTasks.wsRequestSetPropertiesTask(serial, newProperties)
          .then(goNext)
          .catch(goNext);
      }, (error) => {
        loading.dismiss();
        this.showNoDeviceAlert();
      });
  }

  private provision(serial) {
    return this.stateStore.deviceDisplayList$
      .pipe(
        first(),
        map(list => {
          if (list.findIndex(deviceId => serial === deviceId) === -1) {
            throw new Error('Not found');
          }
          return serial;
        }),
        retryWhen(error => error.pipe(delay(3000))),
        timeoutWith(20000, ErrorObservable.create(new TimeoutError('Provision timeout'))),
      );
  }

  private showNoDeviceAlert() {
    const alertTitle = this.translate.instant('PROVISION_FAILURE.NO_DEVICE_TITLE');
    const alertMsg = this.translate.instant('PROVISION_FAILURE.NO_DEVICE_MSG');
    const alertCancel = this.translate.instant('PROVISION_FAILURE.GO_BACK');
    const alertOK = this.translate.instant('PROVISION_FAILURE.TRY_AGAIN');
    const alert = this.alertCtrl.create({
      title: alertTitle,
      message: alertMsg,
      buttons: [{
        text: alertCancel,
        role: 'cancel',
        handler: () => this.onNext(),
      }, {
        text: alertOK,
        handler: () => this.onCheck(),
      }],
      enableBackdropDismiss: false,
    });
    alert.present();
  }

  closePage() {
    this.viewCtrl.dismiss();
  }

  onNext() {
    this.goService.goAddingDevicePage(this.navCtrl)
      .then(() => this.closePage());
  }
}
