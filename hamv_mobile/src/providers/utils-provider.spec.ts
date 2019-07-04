import {
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { InAppBrowserMock } from '@ionic-native-mocks/in-app-browser';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { SafariViewControllerMock } from '@ionic-native-mocks/safari-view-controller';

import { UtilsProvider } from './utils-provider';

describe('Check utils provider', () => {

  let instance: UtilsProvider;
  let safariViewCtrl: SafariViewController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: InAppBrowser, useClass: InAppBrowserMock },
        { provide: SafariViewController, useClass: SafariViewControllerMock },
        UtilsProvider,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(UtilsProvider);
    safariViewCtrl = injector.get(SafariViewController);
  });

  it('open link when safari view controller is available', () => {
    spyOn(safariViewCtrl, 'isAvailable').and.returnValue(Promise.resolve(true));
    instance.openLink('http://link.to.network/');
  });

  it('open link when safari view controller is NOT available', () => {
    spyOn(safariViewCtrl, 'isAvailable').and.returnValue(Promise.resolve(false));
    instance.openLink('http://link.to.network/');
  });
});