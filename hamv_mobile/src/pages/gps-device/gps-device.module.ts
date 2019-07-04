import { GpsDevicePage } from './gps-device';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    GpsDevicePage
  ],
  imports: [
    IonicPageModule.forChild(GpsDevicePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    GpsDevicePage
  ]
})
export class GpsDevicePageModule { }