import { Component } from '@angular/core';
import { IonicPage, Platform } from 'ionic-angular';
import { Market } from '@ionic-native/market';

import { appConfig } from '../../app/app.config';
import { ThemeService } from '../../providers/theme-service';
import { UtilsProvider } from '../../providers/utils-provider';

@IonicPage()
@Component({
  selector: 'page-google-home',
  templateUrl: 'google-home.html',
})
export class GoogleHomePage {

  appConfig;

  constructor(
    private market: Market,
    private platform: Platform,
    private utilsProvider: UtilsProvider,
    public themeService: ThemeService,
  ) {
    this.appConfig = appConfig;
  }

  openGoogleHome() {
    if (this.platform.is('ios')) {
      this.market.open('id680819774');
    } else if (this.platform.is('android')) {
      this.market.open('com.google.android.apps.chromecast.app');
    } else {
      const url = 'https://www.google.com/url?q=https://support.google.com/googlehome/answer/7073578?hl%3Den&sa=D&ust=1514861183149000&usg=AFQjCNGMgCFcV5dtpXBnJWYR7efOUU3atg';
      this.utilsProvider.openLink(url);
    }
  }

  openGoogleHomeDoc() {
    const url = 'https://www.google.com/url?q=https://support.google.com/googlehome/answer/7073578?hl%3Den&sa=D&ust=1514861183149000&usg=AFQjCNGMgCFcV5dtpXBnJWYR7efOUU3atg';
    this.utilsProvider.openLink(url);
  }
}
