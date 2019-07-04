import {
  Component,
  HostListener,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StateStore } from 'app-engine';
import {
  IonicPage,
  NavParams,
  ViewController,
} from 'ionic-angular';
import isEqual from 'lodash/isEqual';
import {
  Observable,
  Subscription,
} from 'rxjs';
import { first } from 'rxjs/operators';

import { DeviceCore } from '../../item-models/device/device-core';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import {
  ComponentModel,
  InformationModelService,
} from '../../modules/information-model';
import { ScrollableTabsOptions } from '../../components/scrollable-tabs/scrollable-tabs-options';

@IonicPage()
@Component({
  selector: 'page-device-history',
  templateUrl: 'device-history.html'
})
export class DeviceHistoryPage {
  private subs: Array<Subscription>;
  private devices$: Observable<any>;

  currentLayoutName: string;
  currentTab: number = 0;
  deviceCore: DeviceCore;
  deviceSn: string;
  ready: boolean = false;
  tabs: Array<ScrollableTabsOptions> = [];
  model: ComponentModel;

  constructor(
    private ims: InformationModelService,
    private dcInjector: DeviceCoreInjector,
    private stateStore: StateStore,
    private translate: TranslateService,
    public params: NavParams,
    public viewCtrl: ViewController,
  ) {
    this.deviceSn = this.params.get('deviceSn');
    this.subs = [];
    this.devices$ = this.stateStore.devices$;
    this.deviceCore = this.dcInjector.create();
  }

  @HostListener('window:model-loaded', ['$event'])
  reload(event) {
    this.deviceCore && this.deviceCore.selfUpdate();
  }

  ionViewWillEnter() {
    this.subs.push(
      this.devices$
        .pipe(first())
        .subscribe(devices => this.processValues(devices))
    );
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  private createTabs(im) {
    const layouts = im.chartLayout;
    const components = im.chartComponents;
    const tabs = layouts && layouts.main.map((key) => {
      let title = this.translate.instant('HOME.LOADING'); // placeholder
      const component = components[key];
      if (component && component.title) {
        title = this.translate.instant(component.title);
      }
      return ({ title });
    });

    return tabs;
  }

  private getIM(device) {
    return this.ims.getUIModel(device);
  }

  private processValues(devices) {
    if (this.validateDevices(devices)) {
      const device = devices[this.deviceSn];
      const im = this.getIM(device);
      const tabs = this.createTabs(im);

      this.ready = true;

      if (!isEqual(this.tabs, tabs)) {
        this.tabs = tabs;
      }

      const layouts = im.chartLayout;
      if (this.currentTab > Object.keys(layouts).length) {
        this.currentTab = 0;
      }
      this.selectHistory(this.currentTab);

      this.deviceCore = this.dcInjector.bind(this.deviceCore, device);
      this.deviceCore.selfUpdate();
      this.model = this.deviceCore.chartComponents[this.currentTab];
    } else {
      this.viewCtrl.dismiss();
    }
  }

  private selectHistory(tabIndex) {
    this.model = this.deviceCore.chartComponents[tabIndex];
  }

  private validateDevices(devices) {
    return this.deviceSn && devices && devices[this.deviceSn];
  }

  tabSelected(tab) {
    const tabIndex = tab.index;
    this.currentTab = tab.index;
    this.selectHistory(tabIndex);
  }
}
