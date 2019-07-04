import { Component } from '@angular/core';
import { AppTasks } from 'app-engine';
import {
  IonicPage,
  NavController,
} from 'ionic-angular';

import { appConfig } from '../../app/app.config';
import { ViewStateService } from '../../providers/view-state-service';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  appConfig;

  constructor(
    private appTasks: AppTasks,
    public navCtrl: NavController,
    public viewStateService: ViewStateService,
  ) {
    this.appConfig = appConfig;
  }

  private goHomePage() {
    this.navCtrl.setRoot('HomePage');
  }

  goAmazonEchoPage() {
    this.navCtrl.push('AmazonEchoPage');
  }

  goIftttPage() {
    this.navCtrl.push('IftttPage');
  }

  goGoogleHomePage() {
    this.navCtrl.push('GoogleHomePage');
  }

  goMyAccountPage() {
    this.navCtrl.push('MyAccountPage');
  }

  logout() {
    this.appTasks.logoutTask()
      .then(() => {
        this.viewStateService.clearAll();
        this.goHomePage();
      });
  }
}
