import { Injectable } from '@angular/core';
import { NavController } from 'ionic-angular';

@Injectable()
export class GoAddingDeviceService {

  public goAddingDevicePage(navCtrl: NavController) {
    return navCtrl.push('PreDeviceCreatePage');
  }
}
