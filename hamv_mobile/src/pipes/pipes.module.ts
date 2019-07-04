import { NgModule } from '@angular/core';
import { RemarkTime } from './remark-time/remark-time';
import { ScheduleRepeatTime } from './schedule-repeat-time/schedule-repeat-time';

@NgModule({
  declarations: [
    RemarkTime,
    ScheduleRepeatTime,
  ],
  exports: [
    RemarkTime,
    ScheduleRepeatTime,
  ]
})
export class PipesModule { }
