import { Schedule } from 'app-engine';
import cloneDeep from 'lodash/cloneDeep';

import {
  ScheduleCore,
  TzScheduleCore,
  UtcScheduleCore,
} from './schedule-core';
import { ScheduleAdapterService } from '../../providers/schedule-adapter-service';

export abstract class ScheduleCoreImpl implements ScheduleCore {

  protected _schedule;

  constructor(
    protected _sas: ScheduleAdapterService,
  ) { }

  public bind(val: Schedule) {
    this._schedule = cloneDeep(val);
  }

  get schedule(): Schedule {
    return this._schedule;
  }

  get name(): string {
    return this._schedule.name;
  }

  get start(): string {
    return this._schedule.start;
  }

  get end(): string {
    return this._schedule.end;
  }

  get days(): Array<number> {
    return this._schedule.days;
  }

  get active(): boolean {
    return !this.isOutOfDate && this._schedule.active === 1;
  }

  get activeUntil(): number {
    return this._schedule.active_until;
  }

  get esh(): Object {
    return this._schedule.esh;
  }

  get isOneShot(): boolean {
    return this._sas.isOneShot(this._schedule);
  }

  get isOutOfDate(): boolean {
    return this._sas.isOutOfDate(this._schedule);
  }

  get isValid(): boolean {
    const validSet = !!(
      this.days &&
      this.start !== '' &&
      this.end !== ''
    );

    return this.isOneShot ?
      validSet && this.days.length === 1 :
      validSet && this.days.length > 0;
  }

  protected setActiveUntil(utcSchedule: Schedule, executeNow: boolean): Schedule {
    return this._sas.setActiveUntil(utcSchedule, executeNow);
  }

  public toggleScheduleDay(day) {
    if (day > 7 || day < 1) return;
    const index = this.days.indexOf(day);
    if (index > -1) {
      this.days.splice(index, 1);
    } else {
      this.days.push(day);
    }
  }

  isOverlapping: boolean;
  public abstract setOneShot(enable: boolean);

}

export class TzScheduleCoreImpl extends ScheduleCoreImpl implements TzScheduleCore {

  private originDays: Array<number> = [];

  constructor(
    _s: ScheduleAdapterService,
  ) {
    super(_s);
  }

  get isOverlapping(): boolean {
    const offset = new Date().getTimezoneOffset();
    return this._sas.isOverlapping(this._sas.toUTCSchedule(this._schedule, offset));
  }

  public setOneShot(enable: boolean = false) {
    if (enable) {
      this.originDays = this.schedule.days;
      this.schedule.days = [new Date().getDay()];
      this.schedule.active_until = 1;
    } else {
      this.schedule.days = this.originDays;
      this.schedule.active_until = null;
    }
  }

  public toUtcSchedule(executeNow: boolean = false): Schedule {
    const offset = new Date().getTimezoneOffset();
    const utcSchedule = this._sas.toUTCSchedule(this._schedule, offset);
    return this.setActiveUntil(utcSchedule, executeNow);
  }
}

export class UtcScheduleCoreImpl extends ScheduleCoreImpl implements UtcScheduleCore {

  private originDays: Array<number> = [];

  constructor(
    _s: ScheduleAdapterService,
  ) {
    super(_s);
  }

  get isOverlapping(): boolean {
    return this._sas.isOverlapping(this._schedule);
  }

  public setOneShot(enable: boolean = false) {
    if (enable) {
      this.originDays = this.schedule.days;
      this.schedule.days = [new Date().getUTCDay()];
      this.schedule.active_until = 1;
    } else {
      this.schedule.days = this.originDays;
      this.schedule.active_until = null;
    }
  }

  public toTzSchedule(executeNow: boolean = false): Schedule {
    const offset = new Date().getTimezoneOffset();
    const utcSchedule = this.setActiveUntil(this._schedule, executeNow);
    return this._sas.toTimezoneSchedule(utcSchedule, offset);
  }
}