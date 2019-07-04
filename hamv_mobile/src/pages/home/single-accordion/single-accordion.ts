import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { StateStore } from 'app-engine';

import { ThemeService } from '../../../providers/theme-service';
import { HomePageBase } from '../home-page-base';
import { ListGroupItemComponent } from '../../../components/list-group-item/list-group-item';
import { SingleAccordionContainerComponent } from '../../../components/single-accordion-container/single-accordion-container';

@IonicPage()
@Component({
  selector: 'page-single-accordion',
  templateUrl: 'single-accordion.html'
})
export class SingleAccordionPage extends HomePageBase {

  constructor(
    navCtrl: NavController,
    platform: Platform,
    stateStore: StateStore,
    translate: TranslateService,
    storage: Storage,
    themeService: ThemeService,
  ) {
    super(navCtrl, platform, stateStore, translate, storage, themeService);

    this.groupComponent = ListGroupItemComponent;
    this.deviceComponent = SingleAccordionContainerComponent;
  }
}
