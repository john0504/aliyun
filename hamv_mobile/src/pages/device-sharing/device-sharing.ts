import { Component } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from '@ngx-translate/core';

import { AppTasks, StateStore, User } from 'app-engine';
import {
  AlertController,
  IonicPage,
  NavParams,
  ViewController,
} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { debounceImmediate } from '../../app/app.extends';
import { PopupService } from '../../providers/popup-service';
import { ThemeService } from '../../providers/theme-service';

@IonicPage()
@Component({
  selector: 'page-device-sharing',
  templateUrl: 'device-sharing.html'
})
export class DeviceSharingPage {

  private subs: Array<Subscription>;
  private devices$: Observable<any>;

  deviceSn: string;
  deviceName: string;
  familyName: string;
  guestList: Array<User>;

  constructor(
    private alertCtrl: AlertController,
    private appTasks: AppTasks,
    private stateStore: StateStore,
    private popupService: PopupService,
    private socialSharing: SocialSharing,
    private translate: TranslateService,
    private themeService: ThemeService,
    public params: NavParams,
    public viewCtrl: ViewController,
  ) {
    this.subs = [];
    this.devices$ = this.stateStore.devices$;
  }

  ionViewDidLoad() {
    this.deviceSn = this.params.get('deviceSn');
    if (!this.deviceSn) {
      this.viewCtrl.dismiss();
      return;
    }
    this.appTasks.wsRequestGetTask(this.deviceSn);
  }

  ionViewWillEnter() {
    this.subs.push(
      this.devices$
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

  addGuest() {
    if (this.guestList && this.guestList.length < 10) {
      let p = this.appTasks.wsRequestGetSharingTokenTask(this.deviceSn, {
        role: 'guest',
      })
        .then((data) => {
          let message = this.translate.instant('DEVICE_SHARING.ADD_GUEST_MSG', { familyName: this.familyName, url: data.url });
          let subject = this.translate.instant('DEVICE_SHARING.ADD_GUEST_SUBJECT', { familyName: this.familyName });
          this.socialSharing.share(message, subject);
        });

      const addingNew = this.translate.instant('DEVICE_SHARING.ADDING_NEW_GUEST');
      p = this.popupService.loadingPopup(p, {
        content: addingNew,
      });
      const issueHappenedMsg = this.translate.instant('DEVICE_SHARING.ISSUE_HAPPENED_MSG');
      p = this.popupService.toastPopup(p, null, {
        message: issueHappenedMsg,
        duration: 3000,
      });
    } else {
      this.showMaximumWarning();
    }
  }

  private showMaximumWarning() {
    const alertTitle = this.translate.instant('DEVICE_SHARING.LIMIT_REACHED_TITLE');
    const alertMsg = this.translate.instant('DEVICE_SHARING.LIMIT_REACHED_MSG');
    const alertOK = this.translate.instant('DEVICE_SHARING.OK');
    const alert = this.alertCtrl.create({
      title: alertTitle,
      message: alertMsg,
      buttons: [alertOK],
    });

    alert.present();
  }

  processValues(devices) {
    let device = devices[this.deviceSn];
    if (device) {
      this.deviceName = device.properties && device.properties['displayName'];
      this.familyName = this.themeService.productName;
      this.guestList = device.users.filter(user => user.role !== 'owner');
    } else {
      this.viewCtrl.dismiss();
    }
  }

  removeGuestConfirm(guest) {
    const alertTitle = this.translate.instant('DEVICE_SHARING.DELETE_CONFIRM_TITLE', { email: guest.email });
    const alertCancel = this.translate.instant('DEVICE_SHARING.CANCEL');
    const alertDelete = this.translate.instant('DEVICE_SHARING.DELETE');
    const alert = this.alertCtrl.create({
      title: alertTitle,
      buttons: [
        {
          text: alertCancel,
          role: 'cancel',
        },
        {
          text: alertDelete,
          handler: () => this.removeGuest(guest),
        }
      ],
    });
    alert.present();
  }

  private removeGuest(guest) {
    this.appTasks.wsRequestRemoveUserTask(this.deviceSn, guest.email);
  }
}
