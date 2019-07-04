import { SupportModePage } from './support-mode';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { InformationModelModule } from '../../modules/information-model/information-model.module';

@NgModule({
  declarations: [
    SupportModePage
  ],
  imports: [
    IonicPageModule.forChild(SupportModePage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    InformationModelModule,
  ],
  entryComponents: [
    SupportModePage
  ]
})
export class SupportModePageModule { }