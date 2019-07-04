import { Injectable } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';

import { Schedule } from 'app-engine';

@Injectable()
export class ScheduleAdapterService {

  constructor(
  ) {
  }

  public toTimezoneSchedule(schedule: Schedule, offset: number): Schedule {
    return this.adaptSchedule(schedule, offset);
  }

  public toUTCSchedule(schedule: Schedule, offset: number): Schedule {
    return this.adaptSchedule(schedule, offset, true);
  }

  private adaptSchedule(schedule: Schedule, offset: number, toUTC: boolean = false): Schedule {
    let result = cloneDeep(schedule);
    if (offset === 0) return result;

    offset = toUTC ? offset : -offset;
    let offsetPair = this.parseOffset(offset);

    // start time
    let startTime = this.shiftTime(schedule.start, offsetPair);

    // end time
    let endTime = this.shiftTime(schedule.end, offsetPair);

    // days
    let days = schedule.days;
    let t = startTime.originH + offsetPair.hOffset;
    if (t < 0 || t >= 24) {
      days = this.shiftWeekDays(days, offset < 0 ? -1 : 1);
    }

    result.start = this.padLeft(startTime.h, 2) + ':' + this.padLeft(startTime.m, 2);
    result.end = this.padLeft(endTime.h, 2) + ':' + this.padLeft(endTime.m, 2);
    result.days = days;
    return result;
  }

  private parseOffset(offset: number): { hOffset: number, mOffset: number } {
    let hOffset = offset / 60 | 0;
    let mOffset = offset % 60;

    return { hOffset, mOffset };
  }

  private shiftTime(time: string, offsetPair: { hOffset: number, mOffset: number }): { h: number, m: number, originH: number, originM: number } {
    let sTime = time.split(':');
    let originH = Number.parseInt(sTime[0]);
    let hour = (originH + offsetPair.hOffset + 24) % 24;
    let originM = Number.parseInt(sTime[1]);
    let min = (originM + offsetPair.mOffset + 60) % 60;

    return { h: hour, m: min, originH, originM };
  }

  private shiftWeekDays(days: Array<number>, delta: number): Array<number> {
    return days
      .map((value) => {
        let newValue = value + delta;
        if (newValue > 7) return 1;
        if (newValue < 1) return 7;
        return newValue;
      })
      .sort();
  }

  private padLeft(str, len) {
    str = '' + str;
    return str.length >= len ? str : new Array(len - str.length + 1).join('0') + str;
  }

  public setScheduleForOneShot(utcSchedule: Schedule, executeNow: boolean = false): Schedule {
    if (utcSchedule.active !== 1) {
      const s = cloneDeep(utcSchedule);
      s.active_until = 1;
      return s;
    }
    // start time
    const starTime = utcSchedule.start.split(':');
    const startHour = Number.parseInt(starTime[0]);
    const startMinute = Number.parseInt(starTime[1]);

    // end time
    const endTime = utcSchedule.end.split(':');
    const endHour = Number.parseInt(endTime[0]);
    const endMinute = Number.parseInt(endTime[1]);

    const c = new Date();
    const curTs = c.getTime();
    c.setUTCHours(startHour);
    c.setUTCMinutes(startMinute);
    c.setUTCSeconds(1);

    let startTs = c.getTime();
    const startDateShift: boolean = curTs >= startTs;
    const isOverlapping = this.isOverlapping(utcSchedule);
    if ((isOverlapping && !executeNow) || (!isOverlapping && startDateShift)) {
      startTs += 86400000; //24 * 60 * 60 * 1000;
    }

    const rs = new Date(startTs);
    const weekday = rs.getUTCDay() <= 0 ? 7 : rs.getUTCDay();
    const e = rs;
    e.setUTCHours(endHour);
    e.setUTCMinutes(endMinute);

    let endTs = e.getTime();

    const endDateShift: boolean = startTs >= endTs;
    if (endDateShift) {
      endTs += 86400000; //24 * 60 * 60 * 1000;
    }

    const endDate = new Date(endTs);
    const ts = Math.floor(endDate.getTime() / 1000);

    const result = cloneDeep(utcSchedule);
    result.days = [weekday];
    result.active_until = ts;

    return result;
  }

  public setActiveUntil(UTCSchedule: Schedule, executeNow: boolean) {
    let result = cloneDeep(UTCSchedule);

    if (this.isOneShot(UTCSchedule)) {
      result = this.setScheduleForOneShot(UTCSchedule, executeNow);
    } else {
      result.active_until = null;
    }

    return result;
  }

  public isOverlapping(utcSchedule: Schedule): boolean {
    const isOneShot = this.isOneShot(utcSchedule);
    const starTime = utcSchedule.start.split(':');
    const startHour = Number.parseInt(starTime[0]);
    const startMinute = Number.parseInt(starTime[1]);

    const endTime = utcSchedule.end.split(':');
    const endHour = Number.parseInt(endTime[0]);
    const endMinute = Number.parseInt(endTime[1]);

    const isOvernight = (startHour === endHour && startMinute >= endMinute) || startHour > endHour;

    const now = new Date();
    const curHour = now.getUTCHours();
    const curMinute = now.getUTCMinutes();

    if (!isOneShot) {
      const weekday = now.getUTCDay();
      const today = weekday === 0 ? 7 : weekday;
      const yesterday = today - 1 <= 0 ? 7 : today - 1;
      const inToday = utcSchedule.days.findIndex(day => day === today) !== -1;
      const onYesterday = utcSchedule.days.findIndex(day => day === yesterday) !== -1;

      if (isOvernight) {
        return (inToday && this.afterTime(curHour, curMinute, startHour, startMinute))
          || (onYesterday && this.beforeTime(curHour, curMinute, endHour, endMinute));
      }
      return inToday
        && this.afterTime(curHour, curMinute, startHour, startMinute)
        && this.beforeTime(curHour, curMinute, endHour, endMinute);
    }
    return isOvernight
      ? this.afterTime(curHour, curMinute, startHour, startMinute) || this.beforeTime(curHour, curMinute, endHour, endMinute)
      : this.afterTime(curHour, curMinute, startHour, startMinute) && this.beforeTime(curHour, curMinute, endHour, endMinute);
  }

  private beforeTime(h, m, targetH, targetM): boolean {
    return h < targetH || (h === targetH && m <= targetM);
  }

  private afterTime(h, m, targetH, targetM): boolean {
    return h > targetH || (h === targetH && m >= targetM);
  }

  public isOutOfDate(schedule: Schedule): boolean {
    if (schedule && schedule.active === 1 &&
      schedule.active_until && schedule.active_until > 0) {
      let ts = Date.now() / 1000 | 0;
      return ts > schedule.active_until;
    }
    return false;
  }

  public isOneShot(schedule: Schedule): boolean {
    return schedule && schedule.active_until && schedule.active_until > 0 && schedule.days.length === 1;
  }
}
