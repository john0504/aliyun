import { PipesModule } from './../../pipes/pipes.module';
import { ScheduleListPage } from './schedule-list';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    ScheduleListPage
  ],
  imports: [
    IonicPageModule.forChild(ScheduleListPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    PipesModule,
  ],
  entryComponents: [
    ScheduleListPage
  ]
})
export class ScheduleListPageModule { }