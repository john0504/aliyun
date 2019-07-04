import { Injectable } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SafariViewController } from '@ionic-native/safari-view-controller';

@Injectable()
export class UtilsProvider {

  constructor(
    private iab: InAppBrowser,
    private safariViewController: SafariViewController,
  ) {
  }

  public openLink(url: string) {
    this.safariViewController
      .isAvailable()
      .then((available: boolean) => {
        if (available) {
          this.safariViewController
            .show({ url })
            .subscribe();
        } else {
          this.iab.create(url, '_self').show();
        }
      });
  }
}