import { Schedule } from 'app-engine';

export interface ScheduleCore {
  schedule: Schedule;
  name: string;
  start: string;
  end: string;
  days: Array<number>;
  active: boolean;
  activeUntil: number;
  esh: Object;

  isOneShot: boolean;
  isOutOfDate: boolean;
  isOverlapping: boolean;
  isValid: boolean;

  setOneShot(enable?: boolean);
  toggleScheduleDay(day);
}

export interface UtcScheduleCore extends ScheduleCore {
  toTzSchedule(executeNow?: boolean): Schedule;
}

export interface TzScheduleCore extends ScheduleCore {
  toUtcSchedule(executeNow?: boolean): Schedule;
}