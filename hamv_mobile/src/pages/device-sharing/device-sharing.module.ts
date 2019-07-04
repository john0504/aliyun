import { DeviceSharingPage } from './device-sharing';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    DeviceSharingPage
  ],
  imports: [
    IonicPageModule.forChild(DeviceSharingPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    DeviceSharingPage
  ]
})
export class DeviceSharingPageModule { }