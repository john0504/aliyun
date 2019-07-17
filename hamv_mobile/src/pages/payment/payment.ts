import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
} from 'ionic-angular';

import { ViewStateService } from '../../providers/view-state-service';

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html'
})
export class PaymentPage {

  serial: string = "";

  constructor(
    public navCtrl: NavController,
    public viewStateService: ViewStateService,
  ) {

  }  

  onQRcode() {
    this.navCtrl.push('ScanPage', { callback: this.getMachineCodeCallback });
  }

  goPayment() {    
    this.navCtrl.push('DevicePaymentPage', { serial: this.serial });
  }

  getMachineCodeCallback = (params) => {
    return new Promise(() => {
      if (params) {
        this.serial = params;
      }
    });
  }
}
