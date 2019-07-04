import { Directive } from '@angular/core';
import {
  ModalController,
  Platform,
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@ionic-native/app-version';
import { AppTasks } from 'app-engine';

import { PopupService } from '../../providers/popup-service';
import { GdprAlertComponent } from '../../components/gdpr-alert/gdpr-alert';

const noop = () => { };

@Directive({
  selector: '[fb-login]',
  host: {
    '(click)': 'fbLogin()',
  }
})
export class FbLoginDirective {

  private appName = '';

  constructor(
    private appTasks: AppTasks,
    private modalCtrl: ModalController,
    private platform: Platform,
    private popupService: PopupService,
    private translate: TranslateService,
    public appVersion: AppVersion,
  ) {
    this.appVersion.getAppName()
      .then(name => this.appName = name);
  }

  fbLogin() {
    const params = {
      appName: this.appName,
      oauthProvider: 'Facebook',
      oauthName: 'facebook.com',
    };
    const gdprModal = this.modalCtrl.create(GdprAlertComponent, params);
    gdprModal.onDidDismiss(consent => {
      if (consent) {
        this.processFBLogin();
      }
    });
    gdprModal.present();
  }

  private processFBLogin() {
    const unregister = this.platform.registerBackButtonAction(noop, 9007199254740901);

    const loginPromise = this.appTasks.loginWithFacebookTask()
      .then(() => unregister())
      .catch(e => {
        setTimeout(() => unregister(), 200);
        if (!(e.errorCode === '4201' || (typeof e === 'string' && e.includes('cancelled')))) throw e;
      });

    const loggingContent = this.translate.instant('FB_LOGIN.LOGGING_IN');
    const issueHappenedMsg = this.translate.instant('FB_LOGIN.ISSUE_HAPPENED_MSG');

    this.popupService.loadingPopup(
      loginPromise,
      { content: loggingContent },
    );

    this.popupService.toastPopup(
      loginPromise,
      null,
      {
        message: issueHappenedMsg,
        duration: 3000
      },
    );
  }
}
