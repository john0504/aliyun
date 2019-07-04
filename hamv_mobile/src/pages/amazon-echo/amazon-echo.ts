import { Component } from '@angular/core';
import { IonicPage, Platform } from 'ionic-angular';
import { Market } from '@ionic-native/market';

import { appConfig } from '../../app/app.config';

import { ThemeService } from '../../providers/theme-service';
import { UtilsProvider } from '../../providers/utils-provider';

@IonicPage()
@Component({
  selector: 'page-amazon-echo',
  templateUrl: 'amazon-echo.html',
})
export class AmazonEchoPage {
  appConfig;

  constructor(
    private market: Market,
    private platform: Platform,
    private utilsProvider: UtilsProvider,
    public themeService: ThemeService,
  ) {
    this.appConfig = appConfig;
  }

  openAlexaSkills() {
    if (this.platform.is('ios')) {
      this.market.open('id944011620');
    } else {
      const url = 'http://alexa.amazon.com/';
      this.utilsProvider.openLink(url);
    }
  }

  openAlexaSkillsDoc() {
    const url = 'https://www.amazon.com/gp/help/customer/display.html?nodeId=201749240';
    this.utilsProvider.openLink(url);
  }
}
