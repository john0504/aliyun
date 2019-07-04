import { Directive, HostListener } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GoAddingDeviceService } from '../../providers/go-adding-device-service';

@Directive({
  selector: '[go-adding-device]',
})
export class GoAddingDeviceDirective {

  constructor(
    private goService: GoAddingDeviceService,
    private navCtrl: NavController,
  ) {
  }

  @HostListener('click') onClick() {
    this.goService.goAddingDevicePage(this.navCtrl);
  }
}
