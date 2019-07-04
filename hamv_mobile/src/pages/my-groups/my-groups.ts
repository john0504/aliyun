import { Component, Renderer2, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ThemeService } from '../../providers/theme-service';

import {
  ActionSheetController,
  AlertController,
  Content,
  IonicPage,
} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { first } from 'rxjs/operators';
import cloneDeep from 'lodash/cloneDeep';
import autoScroll from 'dom-autoscroller';

import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { AppTasks, Group, StateStore } from 'app-engine';
import { debounceImmediate } from '../../app/app.extends';
import { PopupService } from '../../providers/popup-service';
import { appConfig } from './../../app/app.config';

@IonicPage()
@Component({
  selector: 'page-my-groups',
  templateUrl: 'my-groups.html',
})
export class MyGroupsPage {

  @ViewChild(Content) content: Content;

  private subs: Array<Subscription>;
  private deviceDisplayList$: Observable<any>;
  private groupDisplayList$: Observable<any>;
  private groups$: Observable<any>;
  private userData$: Observable<any>;

  containerName: string = 'deviceDndContainer';
  scroll: any;
  last: any;

  currentDisplayOrder;
  allGroups;

  groups: Array<any> = [];
  unGroup: Array<string>;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private appTasks: AppTasks,
    private dragulaService: DragulaService,
    private stateStore: StateStore,
    private popupService: PopupService,
    private renderer2: Renderer2,
    private translate: TranslateService,
    public themeService: ThemeService,
  ) {
    this.subs = [];
    this.deviceDisplayList$ = this.stateStore.deviceDisplayList$;
    this.groupDisplayList$ = this.stateStore.groupDisplayList$;
    this.groups$ = this.stateStore.groups$;
    this.userData$ = this.stateStore.userData$;

    this.unGroup = [];

    this.dragulaService.setOptions(this.containerName, {
      moves: (el, container, handle) => {
        return handle.classList.contains('device-action');
      },
      direction: 'vertical',
    });
  }

  ionViewDidLoad() {
    const drake = this.dragulaService.find(this.containerName).drake;
    this.scroll = autoScroll(
      [this.content.getScrollElement()],
      {
        margin: 70,
        maxSpeed: 10,
        scrollWhenOutside: true,
        autoScroll: function () {
          return this.down && drake.dragging;
        }
      });
  }

  ionViewDidEnter() {
    this.subs.push(
      combineLatest(this.deviceDisplayList$, this.groupDisplayList$, this.groups$, this.userData$)
        .pipe(debounceImmediate(500))
        .subscribe(latestValues => this.processValues(latestValues))
    );
    this.subs.push(
      this.dragulaService.dropModel
        .subscribe(() => this.changeDeviceDisplayOrder())
    );
    this.subs.push(
      this.dragulaService.over
        .subscribe(value => this.onOver(value))
    );
    this.subs.push(
      this.dragulaService.cancel
        .subscribe(() => this.onCancel())
    );
    this.subs.push(
      this.dragulaService.drop
        .subscribe(() => this.onDrop())
    );
  }

  ionViewWillLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  ionViewWillUnload() {
    this.dragulaService.destroy(this.containerName);
    if (this.scroll) this.scroll.destroy();
  }

  private processValues(latestValues) {
    const drake = this.dragulaService.find(this.containerName).drake;
    if (drake.dragging) return;

    const [deviceDisplayList, groupDisplayList, groups, userData] = latestValues;
    let { groupDisplayOrder } = userData;
    const newOrder = this.checkDisplayOrder(groupDisplayList, groupDisplayOrder);

    if (!this.isEqual(newOrder, groupDisplayOrder)) {
      this.appTasks.wsRequestSetUserDataTask({ groupDisplayOrder: newOrder });
    }
    this.groups = this.generateGroups(groups, newOrder);
    this.unGroup = this.modifyUngroup(deviceDisplayList, groups, newOrder);
    this.currentDisplayOrder = newOrder;
    this.allGroups = groups;

    this.removeDuplicatedGroups();
  }

  private generateGroups(groups, groupDisplayOrder = []): Array<any> {
    const gArray = [];
    groupDisplayOrder.forEach(groupId => {
      const g = cloneDeep(groups[groupId]);
      gArray.push(g);
    });
    return gArray;
  }

  private modifyUngroup(deviceDisplayList, groups, groupDisplayOrder = []) {
    const unGroup = [];
    deviceDisplayList.forEach(deviceSn => {
      const found = groupDisplayOrder.some(groupId => {
        const g = groups[groupId];
        return g && g.devices && g.devices.some(dSn => {
          return dSn === deviceSn;
        });
      });
      if (!found) {
        unGroup.push(deviceSn);
      }
    });
    return unGroup;
  }

  private removeDuplicatedGroups() {
    let allDevices = {};
    this.groups.forEach(group => {
      const newDevices = group.devices.filter((device) => {
        const result = !allDevices[device];
        allDevices[device] = true;
        return result;
      });

      if (group.devices.length !== newDevices.length) {
        group.devices = newDevices;
        this.appTasks.wsRequestSetGroupTask(group);
      }
    });
  }

  private onOver(args) {
    const container = args[2];
    if (this.last) {
      this.renderer2.removeClass(this.last, 'finger-over');
      if (this.last.children.length - 1 > 0) {
        this.renderer2.addClass(this.last, 'has-child');
      } else {
        this.renderer2.removeClass(this.last, 'has-child');
      }
    }
    this.renderer2.addClass(container, 'finger-over');
    this.renderer2.addClass(container, 'has-child');
    this.last = container;
  }

  private onCancel() {
    if (this.last) {
      this.renderer2.removeClass(this.last, 'finger-over');
    }
    this.last = null;
  }

  private onDrop() {
    if (this.last) {
      this.renderer2.removeClass(this.last, 'finger-over');
    }
    this.last = null;
  }

  private checkDisplayOrder(groupDisplayList = [], groupDisplayOrder = []) {
    if (groupDisplayList.length === 0) {
      return [];
    }
    if (groupDisplayOrder.length === 0) {
      return [...groupDisplayList];
    }

    const newOrder = [];
    groupDisplayOrder.forEach(groupId => {
      const found = groupDisplayList.some(gId => gId === groupId);
      if (found) {
        newOrder.push(groupId);
      }
    });
    groupDisplayList.forEach(groupId => {
      const found = newOrder.some(gId => gId === groupId);
      if (!found) {
        newOrder.push(groupId);
      }
    });

    return newOrder;
  }

  private isEqual(a, b): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  moveGroupUp(groupItem) {
    const gIndex = this.groups.findIndex(gItem => gItem.name === groupItem.name);
    if (gIndex > 0) {
      const temp = this.groups[gIndex - 1];
      this.groups[gIndex] = temp;
      this.groups[gIndex - 1] = groupItem;
      this.changeGroupDisplayOrder();
    }
  }

  moveGroupDown(groupItem) {
    const gIndex = this.groups.findIndex(gItem => gItem.name === groupItem.name);
    if (gIndex >= 0 && gIndex < this.groups.length - 1) {
      const temp = this.groups[gIndex + 1];
      this.groups[gIndex] = temp;
      this.groups[gIndex + 1] = groupItem;
      this.changeGroupDisplayOrder();
    }
  }

  private changeGroupDisplayOrder() {
    let currentDisplayOrder = [];
    this.groups.forEach(groupItem => currentDisplayOrder.push(groupItem.name));
    if (!this.isEqual(currentDisplayOrder, this.currentDisplayOrder)) {
      const p = this.appTasks.wsRequestSetUserDataTask({ groupDisplayOrder: currentDisplayOrder });
      this.popupService.loadingPopup(p, {
        content: this.translate.instant('MY_GROUPS.SAVING'),
      });
      this.popupService.toastPopup(p, null, {
        message: this.translate.instant('MY_GROUPS.ISSUE_HAPPENED_MSG'),
        duration: 3000
      });
    }
  }

  private changeDeviceDisplayOrder() {
    if (this.groups.some(({ devices }) => devices.length > appConfig.app.group.devices)) {
      const alertTitle = this.translate.instant('MY_GROUPS.DEVICE_LIMIT_REACHED_TITLE');
      const alertMsg = this.translate.instant('MY_GROUPS.DEVICE_LIMIT_REACHED_MSG', { maxDevices: appConfig.app.group.devices });
      const alertOK = this.translate.instant('MY_GROUPS.OK');
      const alert = this.alertCtrl.create({
        title: alertTitle,
        message: alertMsg,
        buttons: [alertOK],
      });
      alert.present();

      this.appTasks.refreshGroupsTask(this.groups);
      return;
    }

    const pArray = [];
    this.groups.forEach((groupItem) => {
      const group = cloneDeep(this.allGroups[groupItem.name]);
      const isEqual = this.isEqual(groupItem.devices, group ? group.devices : []);
      if (!isEqual) {
        group.devices = groupItem.devices;
        pArray.push(this.appTasks.wsRequestSetGroupTask(group));
      }
    });
    if (pArray.length > 0) {
      const p = Promise.all(pArray);
      this.popupService.loadingPopup(p, {
        content: this.translate.instant('MY_GROUPS.SAVING')
      });

      this.popupService.toastPopup(p, null, {
        message: this.translate.instant('MY_GROUPS.ISSUE_HAPPENED_MSG'),
        duration: 3000
      });
    }
  }

  addGroup() {
    this.groupDisplayList$
      .pipe(first())
      .subscribe(list => {
        if (list && list.length < appConfig.app.group.max) {
          const newGroup: Group = {
            name: 'group-' + Date.now(),
            devices: [],
            properties: {
              displayName: this.translate.instant('MY_GROUPS.MY_NEW_GROUP'),
            },
          };

          const p = this.appTasks.wsRequestSetGroupTask(newGroup);
          this.popupService.loadingPopup(p, {
            content: this.translate.instant('MY_GROUPS.ADDING_NEW_GROUP')
          });
          this.popupService.toastPopup(p, null, {
            message: this.translate.instant('MY_GROUPS.ISSUE_HAPPENED_MSG'),
            duration: 3000
          });
        } else {
          this.showMaximumWarning();
        }
      });
  }

  private showMaximumWarning() {
    const alertTitle = this.translate.instant('MY_GROUPS.GROUP_LIMIT_REACHED_TITLE');
    const alertMsg = this.translate.instant('MY_GROUPS.GROUP_LIMIT_REACHED_MSG', { maxGroups: appConfig.app.group.max });
    const alertOK = this.translate.instant('MY_GROUPS.OK');
    const alert = this.alertCtrl.create({
      title: alertTitle,
      message: alertMsg,
      buttons: [alertOK],
    });

    alert.present();
  }

  presentGroupActions(groupItem) {
    let buttons: Array<any> = [];

    buttons.push({
      text: this.translate.instant('MY_GROUPS.RENAME_GROUP'),
      handler: () => this.presentRenameAlert(groupItem)
    });
    const gIndex = this.groups.findIndex(gItem => gItem.name === groupItem.name);
    if (gIndex > 0) {
      buttons.push({
        text: this.translate.instant('MY_GROUPS.MOVE_UP_ONE'),
        handler: () => this.moveGroupUp(groupItem)
      });
    }
    if (gIndex >= 0 && gIndex < this.groups.length - 1) {
      buttons.push({
        text: this.translate.instant('MY_GROUPS.MOVE_DOWN_ONE'),
        handler: () => this.moveGroupDown(groupItem)
      });
    }
    buttons.push({
      text: this.translate.instant('MY_GROUPS.DELETE_GROUP'),
      role: 'destructive',
      handler: () => {
        this.deleteGroupConfirm(groupItem);
      }
    });
    buttons.push({
      text: this.translate.instant('MY_GROUPS.CANCEL'),
      role: 'cancel',
    });

    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  deleteGroupConfirm(groupItem) {
    const alert = this.alertCtrl.create({
      title: this.translate.instant('MY_GROUPS.DELETE_GROUP_TITLE', { displayName: groupItem.properties.displayName }),
      buttons: [
        {
          text: this.translate.instant('MY_GROUPS.CANCEL'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('MY_GROUPS.DELETE'),
          handler: () => {
            const p = this.appTasks.wsRequestDeleteGroupTask(groupItem.name);
            this.popupService.loadingPopup(p, {
              content: this.translate.instant('MY_GROUPS.DELETING')
            });
            this.popupService.toastPopup(p, null, {
              message: this.translate.instant('MY_GROUPS.ISSUE_HAPPENED_MSG'),
              duration: 3000
            });
          }
        }
      ],
    });

    alert.present();
  }

  presentRenameAlert(groupItem) {
    const alert = this.alertCtrl.create({
      message: this.translate.instant('MY_GROUPS.ENTER_NEW_GROUP_NAME'),
      inputs: [
        {
          name: 'groupName',
          placeholder: this.translate.instant('MY_GROUPS.NEW_GROUP_NAME'),
          value: groupItem.properties.displayName,
        }
      ],
      buttons: [
        {
          text: this.translate.instant('MY_GROUPS.CANCEL'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('MY_GROUPS.SAVE'),
          handler: ({ groupName }) => {
            groupName = groupName && groupName.trim();
            if (groupName && groupName !== groupItem.properties.displayName) {
              groupItem.properties.displayName = groupName;
              const p = this.appTasks.wsRequestSetGroupTask(groupItem);
              this.popupService.toastPopup(p, null, {
                message: this.translate.instant('MY_GROUPS.ISSUE_HAPPENED_MSG'),
                duration: 3000
              });
            }
          }
        }
      ]
    });

    alert.present();
  }
}
