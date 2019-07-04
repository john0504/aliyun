import { PaymentPage } from './payment';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    PaymentPage
  ],
  imports: [
    IonicPageModule.forChild(PaymentPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    PaymentPage
  ]
})
export class PaymentPageModule { }
