import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { Platform } from 'ionic-angular/platform/platform';

@Component({
  selector: 'gdpr-alert',
  templateUrl: 'gdpr-alert.html'
})
export class GdprAlertComponent {

  appName: string = '';
  oauthProvider: string = '';
  oauthName: string = '';
  private unregister;

  constructor(
    private platform: Platform,
    private viewCtrl: ViewController,
    params: NavParams,
  ) {
    this.appName = params.get('appName');
    this.oauthProvider = params.get('oauthProvider');
    this.oauthName = params.get('oauthName');
    this.unregister = this.createBlocker();
  }

  gdprConsent(consent) {
    this.unregister();
    this.viewCtrl.dismiss(consent);
  }

  private createBlocker() {
    return this.platform.registerBackButtonAction(() => {
      this.gdprConsent(false);
    }, 9007199254740901);
  }
}
