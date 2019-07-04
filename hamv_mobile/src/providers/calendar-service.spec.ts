import { TestBed, getTestBed } from '@angular/core/testing';
import { AppTasks } from 'app-engine';
import cloneDeep from 'lodash/cloneDeep';

import { CalendarService } from './calendar-service';
import { ScheduleAdapterService } from './schedule-adapter-service';
import { ScheduleAdapterServiceMock } from '../mocks/providers.mocks';
import { AppTasksMock } from '../mocks/app-engine.mocks';
import { baseSchedule } from '../mocks/testing-items.mocks';

describe('Check calendar service', () => {

  let instance: CalendarService;
  let appTasks: AppTasks;
  let sas: ScheduleAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AppTasks, useClass: AppTasksMock },
        { provide: ScheduleAdapterService, useClass: ScheduleAdapterServiceMock },
        CalendarService,
      ],
    });
    const injector = getTestBed();
    instance = injector.get(CalendarService);
    appTasks = injector.get(AppTasks);
    sas = injector.get(ScheduleAdapterService);
  });

  afterEach(() => {
    getTestBed().resetTestingModule();
  });

  it('should be created', () => {
    expect(instance).toBeDefined();
    expect(instance instanceof CalendarService).toBeTruthy();
  });

  it('should do nothing when calendar is no out-of-date schedule', done => {
    const testSchedule = cloneDeep(baseSchedule);
    testSchedule.active = 0;
    expect(testSchedule.active).toEqual(0);

    spyOn(sas, 'isOutOfDate').and.returnValue(false);
    const spy = spyOn(instance, 'saveCalendar').and.callThrough();

    instance.checkCalendar('deviceSn', [testSchedule])
      .subscribe(result => {
        expect(result).toEqual({
          deviceSn: 'deviceSn',
          calendar: [{
            name: 'name test',
            start: '12:24',
            end: '13:24',
            days: [1, 2, 3, 4, 5, 6, 7],
            active: 0,
            active_until: 1477377969,
            esh: {
              H00: 1
            }
          }]
        });
        expect(spy).not.toHaveBeenCalled();
        done();
      });
  });

  it('should call saveCalendar when there is an out-of-date schedule', done => {
    const testSchedule = cloneDeep(baseSchedule);
    expect(testSchedule.active).toEqual(1);

    spyOn(sas, 'isOutOfDate').and.returnValue(true);
    const spy = spyOn(instance, 'saveCalendar').and.callThrough();

    instance.checkCalendar('deviceSn', [testSchedule])
      .subscribe(() => {
        expect(spy).toHaveBeenCalledWith(
          {
            deviceSn: 'deviceSn',
            calendar: [{
              name: 'name test',
              start: '12:24',
              end: '13:24',
              days: [1, 2, 3, 4, 5, 6, 7],
              active: 0,
              active_until: 1477377969,
              esh: {
                H00: 1
              }
            }]
          }
        );
        done();
      });
  });

  it('test multiple calls', done => {
    const originSchedule = cloneDeep(baseSchedule);
    const testSchedule1 = cloneDeep(baseSchedule);
    testSchedule1.active = 1;
    const testSchedule2 = cloneDeep(baseSchedule);
    testSchedule2.active = 0;

    const spy = spyOn(appTasks, 'wsRequestCalendarTask').and.callThrough();

    instance
      .saveCalendar({
        deviceSn: 'deviceSn',
        calendar: [originSchedule],
        schedule: testSchedule1,
        index: 0,
      })
      .toPromise();

    instance
      .saveCalendar({
        deviceSn: 'deviceSn',
        calendar: [testSchedule1],
        schedule: testSchedule2,
        index: 0,
      })
      .subscribe(() => {
        expect(spy).toHaveBeenCalledWith('deviceSn', [testSchedule2]);
        done();
      });
  });

  it('test add new schedule', done => {
    const originSchedule = cloneDeep(baseSchedule);
    const testSchedule1 = cloneDeep(baseSchedule);
    testSchedule1.active = 1;
    const testSchedule2 = cloneDeep(baseSchedule);
    testSchedule2.active = 0;

    const spy = spyOn(appTasks, 'wsRequestCalendarTask').and.callThrough();

    instance
      .saveCalendar({
        deviceSn: 'deviceSn',
        calendar: [originSchedule],
        schedule: testSchedule1,
        index: 0,
      })
      .toPromise();

    instance
      .saveCalendar({
        deviceSn: 'deviceSn',
        calendar: [testSchedule1],
        schedule: testSchedule2,
        index: -1,
      })
      .subscribe(() => {
        expect(spy).toHaveBeenCalledWith('deviceSn', [testSchedule1, testSchedule2]);
        done();
      });
  });
});