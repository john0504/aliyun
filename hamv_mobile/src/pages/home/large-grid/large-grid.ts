import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  Platform,
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { StateStore } from 'app-engine';

import { ThemeService } from '../../../providers/theme-service';
import { HomePageBase } from '../home-page-base';
import { GridGroupItemComponent } from "../../../components/grid-group-item/grid-group-item";
import { GridDeviceItemComponent } from '../../../components/grid-device-item/grid-device-item';

@IonicPage()
@Component({
  selector: 'page-large-grid',
  templateUrl: 'large-grid.html'
})
export class LargeGridPage extends HomePageBase {
  constructor(
    navCtrl: NavController,
    platform: Platform,
    stateStore: StateStore,
    translate: TranslateService,
    storage: Storage,
    themeService: ThemeService,
  ) {
    super(navCtrl, platform, stateStore, translate, storage, themeService);

    this.deviceComponent = GridDeviceItemComponent;
    this.groupComponent = GridGroupItemComponent;
  }
}
