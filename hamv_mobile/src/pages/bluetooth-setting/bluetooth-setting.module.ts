import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { BluetoothSettingPage } from './bluetooth-setting';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    BluetoothSettingPage
  ],
  imports: [
    IonicPageModule.forChild(BluetoothSettingPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    BluetoothSettingPage
  ]
})
export class BluetoothSettingPageModule {}
