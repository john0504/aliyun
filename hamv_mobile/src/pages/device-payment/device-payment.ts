import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  AlertOptions,
  AlertController,
} from 'ionic-angular';

import { ViewStateService } from '../../providers/view-state-service';
import {
  AppTasks,
  HttpError,
  NetworkError,
  TimeoutError,
} from 'app-engine';
import { PopupService } from '../../providers/popup-service';

@IonicPage()
@Component({
  selector: 'page-device-payment',
  templateUrl: 'device-payment.html'
})
export class DevicePaymentPage {

  paymentCode: string = "";
  serial: string;

  constructor(
    public navCtrl: NavController,
    public viewStateService: ViewStateService,
    public params: NavParams,
    private appTasks: AppTasks,
    private popupService: PopupService,
    public alertCtrl: AlertController,
  ) {
    this.serial = this.params.get('serial');

  }

  onQRcode() {
    this.navCtrl.push('ScanPage', { callback: this.getPaymentCodeCallback });
  }

  gotoPay() {
    const paymenPromise = this.appTasks.paymentTask(this.serial, this.paymentCode);

    this.popupService
      .loadingPopup(paymenPromise, {
        content: "加值處理中..."
      })
      .then(() => {
        this.alertCtrl.create({
          title: "加值成功",
          message: "",
          buttons: [{
            text: "確定", handler: () => {
              this.goHomePage();
            }
          }],
        }).present();
      })
      .catch(e => {
        let alertOptions: AlertOptions;
        if (e instanceof HttpError) {
          console.log(JSON.stringify(e));
          alertOptions = {
            title: "發生異常",
            message: "請檢查網路設定並重試",
            buttons: ["確定"],
          };
          if (e.code == 400) {
            alertOptions.message = "請重新掃描加值卡並再試一次";
          }

        } else if (e instanceof NetworkError || e instanceof TimeoutError) {
          alertOptions = {
            title: "發生異常",
            message: "請檢查網路設定並重試",
            buttons: ["確定"],
          };
        } else {
          alertOptions = {
            title: "發生異常",
            message: "發生未知例外，請回報開發商",
            buttons: ["確定"],
          };
        }
        if (alertOptions) {
          this.alertCtrl.create(alertOptions).present();
        }
      });
  }

  goHomePage() {
    this.navCtrl.setRoot('HomeListPage');
  }

  getPaymentCodeCallback = (params) => {
    return new Promise(() => {
      if (params) {
        this.paymentCode = params;
      }
    });
  }
}
