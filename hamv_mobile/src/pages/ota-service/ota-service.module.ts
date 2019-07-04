import { OtaServicePage } from './ota-service';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    OtaServicePage
  ],
  imports: [
    IonicPageModule.forChild(OtaServicePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    OtaServicePage
  ]
})
export class OtaServicePageModule { }