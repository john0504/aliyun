import { DevicePaymentPage } from './device-payment';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    DevicePaymentPage
  ],
  imports: [
    IonicPageModule.forChild(DevicePaymentPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    DevicePaymentPage
  ]
})
export class DevicePaymentPageModule { }
