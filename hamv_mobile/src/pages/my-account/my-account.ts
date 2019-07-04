import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  NavController,
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import {
  AppTasks,
  AccountService,
  Logger,
} from 'app-engine';

import { ViewStateService } from '../../providers/view-state-service';

@IonicPage()
@Component({
  selector: 'page-my-account',
  templateUrl: 'my-account.html',
})
export class MyAccountPage {

  constructor(
    private accountService: AccountService,
    private alertCtrl: AlertController,
    private appTasks: AppTasks,
    private navCtrl: NavController,
    private translate: TranslateService,
    private vsService: ViewStateService,
  ) { }

  requestData() {
    this.appTasks.requestUserDataTask()
      .then(() => {
        const title = this.translate.instant('MY_ACCOUNT.REQUEST_DATA_TITLE');
        const okText = this.translate.instant('MY_ACCOUNT.OK');
        const config = {
          title,
          buttons: [okText],
        };
        this.alertCtrl
          .create(config)
          .present();
      });
  }

  deleteAccount() {
    const title = this.translate.instant('MY_ACCOUNT.DELETE_MY_ACCOUNT');
    const cancelText = this.translate.instant('MY_ACCOUNT.CANCEL');
    const deleteText = this.translate.instant('MY_ACCOUNT.DELETE');
    this.accountService.getAccount()
      .then(account => {
        let config;
        if (account && account.isOAuth) {
          const message = this.translate.instant('MY_ACCOUNT.DELETE_MY_OAUTH_ACCOUNT_MESSAGE');
          config = {
            title,
            message,
            buttons: [
              {
                text: cancelText,
                role: 'cancel'
              },
              {
                text: deleteText,
                handler: data => this.deleteOAuthAccount(),
              }
            ]
          };
        } else {
          const message = this.translate.instant('MY_ACCOUNT.DELETE_MY_ACCOUNT_MESSAGE');
          const placeholderText = this.translate.instant('MY_ACCOUNT.TEXT_PLACEHOLDER');
          config = {
            title,
            message,
            inputs: [
              {
                name: 'password',
                placeholder: placeholderText,
                type: 'password'
              }
            ],
            buttons: [
              {
                text: cancelText,
                role: 'cancel'
              },
              {
                text: deleteText,
                handler: data => this.deleteNormalAccount(data),
              }
            ]
          };
        }
        this.alertCtrl
          .create(config)
          .present();
      });
  }

  private deleteOAuthAccount() {
    return this.appTasks.deleteAccountTask()
      .then(() => this.afterWork())
      .catch(e => Logger.log('Deleting account error -> ', e));
  }

  private deleteNormalAccount(data) {
    this.accountService.getAccount()
      .then(account => this.accountService.getPassword(account))
      .then(password => {
        if (data.password === password) {
          return this.appTasks.deleteAccountTask();
        }
        return Promise.reject(new Error('incorrect password'));
      })
      .then(() => this.afterWork())
      .catch(e => Logger.log('Deleting account error -> ', e));
  }

  private afterWork() {
    this.vsService.clearAll();
    this.navCtrl.setRoot('PopitListPage');
  }
}
