import { PreDeviceCreatePage } from './pre-device-create';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    PreDeviceCreatePage
  ],
  imports: [
    IonicPageModule.forChild(PreDeviceCreatePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    PreDeviceCreatePage
  ]
})
export class PreDeviceCreatePageModule { }