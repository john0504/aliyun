import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from 'ionic-angular';
import {
  StateStore,
  Schedule
} from 'app-engine';
import {
  Subscription,
  Observable,
} from 'rxjs';

import { debounceImmediate } from '../../app/app.extends';

import { appConfig } from '../../app/app.config';
import { PopupService } from '../../providers/popup-service';
import { CalendarService } from '../../providers/calendar-service';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import { ScheduleCoreInjector } from '../../item-models/schedule/schedule-core-injector';
import { DeviceCore } from '../../item-models/device/device-core';
import { TzScheduleCore } from '../../item-models/schedule/schedule-core';

@IonicPage()
@Component({
  selector: 'page-schedule-list',
  templateUrl: 'schedule-list.html'
})
export class ScheduleListPage {

  private subs: Array<Subscription>;
  private devices$: Observable<any>;

  deviceCore: DeviceCore;
  deviceSn: string;
  scheduleList: Array<any>;

  constructor(
    private alertCtrl: AlertController,
    private calenderService: CalendarService,
    private dcInjector: DeviceCoreInjector,
    private popupService: PopupService,
    private stateStore: StateStore,
    private scheduleInjector: ScheduleCoreInjector,
    private translate: TranslateService,
    public navCtrl: NavController,
    public params: NavParams,
    public viewCtrl: ViewController,
  ) {
    this.deviceSn = params.get('deviceSn');
    this.subs = [];
    this.scheduleList = [];
    this.devices$ = this.stateStore.devices$;
    this.deviceCore = this.dcInjector.create();
  }

  ionViewWillEnter() {
    this.subs.push(
      this.devices$
        .pipe(debounceImmediate(500))
        .subscribe(devices => this.updateUi(devices))
    );
  }

  private updateUi(devices) {
    this.scheduleList.length = 0;
    if (devices[this.deviceSn]) {
      const device = devices[this.deviceSn];
      this.dcInjector.bind(this.deviceCore, device);
      this.calenderService
        .checkCalendar(this.deviceSn, this.deviceCore.calendar)
        .toPromise();
      this.deviceCore.calendar
        .forEach((schedule: Schedule) => {
          const scheduleCore = this.scheduleInjector.fromUtcToTzSchedule(schedule);
          const scheduleItem = {
            core: scheduleCore,
            isActive: scheduleCore.active,
          };
          this.scheduleList.push(scheduleItem);
        });
    } else {
      this.viewCtrl.dismiss();
    }
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  addSchedule() {
    if (this.scheduleList.length >= appConfig.app.schedule.max) {
      const alert = this.alertCtrl.create({
        title: this.translate.instant('SCHEDULE_LIST.LIMIT_REACHED_TITLE'),
        subTitle: this.translate.instant('SCHEDULE_LIST.LIMIT_REACHED_MSG', { maxSchedules: appConfig.app.schedule.max }),
        buttons: [{ text: this.translate.instant('SCHEDULE_LIST.OK') }],
      });
      alert.present();
    } else {
      this.navCtrl.push('ScheduleEditPage', {
        deviceSn: this.deviceSn,
        index: -1,
      });
    }
  }

  scheduleSelected(index: number) {
    this.navCtrl.push('ScheduleEditPage', {
      deviceSn: this.deviceSn,
      index: index,
    });
  }

  scheduleActive(scheduleItem, index) {
    const scheduleCore: TzScheduleCore = scheduleItem.core;
    const shouldPopupShows =
      this.deviceCore.isAvailable &&
      scheduleItem.isActive &&
      scheduleCore.isOverlapping;
    scheduleCore.schedule.active = scheduleItem.isActive ? 1 : 0;
    if (shouldPopupShows) {
      this.showExecutePopup(scheduleCore, index);
    } else {
      this.saveCalendar(scheduleCore, index, false);
    }
  }

  private showExecutePopup(scheduleCore: TzScheduleCore, index: number) {
    this.alertCtrl
      .create({
        title: this.translate.instant('SCHEDULE_LIST.EXECUTE_POPUP_TITLE'),
        message: this.translate.instant('SCHEDULE_LIST.EXECUTE_POPUP_MSG'),
        buttons: [
          {
            handler: () => this.saveCalendar(scheduleCore, index, false),
            text: this.translate.instant('SCHEDULE_LIST.LATER'),
          },
          {
            handler: () => this.saveCalendar(scheduleCore, index, true),
            text: this.translate.instant('SCHEDULE_LIST.START_NOW'),
          },
        ]
      })
      .present();
  }

  private saveCalendar(scheduleCore: TzScheduleCore, index: number, executeNow: boolean) {
    if (executeNow) {
      this.deviceCore.sendCommands(scheduleCore.esh);
    }

    let p = this.calenderService
      .saveCalendar({
        deviceSn: this.deviceSn,
        calendar: this.deviceCore.calendar,
        schedule: scheduleCore.toUtcSchedule(executeNow),
        index
      })
      .toPromise();

    this.popupService.toastPopup(p, null, {
      message: this.translate.instant('SCHEDULE_LIST.SET_FAILED'),
      duration: 3000
    });
  }
}
