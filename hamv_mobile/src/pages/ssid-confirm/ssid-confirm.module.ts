import { SsidConfirmPage } from './ssid-confirm';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    SsidConfirmPage
  ],
  imports: [
    IonicPageModule.forChild(SsidConfirmPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    SsidConfirmPage
  ]
})
export class SsidConfirmPageModule { }