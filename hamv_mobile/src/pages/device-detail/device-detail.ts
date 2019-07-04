import {
  Component,
  HostListener,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  StateStore,
  Account,
  AppTasks
} from 'app-engine';
import {
  Loading,
  IonicPage,
  NavParams,
  ViewController,
  NavController,
  ActionSheetController,
  AlertController,
} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { first } from 'rxjs/operators';

import { debounceImmediate } from '../../app/app.extends';
import { DeviceCore } from '../../item-models/device/device-core';
import { DeviceCoreInjector } from '../../item-models/device/device-core-injector';
import { PopupService } from '../../providers/popup-service';

@IonicPage()
@Component({
  selector: 'page-device-detail',
  templateUrl: 'device-detail.html'
})
export class DeviceDetailPage {

  private subs: Array<Subscription>;
  private account$: Observable<any>;
  private devices$: Observable<any>;

  deviceCore: DeviceCore;
  deviceSn: string;
  account: Account;
  loading: Loading;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private dcInjector: DeviceCoreInjector,
    private stateStore: StateStore,
    private translate: TranslateService,
    public navCtrl: NavController,
    public params: NavParams,
    public viewCtrl: ViewController,
    private appTasks: AppTasks,
    private popupService: PopupService,
  ) {
    this.deviceSn = this.params.get('deviceSn');
    this.subs = [];
    this.account$ = this.stateStore.account$;
    this.devices$ = this.stateStore.devices$;
    this.deviceCore = this.dcInjector.create();
  }

  @HostListener('window:model-loaded', ['$event'])
  reload(event) {
    this.deviceCore && this.deviceCore.selfUpdate();
  }

  ionViewDidLoad() {
    this.account$.pipe(first()).subscribe(account => this.account = account);
    this.loading = this.popupService.makeLoading({
      content: this.translate.instant('DEVICE_DETAIL.GET_RANGE')
    });
  }

  ionViewWillEnter() {
    this.subs.push(
      this.devices$
        .pipe(debounceImmediate(500))
        .subscribe(devices => this.processValues(devices))
    );
  }

  // private processValues(devices) {
  //   if (this.validateDevices(devices)) {
  //     const device = devices[this.deviceSn];
  //     this.deviceCore = this.dcInjector.bind(this.deviceCore, device);
  //     this.deviceCore.selfUpdate();
  //   } else {
  //     this.viewCtrl.dismiss();
  //   }
  // }

  private processValues(devices) {
    if (this.validateDevices(devices)) {
      const device = devices[this.deviceSn];
      if (device.profile.esh.model) {
        this.appTasks.getDeviceModelInfo(device.profile.esh.model).then((result: any) => {
          this.loading.dismiss();
          this.deviceCore = this.dcInjector.bind(this.deviceCore, device);
          this.deviceCore.status.sn = this.deviceSn;
          this.deviceCore.status.range = result;
          this.deviceCore.selfUpdate();
        }).catch(() => {
          this.loading.dismiss();
          this.deviceCore = this.dcInjector.bind(this.deviceCore, device);
          this.deviceCore.status.sn = this.deviceSn;
          this.deviceCore.selfUpdate();
        });
      } else {
        this.loading.dismiss();
        this.viewCtrl.dismiss();
      }
    } else {
      this.viewCtrl.dismiss();
    }
  }

  private validateDevices(devices) {
    return this.deviceSn && devices && devices[this.deviceSn];
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  presentActions() {
    const buttons: Array<any> = [];

    buttons.push({
      text: this.translate.instant('DEVICE_DETAIL.SCHEDULES'),
      handler: () => this.openSchedules()
    });
    buttons.push({
      text: this.translate.instant('DEVICE_DETAIL.SETTINGS'),
      handler: () => this.openSettings()
    });
    if (this.deviceCore.isOwner(this.account.account)) {
      buttons.push({
        text: this.translate.instant('DEVICE_DETAIL.SHARE'),
        handler: () => this.openSharing()
      });
    }
    if (this.deviceCore.hasHistoryComponents) {
      buttons.push({
        text: this.translate.instant('DEVICE_DETAIL.HISTORY'),
        handler: () => this.navCtrl.push('DeviceHistoryPage', { deviceSn: this.deviceSn })
      });
    }
    buttons.push({
      text: this.translate.instant('DEVICE_DETAIL.CANCEL'),
      role: 'cancel',
    });

    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  openSchedules() {
    this.navCtrl.push('ScheduleListPage', { deviceSn: this.deviceSn });
  }

  openSettings() {
    this.navCtrl.push('DeviceSettingsPage', { deviceSn: this.deviceSn });
  }

  openSharing() {
    this.navCtrl.push('DeviceSharingPage', { deviceSn: this.deviceSn });
  }

  showInfo() {
    if (!this.deviceCore.device) return;
    if (this.deviceCore.isUpdating) {
      const alertTitle = this.translate.instant('DEVICE_DETAIL.UPDATING_MSG');
      const alertOK = this.translate.instant('DEVICE_DETAIL.OK');
      const alert = this.alertCtrl.create({
        title: alertTitle,
        buttons: [{ text: alertOK }],
      });
      alert.present();
    } else if (!this.deviceCore.isConnected) {
      const alertTitle = this.translate.instant('DEVICE_DETAIL.OFFLINE_MSG');
      const alertOK = this.translate.instant('DEVICE_DETAIL.OK');
      const alert = this.alertCtrl.create({
        title: alertTitle,
        buttons: [{ text: alertOK }],
      });
      alert.present();
    }
  }

  isVisable(m) {
    let isVisable = true;
    m.models.forEach(element => {
      if (this.deviceCore.status[element.key] == null) {
        isVisable = false;
      }
    });
    return isVisable;
  }
}
