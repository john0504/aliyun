import { DeviceDetailPage } from './device-detail';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { InformationModelModule } from '../../modules/information-model';
import { ImageCacheModule } from '../../modules/image-cache';

@NgModule({
  declarations: [
    DeviceDetailPage
  ],
  imports: [
    IonicPageModule.forChild(DeviceDetailPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    InformationModelModule,
    ImageCacheModule,
  ],
  entryComponents: [
    DeviceDetailPage
  ]
})
export class DeviceDetailPageModule { }