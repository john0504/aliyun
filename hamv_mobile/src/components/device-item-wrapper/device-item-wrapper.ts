import { Component, Input } from '@angular/core';

@Component({
  selector: 'device-item-wrapper',
  templateUrl: 'device-item-wrapper.html',
})
export class DeviceItemWrapperComponent {
  _data: any;
  _deviceComponent;

  constructor(
  ) {
  }

  @Input()
  set deviceComponent(val: any) {
    if(val) {
      this._deviceComponent = val;
    }
  }

  @Input()
  set data(val: any) {
    if (val) {
      this._data = {
        deviceSn: val.deviceSn
      };
    }
  }
}
