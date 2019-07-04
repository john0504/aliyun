import { CapsuleDevicePage } from './capsule-device';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    CapsuleDevicePage
  ],
  imports: [
    IonicPageModule.forChild(CapsuleDevicePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    CapsuleDevicePage
  ]
})
export class CapsuleDevicePageModule { }