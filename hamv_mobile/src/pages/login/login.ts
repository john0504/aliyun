import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  AlertController,
  AlertOptions,
  IonicPage,
  NavController,
  ViewController,
} from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

import {
  AppTasks,
  HttpError,
  NetworkError,
  StateStore,
  TimeoutError,
} from 'app-engine';

import { ThemeService } from '../../providers/theme-service';
// import mixpanel from 'mixpanel-browser';

import { PopupService } from '../../providers/popup-service';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private subs: Array<Subscription>;
  private account;

  userV = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}/i;
  pwV = /^((?!.*\s)(?=[A-Za-z0-9\!\@\#\$\%\^\&\*\(\)\-\=\¡\£\_\+\`\~\.\,\<\>\/\?\;\:\'\"\\\|\[\]\{\}]).{8,20})$/;
  login: { username?: string, password?: string } = {};
  // {username:"guest@cect.com",password:"12345678"};

  iconName: string = "eye";
  inputType: string = "password";
  showPassword: boolean = false;

  constructor(
    private appTasks: AppTasks,
    private popupService: PopupService,
    private stateStore: StateStore,
    private translate: TranslateService,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
  ) {
    this.subs = [];
  }

  ionViewWillEnter() {
    this.subs.push(
      this.stateStore.account$
        .subscribe((account) => {
          this.account = account;
          if (account && !account.isOAuth) {
            this.login.username = account.account;
          }
        })
    );
  }

  ionViewDidLeave() {
    this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  isUserLoggedIn() {
    return this.account && this.account.isLoggedIn;
  }

  onLogin(form) {
    if (form.valid) {
      const account = this.login.username.trim();
      const pw = this.login.password.trim();
      const loginPromise = this.popupService.loadingPopup(
        this.appTasks.loginTask(account, pw),
        { content: this.translate.instant('LOGIN.LOGGING_IN') },
      );

      loginPromise
        .then(() => {
          // mixpanel.identify(this.login.username);
          // mixpanel.people.set({
          //   $name: this.login.username,
          //   $last_login: new Date(),
          // });
          // mixpanel.track('User Logged In', { account: this.login.username });
        })
        .catch(e => {
          let alertOptions: AlertOptions;
          const alertTitle = this.translate.instant('LOGIN.ISSUE_HAPPENED_TITLE');
          const alertOK = this.translate.instant('LOGIN.OK');
          if (e instanceof HttpError) {
            const alertTitle = this.translate.instant('LOGIN.ISSUE_SIGNING_TITLE');
            const alertMsg = this.translate.instant('LOGIN.ISSUE_SIGNING_MSG');
            alertOptions = {
              title: alertTitle,
              message: alertMsg,
              buttons: [alertOK],
            };
          } else if (e instanceof NetworkError || e instanceof TimeoutError) {
            const alertMsg = this.translate.instant('LOGIN.CHK_NETWORK_MSG');
            alertOptions = {
              title: alertTitle,
              message: alertMsg,
              buttons: [alertOK],
            };
          } else {
            const alertMsg = this.translate.instant('LOGIN.CHK_SETTINGS_MSG');
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

  goForgotPassword() {
    this.navCtrl.push('ForgotPasswordPage');
  }

  onLogout() {
    this.appTasks.logoutTask();
  }
}
