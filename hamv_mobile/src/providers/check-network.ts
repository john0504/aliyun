import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
// import { AppEngine } from 'app-engine';
import { Subscription } from 'rxjs';

import { PopupService } from './popup-service';

@Injectable()
export class CheckNetworkService {

  private noNetworkToast;
  private isPaused: number = 0;
  private noNetwork: boolean = false;
  private subs: Array<Subscription> = [];

  constructor(
    private platform: Platform,
    private popupService: PopupService,
    // private appEngine: AppEngine,
    private translate: TranslateService,
  ) {
    this.platform.ready()
      .then(() => this.init());
  }

  private init() {
    this.translate.onLangChange.subscribe(() => this.checkNetwork());
    // this.appEngine.setWebsocketCallbacks({
    //   onOpen: () => this.checkNetwork(),
    //   onClose: () => this.checkNetwork(),
    // });
  }

  private checkNetwork() {
    // this.noNetwork = !this.appEngine.hasCloudConnection();
    this.toggleToast(this.noNetwork && this.isPaused === 0);
  }

  private toggleToast(show: boolean) {
    if (show && !this.noNetworkToast) {
      const notFoundMsg = this.translate.instant('CHECK_NETWORKS.NOT_FOUND');
      this.noNetworkToast = this.popupService.makeToast({
        message: notFoundMsg,
        position: 'top',
      });
    } else if (!show && this.noNetworkToast) {
      this.noNetworkToast.dismiss();
      this.noNetworkToast = null;
    }
  }

  public pause() {
    this.isPaused++;
    this.toggleToast(false);
  }

  public resume() {
    const next = this.isPaused - 1;
    this.isPaused = next >= 0 ? next : 0;
    this.toggleToast(this.noNetwork && this.isPaused === 0);
  }

  public destroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    this.subs.length = 0;
  }
}
