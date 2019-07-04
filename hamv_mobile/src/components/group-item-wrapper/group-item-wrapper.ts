import { Component, Input } from '@angular/core';

@Component({
  selector: 'group-item-wrapper',
  templateUrl: 'group-item-wrapper.html'
})
export class GroupItemWrapperComponent {
  _data: any;
  _groupComponent;
  deviceComponent;
  extraData;
  group: string;

  constructor(
  ) {
  }

  @Input()
  set groupComponent(val: any) {
    if (val) {
      this._groupComponent = val;
    }
  }

  @Input()
  set data(val: any) {
    if (val) {
      this._data = {
        deviceComponent: val.deviceComponent,
        extraData: val.extraData,
        group: val.group
      };
    }
  }
}
