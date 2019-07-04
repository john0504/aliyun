import { DeviceHistoryPage } from './device-history';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { InformationModelModule } from '../../modules/information-model';

@NgModule({
  declarations: [
    DeviceHistoryPage
  ],
  imports: [
    IonicPageModule.forChild(DeviceHistoryPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    InformationModelModule
  ],
  entryComponents: [
    DeviceHistoryPage
  ]
})
export class DeviceHistoryPageModule { }
