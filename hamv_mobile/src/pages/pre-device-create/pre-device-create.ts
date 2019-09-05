import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, ViewController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { ThemeService } from '../../providers/theme-service';
import { CheckNetworkService } from '../../providers/check-network';

@IonicPage()
@Component({
  selector: 'page-pre-device-create',
  templateUrl: 'pre-device-create.html'
})
export class PreDeviceCreatePage {

  constructor(
    public alertCtrl: AlertController,
    public appVersion: AppVersion,
    public checkNetworkService: CheckNetworkService,
    public nativeSettings: OpenNativeSettings,
    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
  ) {
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
  }

  ionViewWillUnload() {
    this.checkNetworkService.resume();
  }

  onNext() {
    this.navCtrl.push('DeviceCreatePage')
      .then(() => this.closePage());
  }

  closePage() {
    this.viewCtrl.dismiss();
  }
}
