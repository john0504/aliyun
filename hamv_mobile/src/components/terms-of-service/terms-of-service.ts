import { Component } from '@angular/core';
import { AppEngine } from 'app-engine';

import { UtilsProvider } from '../../providers/utils-provider';

@Component({
  selector: 'terms-of-service',
  templateUrl: 'terms-of-service.html'
})
export class TermsOfServiceComponent {

  constructor(
    private appEngine: AppEngine,
    private utilsProvider: UtilsProvider,
  ) {
  }

  openTerms() {
    const url = `https://${this.appEngine.getBaseUrl()}/#/legal`;
    this.utilsProvider.openLink(url);
  }
}



