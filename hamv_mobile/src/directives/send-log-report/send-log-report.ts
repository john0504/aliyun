import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { TextEncoder } from 'text-encoding';
import * as base64js from 'base64-js';

import { Logger, StateStore } from 'app-engine';

import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { EmailComposer } from '@ionic-native/email-composer';

import { PopupService } from '../../providers/popup-service';
import { appConfig } from '../../app/app.config';

@Directive({
  selector: '[send-log-report]',
  host: {
    '(click)': 'report()',
  }
})
export class SendLogReportDirective {

  private version: string;
  private reporter: string;

  constructor(
    private appVersion: AppVersion,
    private device: Device,
    private emailComposer: EmailComposer,
    private platform: Platform,
    private popupService: PopupService,
    private stateStore: StateStore,
    private translate: TranslateService,
  ) {
    this.platform.ready()
      .then(() => {
        this.emailComposer.addAlias('gmail', 'com.google.android.gm');
        this.setAppVersion();
      });
    this.stateStore.account$
      .subscribe(account => {
        if (account) {
          this.reporter = account.account;
        }
      });
  }

  private setAppVersion() {
    this.appVersion.getVersionNumber()
      .then(version => (this.version = version));
  }

  report() {
    this.popupService.loadingPopup(this.sendByEmail(), {
      content: this.translate.instant('SEND_LOG_REPORT.LOADING'),
    });
  }

  private sendByEmail(): Promise<any> {
    return this.emailComposer.isAvailable()
      .then(() => Logger.export())
      .then(text => {
        const options = {
          app: this.platform.is('android') ? 'gmail' : undefined,
          attachments: [
            `base64:log.txt//${this.base64EncodingUTF8(text)}`,
          ],
          body: `
Please describe your issue below, including the steps you took to encounter the issue:<br>
<br>
<br>
__________________________<br>
App Version: ${this.version}<br>
Model Info: ${this.device.model}<br>
Device Version: ${this.device.version}<br>
Username: ${this.reporter}<br>
            `,
          subject: `Reported issue from ${this.reporter}`,
          to: appConfig.app.support.email,
        };

        return this.emailComposer.open(options);
      })
      .catch(e => {
        if (e !== 'cordova_not_available') throw e;
      });
  }

  private base64EncodingUTF8(str) {
    const encoded = new TextEncoder().encode(str);
    const b64Encoded = base64js.fromByteArray(encoded);
    return b64Encoded;
  }

}
