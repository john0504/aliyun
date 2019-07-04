import { Injectable } from '@angular/core';
import {
  AppTasks,
  Schedule,
} from 'app-engine';
import {
  Observable,
  Subject,
} from 'rxjs';
import { defer } from 'rxjs/observable/defer';
import { of } from 'rxjs/observable/of';
import {
  buffer,
  debounceTime,
  filter,
  first,
  map,
  mergeMap,
  share,
  tap,
} from 'rxjs/operators';

import { ScheduleAdapterService } from './schedule-adapter-service';

export interface CalendarRequest {
  deviceSn: string;
  calendar: Array<Schedule>;
  schedule?: Schedule;
  index?: number;
}

@Injectable()
export class CalendarService {

  private dispatcher: Subject<any> = new Subject<any>();
  private workingTable: Map<string, Observable<any>> = new Map<string, Observable<any>>();

  constructor(
    private appTasks: AppTasks,
    private sas: ScheduleAdapterService,
  ) { }

  public checkCalendar(deviceSn: string, calendar: Array<Schedule>): Observable<any> {
    let hasOutOfDateSchedule = false;
    calendar
      .forEach((schedule: Schedule) => {
        if (this.sas.isOutOfDate(schedule)) {
          hasOutOfDateSchedule = true;
          schedule.active = 0;
        }
      });
    const context = { deviceSn, calendar };
    return hasOutOfDateSchedule ? this.saveCalendar(context) : of(context);
  }

  public saveCalendar(request: CalendarRequest): Observable<any> {
    const { deviceSn } = request;

    if (!this.workingTable.has(deviceSn)) {
      const subject = new Subject<any>();
      this.createWorker(deviceSn, subject);
      this.workingTable.set(deviceSn, subject.asObservable());
    }

    this.dispatcher.next(request);

    return this.workingTable.get(deviceSn);
  }

  private createWorker(deviceSn: string, subject: Subject<any>) {
    const mainStream = this.dispatcher
      .pipe(
        filter(request => request.deviceSn === deviceSn),
        share()
      );
    const debounceBreak$ = mainStream.pipe(debounceTime(1000));
    mainStream
      .pipe(
        buffer(debounceBreak$),
        first(),
        tap(() => this.workingTable.delete(deviceSn)),
        mergeMap(buffers => this.realJob({ deviceSn, buffers }))
      )
      .subscribe(subject);
  }

  private realJob({ deviceSn, buffers }): Observable<any> {
    return of(buffers)
      .pipe(
        map(buffers =>
          buffers.reduce((acc, curr) => {
            if (!acc) acc = curr;
            if (!curr.schedule || curr.index < -1 || Math.abs(curr.calendar.length - acc.calendar.length) > 1) {
              acc.calendar = curr.calendar;
              return acc;
            }
            if (curr.index < 0 || curr.index >= acc.calendar.length) {
              acc.calendar.push(curr.schedule);
            } else {
              acc.calendar[curr.index] = curr.schedule;
            }
            acc.index = curr.index;
            return acc;
          }, undefined)
        ),
        mergeMap(request => defer(() => this.appTasks.wsRequestCalendarTask(deviceSn, request.calendar)))
      );
  }
}