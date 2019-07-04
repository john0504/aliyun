import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  AlertController,
  AlertOptions,
  IonicPage,
  NavController,
  ViewController
} from 'ionic-angular';

import { ThemeService } from '../../providers/theme-service';

import {
  AppTasks,
  HttpError,
  NetworkError,
  TimeoutError,
} from 'app-engine';

import { PopupService } from '../../providers/popup-service';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {

  userV = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}/i;
  fpw: { username?: string } = {};

  constructor(
    private appTasks: AppTasks,
    private popupService: PopupService,
    private translate: TranslateService,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
  ) {
  }

  onForgotPassword(forgotPwForm) {
    if (forgotPwForm.valid) {
      const email = this.fpw.username.trim();
      const forgotPromise = this.appTasks.requestResetPasswordTask(email);
      const sending = this.translate.instant('FORGOT_PASSWORD.SENDING');
      this.popupService
        .loadingPopup(forgotPromise, {
          content: sending,
        })
        .then(() => this.showSuccessAlert())
        .catch(e => {
          let alertOptions: AlertOptions;
          const alertTitle = this.translate.instant('FORGOT_PASSWORD.ISSUE_HAPPENED_TITLE');
          const alertOK = this.translate.instant('FORGOT_PASSWORD.OK');
          if (e instanceof HttpError) {
            const alertTitle = this.translate.instant('FORGOT_PASSWORD.USER_NOT_EXIST');
            const alertMsg = this.translate.instant('FORGOT_PASSWORD.CHECK_SETTINGS');
            alertOptions = {
              title: alertTitle,
              message: alertMsg,
              buttons: [alertOK],
            };
          } else if (e instanceof NetworkError || e instanceof TimeoutError) {
            const alertMsg = this.translate.instant('FORGOT_PASSWORD.CHK_NETWORK_MSG');
            alertOptions = {
              title: alertTitle,
              message: alertMsg,
              buttons: [alertOK],
            };
          } else {
            const alertMsg = this.translate.instant('FORGOT_PASSWORD.CHK_SETTINGS_MSG');
            alertOptions = {
              title: alertTitle,
              message: alertMsg,
              buttons: [alertOK],
            };
          }
          if (alertOptions) {
            this.alertCtrl.create(alertOptions).present();
          }
        });
    }
  }

  private showSuccessAlert() {
    const alertTitle = this.translate.instant('FORGOT_PASSWORD.PWD_RESET_TITLE');
    const alertMsg = this.translate.instant('FORGOT_PASSWORD.PWD_RESET_MSG');
    const alertOK = this.translate.instant('FORGOT_PASSWORD.OK');
    let alert = this.alertCtrl.create({
      title: alertTitle,
      message: alertMsg,
      buttons: [
        {
          text: alertOK,
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }
      ],
    });
    alert.present();
  }
}
