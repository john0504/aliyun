import { BleLedDevicePage } from './ble-led-device';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { InformationModelModule } from '../../modules/information-model/information-model.module';

@NgModule({
  declarations: [
    BleLedDevicePage
  ],
  imports: [
    IonicPageModule.forChild(BleLedDevicePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    InformationModelModule,
  ],
  entryComponents: [
    BleLedDevicePage
  ]
})
export class BleLedDevicePageModule { }