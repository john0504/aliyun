import { DeviceSettingsPage } from './device-settings';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    DeviceSettingsPage
  ],
  imports: [
    IonicPageModule.forChild(DeviceSettingsPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    DeviceSettingsPage
  ]
})
export class DeviceSettingsPageModule { }