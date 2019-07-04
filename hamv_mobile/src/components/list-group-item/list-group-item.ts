import { Component, Input } from '@angular/core';

import { NavController } from 'ionic-angular';

import { ThemeService } from '../../providers/theme-service';

@Component({
  selector: 'list-group-item',
  templateUrl: 'list-group-item.html'
})
export class ListGroupItemComponent {
  _deviceComponent: any;
  _group: any;
  devices: Array<any>;

  constructor(
    public navCtrl: NavController,
    public themeService: ThemeService,
  ) {
    this.devices = [];
  }

  @Input()
  set group(val: any) {
    if (val) {
      this._group = val;
      this.devices = val && val.devices ? val.devices : [];
    }
  }

  get group(): any {
    return this._group;
  }

  @Input()
  set deviceComponent(val: any) {
    if (val) {
      this._deviceComponent = val;
    }
  }

  goToGroupsPage() {
    this.navCtrl.setRoot('MyGroupsPage');
  }
}
