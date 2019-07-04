import { DeviceCreatePage } from './device-create';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    DeviceCreatePage
  ],
  imports: [
    IonicPageModule.forChild(DeviceCreatePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    DeviceCreatePage
  ]
})
export class DeviceCreatePageModule { }