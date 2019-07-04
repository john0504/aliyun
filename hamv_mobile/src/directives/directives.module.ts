import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FbLoginDirective } from './fb-login/fb-login';
import { GoAddingDeviceDirective } from './go-adding-device/go-adding-device';
import { GoDeviceHistoricalPageDirective } from './go-device-historical-page/go-device-historical-page';
import { RippleEffectDirective } from './ripple-effect/ripple-effect';
import { SendLogReportDirective } from './send-log-report/send-log-report';
import { TabIndexDirective } from './tab-index/tab-index';

@NgModule({
  declarations: [
    FbLoginDirective,
    GoAddingDeviceDirective,
    GoDeviceHistoricalPageDirective,
    RippleEffectDirective,
    SendLogReportDirective,
    TabIndexDirective,
  ],
  imports: [
    TranslateModule,
  ],
  exports: [
    FbLoginDirective,
    GoAddingDeviceDirective,
    GoDeviceHistoricalPageDirective,
    RippleEffectDirective,
    SendLogReportDirective,
    TabIndexDirective,
  ]
})
export class DirectivesModule { }
