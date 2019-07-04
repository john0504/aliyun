import { Component, Input } from '@angular/core';

import { Group } from 'app-engine';
import { NavController } from "ionic-angular";

@Component({
  selector: 'button-group-control',
  templateUrl: 'button-group-control.html'
})
export class ButtonGroupControlComponent {
  _group: Group;

  constructor(
    private navCtrl: NavController,
  ) {
  }

  @Input()
  set group(val: Group) {
    this._group = val;
  }

  get group(): Group {
    return this._group;
  }

  goGroupDetail({ name }) {
    this.navCtrl.push('GroupDetailPage', { groupId: name });
  }
}
