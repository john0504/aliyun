import { LocalModeDeviceItemPage } from './local-mode-device-item';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { InformationModelModule } from '../../modules/information-model/information-model.module';

@NgModule({
  declarations: [
    LocalModeDeviceItemPage
  ],
  imports: [
    IonicPageModule.forChild(LocalModeDeviceItemPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    InformationModelModule,
  ],
  entryComponents: [
    LocalModeDeviceItemPage
  ]
})
export class LocalModeDeviceItemPageModule { }