import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import {
  AppTasks,
  Logger,
} from 'app-engine';
// import mixpanel from 'mixpanel-browser';

import { ThemeService } from '../../providers/theme-service';
import { CheckNetworkService } from '../../providers/check-network';

@IonicPage()
@Component({
  selector: 'page-provision-done',
  templateUrl: 'provision-done.html'
})
export class ProvisionDonePage {

  private unregister;
  private deviceSn;
  newDeviceName: string;

  constructor(
    private appTasks: AppTasks,
    private platform: Platform,
    private translate: TranslateService,
    public checkNetworkService: CheckNetworkService,
    public params: NavParams,
    public navCtrl: NavController,
    public themeService: ThemeService,
  ) {
    this.deviceSn = this.params.get('deviceSn');
    Logger.log('deviceSn => ', this.deviceSn);
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
    // mixpanel.track('Page Viewed', { page: 'Provision Done' });
    this.platform.ready()
      .then(() => {
        this.unregister = this.platform.registerBackButtonAction(() => {
          Logger.log('Preventing users from pressing the hardware back button on the phone');
        }, 100);
      });
  }

  ionViewWillUnload() {
    this.checkNetworkService.resume();
    this.unregister && this.unregister();
  }

  onNext() {
    this.saveDevice()    
      .then(() => {
        this.navCtrl.pop();
      });
  }

  saveDevice() {
    const displayName = this.newDeviceName && this.newDeviceName.trim()
      ? this.newDeviceName.trim()
      : this.translate.instant('PROVISION_LOADING.MY_NEW_PRODUCT', { productName: this.themeService.productName });

      return this.appTasks.wsRequestSetPropertiesTask(this.deviceSn, { displayName });
  }
}
