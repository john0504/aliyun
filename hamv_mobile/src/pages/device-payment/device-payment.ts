import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
} from 'ionic-angular';

import { ViewStateService } from '../../providers/view-state-service';
import { UtilsProvider } from '../../providers/utils-provider';

@IonicPage()
@Component({
  selector: 'page-device-payment',
  templateUrl: 'device-payment.html'
})
export class DevicePaymentPage {

  paymentCode: string = "";
  serial: string;

  constructor(
    public navCtrl: NavController,
    public viewStateService: ViewStateService,
    private utilsProvider: UtilsProvider,
    public params: NavParams,
  ) {
    this.serial = this.params.get('serial');

  }  

  onQRcode() {
    this.navCtrl.push('ScanPage', { callback: this.getPaymentCodeCallback });
  }

  gotoPay() {
    const url = 'http://www.cectco.com';
      this.utilsProvider.openLink(url);
  }

  getPaymentCodeCallback = (params) => {
    return new Promise(() => {
      if (params) {
        this.paymentCode = params;
      }
    });
  }
}
