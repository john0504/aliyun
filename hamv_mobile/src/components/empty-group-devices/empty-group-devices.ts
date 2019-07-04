import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ThemeService } from '../../providers/theme-service';

@Component({
  selector: 'empty-group-devices',
  templateUrl: 'empty-group-devices.html'
})
export class EmptyGroupDevicesComponent {
  constructor(
    public navCtrl: NavController,
    public themeService: ThemeService,
  ) {
  }

  goToGroupsPage() {
    this.navCtrl.setRoot('MyGroupsPage');
  }
}
