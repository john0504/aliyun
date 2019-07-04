import { Component, Input } from '@angular/core';

import { Group } from 'app-engine';

@Component({
  selector: 'popit-group-control',
  templateUrl: 'popit-group-control.html'
})
export class PopitGroupControlComponent {
  _group: Group;
  _expand: Boolean;
  _showDevicesInGroupString: Boolean;

  constructor(
  ) {
    this._expand = false;
    this._showDevicesInGroupString = false;
  }

  @Input()
  set group(val: Group) {
    this._group = val;
  }

  get group(): Group {
    return this._group;
  }

  @Input()
  set expand(val: boolean) {
    if (val) {
      this._expand = true;
    }
  }

  @Input()
  set showDevicesInGroupString(val: boolean) {
    if (val) {
      this._showDevicesInGroupString = true;
    }
  }
}
