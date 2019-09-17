import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  AlertController,
  AlertOptions,
  IonicPage,
  NavController,
  ViewController
} from 'ionic-angular';

// import mixpanel from 'mixpanel-browser';
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
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {

  // userV = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}/i;
  userV = /^[0-9]{10}/i;
  pwV = /^((?!.*\s)(?=[A-Za-z0-9\!\@\#\$\%\^\&\*\(\)\-\=\¡\£\_\+\`\~\.\,\<\>\/\?\;\:\'\"\\\|\[\]\{\}]).{8,20})$/;
  signup: { username?: string, password?: string, passwordcheck?: string, token?: string } = {};
  usernameF: boolean = false;
  passwordF: boolean = false;
  pwF: boolean = false;
  userConsent: boolean = false;

  iconName: string = "eye";
  inputType: string = "password";
  showPassword: boolean = false;

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

  onSignup(form) {
    if (form.valid && this.userConsent) {
      if (!this.pwV.test(this.signup.password)) {
        this.alertCtrl
          .create({
            title: this.translate.instant('SIGNUP.NOT_VALID_TITLE'),
            message: this.translate.instant('SIGNUP.NOT_VALID_MSG'),
            buttons: [this.translate.instant('SIGNUP.OK')],
          })
          .present();
        return;
      } else if (this.signup.password != this.signup.passwordcheck) {
        this.alertCtrl
          .create({
            title: this.translate.instant('SIGNUP.PASSWORD_NOT_SAME_TITLE'),
            message: this.translate.instant('SIGNUP.PASSWORD_NOT_SAME_MSG'),
            buttons: [this.translate.instant('SIGNUP.OK')],
          })
          .present();
        return;
      }
      const account = this.signup.username.trim();
      const pw = this.signup.password.trim();
      const token = this.signup.token.trim();
      const registerPromise = this.appTasks.registerTask(account, pw, token);

      this.popupService
        .loadingPopup(registerPromise, {
          content: this.translate.instant('SIGNUP.CREATING_ACCOUNT')
        })
        .then(() => {
          // mixpanel.identify(this.signup.username);
          // mixpanel.people.set({
          //   $name: this.signup.username,
          //   $created: new Date(),
          //   $last_login: new Date(),
          // });
          // mixpanel.track('User Signed Up', { account: this.signup.username });
        })
        .catch(e => {
          let alertOptions: AlertOptions;
          if (e instanceof HttpError) {
            console.log(JSON.stringify(e));
            alertOptions = {
              title: this.translate.instant('SIGNUP.USER_ALREADY_EXISTS'),
              message: this.translate.instant('SIGNUP.CHECK_SETTINGS'),
              buttons: [this.translate.instant('SIGNUP.OK')],
            };
            if (e.code == 401) {
              alertOptions.title = this.translate.instant('SIGNUP.TOKEN_NOT_VALID');
            }
          } else if (e instanceof NetworkError || e instanceof TimeoutError) {
            alertOptions = {
              title: this.translate.instant('SIGNUP.ISSUE_HAPPENED_TITLE'),
              message: this.translate.instant('SIGNUP.CHK_NETWORK_MSG'),
              buttons: [this.translate.instant('SIGNUP.OK')],
            };
          } else {
            alertOptions = {
              title: this.translate.instant('SIGNUP.ISSUE_HAPPENED_TITLE'),
              message: this.translate.instant('SIGNUP.CHK_SETTINGS_MSG'),
              buttons: [this.translate.instant('SIGNUP.OK')],
            };
          }
          if (alertOptions) {
            this.alertCtrl.create(alertOptions).present();
          }
        });
    }
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

  onSendsms() {
    const account = this.signup.username.trim();
    const sendsmsPromise = this.appTasks.sendSmsTask(account);
    this.popupService
      .loadingPopup(sendsmsPromise, {
        content: this.translate.instant('SIGNUP.SENDING_MAIL')
      })
      .then(() => {
        let alertOptions: AlertOptions = {
          title: this.translate.instant('SIGNUP.SENDMAIL_TITLE'),
          message: this.translate.instant('SIGNUP.SENDMAIL_MSG'),
          buttons: [this.translate.instant('SIGNUP.OK')],
        };
        this.alertCtrl.create(alertOptions).present();
      })
      .catch(e => {
        let alertOptions: AlertOptions;
        if (e instanceof HttpError) {
          alertOptions = {
            title: this.translate.instant('SIGNUP.USER_ALREADY_EXISTS'),
            message: this.translate.instant('SIGNUP.CHECK_SETTINGS'),
            buttons: [this.translate.instant('SIGNUP.OK')],
          };
        } else if (e instanceof NetworkError || e instanceof TimeoutError) {
          alertOptions = {
            title: this.translate.instant('SIGNUP.ISSUE_HAPPENED_TITLE'),
            message: this.translate.instant('SIGNUP.CHK_NETWORK_MSG'),
            buttons: [this.translate.instant('SIGNUP.OK')],
          };
        } else {
          alertOptions = {
            title: this.translate.instant('SIGNUP.ISSUE_HAPPENED_TITLE'),
            message: this.translate.instant('SIGNUP.CHK_SETTINGS_MSG'),
            buttons: [this.translate.instant('SIGNUP.OK')],
          };
        }
        if (alertOptions) {
          this.alertCtrl.create(alertOptions).present();
        }
      });
  }

  checkMailValid(): boolean {
    const mail = this.signup.username.trim();
    if (mail.search(this.userV) != -1) {
      return true;
    } else {
      return false;
    }
  }
}
