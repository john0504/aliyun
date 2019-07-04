import { Injectable } from '@angular/core';
import { Schedule } from 'app-engine';

import {
  TzScheduleCore,
  UtcScheduleCore,
} from './schedule-core';
import {
  TzScheduleCoreImpl,
  UtcScheduleCoreImpl,
} from './schedule-core-impl';
import { ScheduleAdapterService } from '../../providers/schedule-adapter-service';

const defualtSchedule = () => {
  return {
    name: '',
    start: '00:00',
    end: '01:00',
    days: [new Date().getDay()],
    active: 1,
    active_until: null,
    esh: {},
  };
};

@Injectable()
export class ScheduleCoreInjector {

  constructor(
    private _sas: ScheduleAdapterService,
  ) {
  }

  public fromUtcToTzSchedule(utcSchedule: Schedule = defualtSchedule()): TzScheduleCore {
    const core = new TzScheduleCoreImpl(this._sas);
    const offset = new Date().getTimezoneOffset();
    const tzSchedule = this._sas.toTimezoneSchedule(utcSchedule, offset);
    core.bind(tzSchedule);
    return core;
  }

  public fromTzSchedule(schedule: Schedule = defualtSchedule()): TzScheduleCore {
    const core = new TzScheduleCoreImpl(this._sas);
    core.bind(schedule);
    return core;
  }

  public fromUtcSchedule(schedule: Schedule = defualtSchedule()): UtcScheduleCore {
    const core = new UtcScheduleCoreImpl(this._sas);
    core.bind(schedule);
    return core;
  }

}