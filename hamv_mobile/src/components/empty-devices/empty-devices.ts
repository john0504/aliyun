import { Component } from '@angular/core';

import { ThemeService } from '../../providers/theme-service';

@Component({
  selector: 'empty-devices',
  templateUrl: 'empty-devices.html'
})
export class EmptyDevicesComponent {
  constructor(
    public themeService: ThemeService,
  ) {
  }
}
