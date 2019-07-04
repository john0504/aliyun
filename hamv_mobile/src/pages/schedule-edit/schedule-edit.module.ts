import { ScheduleEditPage } from './schedule-edit';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { InformationModelModule } from '../../modules/information-model/information-model.module';

@NgModule({
  declarations: [
    ScheduleEditPage
  ],
  imports: [
    IonicPageModule.forChild(ScheduleEditPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    PipesModule,
    InformationModelModule,
  ],
  entryComponents: [
    ScheduleEditPage
  ]
})
export class ScheduleEditPageModule { }