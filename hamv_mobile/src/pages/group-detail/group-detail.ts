import { combineLatest } from 'rxjs/observable/combineLatest';
import { Component, HostListener } from '@angular/core';
import { IonicPage, NavParams, ViewController } from "ionic-angular";
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { Group, StateStore } from 'app-engine';

import { debounceImmediate } from '../../app/app.extends';
import { GroupCoreInjector } from "../../item-models/group/group-core-injector";
import { GroupCore } from "../../item-models/group/group-core";
import { PopupService } from '../../providers/popup-service';
@IonicPage()
@Component({
  selector: 'group-detail',
  templateUrl: 'group-detail.html'
})
export class GroupDetailPage {
  private subs: Array<Subscription>;
  private devices$: Observable<any>;
  private groups$: Observable<any>;

  group: Group;
  groupId: string;
  groupCore: GroupCore;

  constructor(
    private groupInjector: GroupCoreInjector,
    private navParams: NavParams,
    private popupService: PopupService,
    private stateStore: StateStore,
    private translate: TranslateService,
    private viewCtrl: ViewController
  ) {
    this.groupId = this.navParams.get('groupId');
    this.subs = [];

    this.devices$ = this.stateStore.devices$;
    this.groups$ = this.stateStore.groups$;
    this.groupCore = this.groupInjector.create();
  }

  @HostListener('window:model-loaded', ['$event'])
  reload(event) {
    this.groupCore && this.groupCore.selfUpdate();
  }

  ionViewWillEnter() {
    this.subs.push(
      combineLatest(this.devices$, this.groups$)
        .pipe(debounceImmediate(500))
        .subscribe(latestValues => this.processValues(latestValues))
    );
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  private getAllDevicesGroup(devices = {}) {
    const allDevicesSn = [];
    if (Object.keys(devices).length > 0) {
      Object.keys(devices).forEach(deviceSn => allDevicesSn.push(deviceSn));
    }

    const allDevicesObj = {
      name: '__my_devices_group__',
      devices: allDevicesSn,
      properties: {
        displayName: 'All Devices'
      },
    };
    return allDevicesObj;
  }

  private processValues(latestValues) {
    const [ devices, groups ] = latestValues;
    let showError = false;

    if (this.groupId === '__my_devices_group__') {
      this.group = this.getAllDevicesGroup(devices);
    } else {
      this.group = groups[this.groupId];
    }

    if (this.group) {
      this.groupCore = this.groupInjector.bind(this.groupCore, this.group, devices);

      const hasMultipleDevices = this.group.devices && this.group.devices.length > 1;
      if (!hasMultipleDevices) {
        showError = true;
      }
    } else {
      showError = true;
    }

    if (showError) {
      this.viewCtrl.dismiss();
      this.showErrorMessage();
    }
  }

  private showErrorMessage() {
    this.popupService.makeToast({
      duration: 3000,
      message: this.translate.instant('GROUP_DETAIL.ERROR_MSG'),
      position: 'top'
    });
  }
}
