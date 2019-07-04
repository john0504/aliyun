import {
  TestBed,
  getTestBed,
} from '@angular/core/testing';
import moment from 'moment-timezone';
import mockdate from 'mockdate';

import { ScheduleCoreInjector } from './schedule-core-injector';
import { ScheduleAdapterService } from '../../providers/schedule-adapter-service';
import { UtcScheduleCoreImpl, TzScheduleCoreImpl } from './schedule-core-impl';

describe('schedule core test cases', () => {

  let scInjector: ScheduleCoreInjector;
  let sas: ScheduleAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScheduleAdapterService,
        ScheduleCoreInjector
      ],
    });

    const injector = getTestBed();
    scInjector = injector.get(ScheduleCoreInjector);
    sas = injector.get(ScheduleAdapterService);
  });

  afterEach(() => {
    getTestBed().resetTestingModule();
  });

  it('should be created', () => {
    expect(scInjector).toBeDefined();
    expect(scInjector instanceof ScheduleCoreInjector).toBeTruthy();
    expect(sas).toBeDefined();
  });

  it('create utc schedule core with no schedule', () => {
    const core = scInjector.fromUtcSchedule();
    expect(core).toBeDefined();
    expect(core instanceof UtcScheduleCoreImpl).toBeTruthy();

    expect(core.schedule).toEqual({
      name: '',
      start: '00:00',
      end: '01:00',
      days: [new Date().getDay()],
      active: 1,
      active_until: null,
      esh: {},
    });
    expect(core.name).toEqual('');
    expect(core.active).toBeTruthy();
    expect(core.activeUntil).toBeNull();
    expect(core.start).toEqual('00:00');
    expect(core.end).toEqual('01:00');
    expect(core.days).toEqual([new Date().getDay()]);
    expect(core.esh).toEqual({});
    expect(core.isOneShot).toBeFalsy();
    expect(core.isOutOfDate).toBeFalsy();
    expect(core.isValid).toBeTruthy();
  });

  it('create utc schedule core with a schedule', () => {
    const core = scInjector.fromUtcSchedule({
      name: 'test schedule',
      start: '10:00',
      end: '02:14',
      days: [4],
      active: 0,
      active_until: 12345,
      esh: {
        H00: 1,
      },
    });
    expect(core).toBeDefined();
    expect(core instanceof UtcScheduleCoreImpl).toBeTruthy();

    expect(core.schedule).toEqual({
      name: 'test schedule',
      start: '10:00',
      end: '02:14',
      days: [4],
      active: 0,
      active_until: 12345,
      esh: {
        H00: 1,
      },
    });
    expect(core.name).toEqual('test schedule');
    expect(core.active).toBeFalsy();
    expect(core.activeUntil).toEqual(12345);
    expect(core.start).toEqual('10:00');
    expect(core.end).toEqual('02:14');
    expect(core.days).toEqual([4]);
    expect(core.esh).toEqual({
      H00: 1,
    });
    expect(core.isOneShot).toBeTruthy();
    expect(core.isOutOfDate).toBeFalsy();
    expect(core.isValid).toBeTruthy();
  });

  it('create timezone schedule core with no schedule', () => {
    const core = scInjector.fromTzSchedule();
    expect(core).toBeDefined();
    expect(core instanceof TzScheduleCoreImpl).toBeTruthy();

    expect(core.schedule).toEqual({
      name: '',
      start: '00:00',
      end: '01:00',
      days: [new Date().getDay()],
      active: 1,
      active_until: null,
      esh: {},
    });
    expect(core.name).toEqual('');
    expect(core.active).toBeTruthy();
    expect(core.activeUntil).toBeNull();
    expect(core.start).toEqual('00:00');
    expect(core.end).toEqual('01:00');
    expect(core.days).toEqual([new Date().getDay()]);
    expect(core.esh).toEqual({});
    expect(core.isOneShot).toBeFalsy();
    expect(core.isOutOfDate).toBeFalsy();
    expect(core.isValid).toBeTruthy();
  });

  it('create timezone schedule core with a schedule', () => {
    const core = scInjector.fromTzSchedule({
      name: 'test schedule',
      start: '10:00',
      end: '02:14',
      days: [4],
      active: 0,
      active_until: 12345,
      esh: {
        H00: 1,
      },
    });
    expect(core).toBeDefined();
    expect(core instanceof TzScheduleCoreImpl).toBeTruthy();

    expect(core.schedule).toEqual({
      name: 'test schedule',
      start: '10:00',
      end: '02:14',
      days: [4],
      active: 0,
      active_until: 12345,
      esh: {
        H00: 1,
      },
    });
    expect(core.name).toEqual('test schedule');
    expect(core.active).toBeFalsy();
    expect(core.activeUntil).toEqual(12345);
    expect(core.start).toEqual('10:00');
    expect(core.end).toEqual('02:14');
    expect(core.days).toEqual([4]);
    expect(core.esh).toEqual({
      H00: 1,
    });
    expect(core.isOneShot).toBeTruthy();
    expect(core.isOutOfDate).toBeFalsy();
    expect(core.isValid).toBeTruthy();
  });

  it('create timezone schedule core from utc schedule', () => {
    mockdate.set(new Date(), -480);

    const core = scInjector.fromUtcToTzSchedule({
      name: 'test schedule',
      start: '10:00',
      end: '02:14',
      days: [4],
      active: 0,
      active_until: 12345,
      esh: {
        H00: 1,
      },
    });
    expect(core).toBeDefined();
    expect(core instanceof TzScheduleCoreImpl).toBeTruthy();

    expect(core.schedule).toEqual({
      name: 'test schedule',
      start: '18:00',
      end: '10:14',
      days: [4],
      active: 0,
      active_until: 12345,
      esh: {
        H00: 1,
      },
    });
    expect(core.name).toEqual('test schedule');
    expect(core.active).toBeFalsy();
    expect(core.activeUntil).toEqual(12345);
    expect(core.start).toEqual('18:00');
    expect(core.end).toEqual('10:14');
    expect(core.days).toEqual([4]);
    expect(core.esh).toEqual({
      H00: 1,
    });
    expect(core.isOneShot).toBeTruthy();
    expect(core.isOutOfDate).toBeFalsy();
    expect(core.isValid).toBeTruthy();

    mockdate.reset();
  });

  it('toggle schedule days', () => {
    const core = scInjector.fromUtcSchedule({
      name: '',
      start: '00:00',
      end: '01:00',
      days: [4],
      active: 1,
      active_until: null,
      esh: {},
    });
    expect(core).toBeDefined();
    expect(core instanceof UtcScheduleCoreImpl).toBeTruthy();

    expect(core.days.sort()).toEqual([4]);
    core.toggleScheduleDay(2);
    expect(core.days.sort()).toEqual([2, 4]);
    core.toggleScheduleDay(4);
    expect(core.days.sort()).toEqual([2]);
    core.toggleScheduleDay(5);
    expect(core.days.sort()).toEqual([2, 5]);
    core.toggleScheduleDay(4);
    expect(core.days.sort()).toEqual([2, 4, 5]);
    core.toggleScheduleDay(4);
    expect(core.days.sort()).toEqual([2, 5]);
    core.toggleScheduleDay(7);
    expect(core.days.sort()).toEqual([2, 5, 7]);

    // invalid value
    core.toggleScheduleDay(0);
    expect(core.days.sort()).toEqual([2, 5, 7]);
    core.toggleScheduleDay(8);
    expect(core.days.sort()).toEqual([2, 5, 7]);
  });

  describe('test utc schedule core functions', () => {

    afterEach(() => mockdate.reset());

    it('test utc schedule core - isOverlapping', () => {
      const core = scInjector.fromUtcSchedule({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
      expect(core).toBeDefined();
      expect(core instanceof UtcScheduleCoreImpl).toBeTruthy();
      expect(core.schedule).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      mockdate.set(moment.tz('2018-04-16 07:00:00', 'Etc/UTC').toDate(), 0);
      expect(core.isOverlapping).toBeFalsy();

      mockdate.set(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate(), 0);
      expect(core.isOverlapping).toBeTruthy();

      mockdate.set(moment.tz('2018-04-16 23:00:00', 'Etc/UTC').toDate(), 0);
      expect(core.isOverlapping).toBeFalsy();
    });

    it('test utc schedule core - setOneShot', () => {
      const core = scInjector.fromUtcSchedule({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
      expect(core).toBeDefined();
      expect(core instanceof UtcScheduleCoreImpl).toBeTruthy();
      expect(core.schedule).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      mockdate.set(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate(), 0);
      core.setOneShot(true);
      expect(core.schedule).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      core.setOneShot();
      expect(core.schedule).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('test utc schedule core - toTzSchedule', () => {
      mockdate.set(new Date(), -480);
      const core = scInjector.fromUtcSchedule({
        name: 'test schedule',
        start: '10:00',
        end: '02:14',
        days: [4],
        active: 0,
        active_until: 12345,
        esh: {
          H00: 1,
        },
      });
      expect(core).toBeDefined();
      expect(core instanceof UtcScheduleCoreImpl).toBeTruthy();
      expect(core.schedule).toEqual({
        name: 'test schedule',
        start: '10:00',
        end: '02:14',
        days: [4],
        active: 0,
        active_until: 12345,
        esh: {
          H00: 1,
        },
      });

      expect(core.toTzSchedule(true)).toEqual({
        name: 'test schedule',
        start: '18:00',
        end: '10:14',
        days: [4],
        active: 0,
        active_until: 1,
        esh: {
          H00: 1,
        },
      });

      expect(core.toTzSchedule()).toEqual({
        name: 'test schedule',
        start: '18:00',
        end: '10:14',
        days: [4],
        active: 0,
        active_until: 1,
        esh: {
          H00: 1,
        },
      });
    });

  });

  describe('test timezone schedule core functions', () => {

    afterEach(() => mockdate.reset());

    it('test timezone schedule core - isOverlapping', () => {
      const core = scInjector.fromTzSchedule({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
      expect(core).toBeDefined();
      expect(core instanceof TzScheduleCoreImpl).toBeTruthy();
      expect(core.schedule).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      mockdate.set(moment.tz('2018-04-16 07:00:00', 'Asia/Taipei').toDate(), -480);
      expect(core.isOverlapping).toBeFalsy();

      mockdate.set(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate(), -480);
      expect(core.isOverlapping).toBeTruthy();

      mockdate.set(moment.tz('2018-04-16 23:00:00', 'Asia/Taipei').toDate(), -480);
      expect(core.isOverlapping).toBeFalsy();
    });

    it('test timezone schedule core - setOneShot', () => {
      mockdate.set(new Date(), -480);

      const core = scInjector.fromTzSchedule({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
      expect(core).toBeDefined();
      expect(core instanceof TzScheduleCoreImpl).toBeTruthy();
      expect(core.schedule).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      mockdate.set(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate(), -480);
      core.setOneShot(true);
      expect(core.schedule).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      core.setOneShot();
      expect(core.schedule).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('test timezone schedule core - toUtcSchedule', () => {
      mockdate.set(new Date(), -480);

      const core = scInjector.fromTzSchedule({
        name: 'test schedule',
        start: '18:00',
        end: '10:14',
        days: [4],
        active: 0,
        active_until: 12345,
        esh: {
          H00: 1,
        },
      });
      expect(core).toBeDefined();
      expect(core instanceof TzScheduleCoreImpl).toBeTruthy();
      expect(core.schedule).toEqual({
        name: 'test schedule',
        start: '18:00',
        end: '10:14',
        days: [4],
        active: 0,
        active_until: 12345,
        esh: {
          H00: 1,
        },
      });

      expect(core.toUtcSchedule(true)).toEqual({
        name: 'test schedule',
        start: '10:00',
        end: '02:14',
        days: [4],
        active: 0,
        active_until: 1,
        esh: {
          H00: 1,
        },
      });

      expect(core.toUtcSchedule()).toEqual({
        name: 'test schedule',
        start: '10:00',
        end: '02:14',
        days: [4],
        active: 0,
        active_until: 1,
        esh: {
          H00: 1,
        },
      });
    });
  });
});