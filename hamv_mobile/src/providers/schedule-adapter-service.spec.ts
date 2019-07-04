import { Schedule } from 'app-engine';
import * as moment from 'moment-timezone';

import { ScheduleAdapterService } from './schedule-adapter-service';

describe('Check schedule adapter service', () => {

  let instance: ScheduleAdapterService;

  beforeAll(() => {
    instance = new ScheduleAdapterService();
  });

  describe('test a utc schedule shifting to a timezone schedule', () => {

    it('shift a UTC schedule to a timezone(UTC+0) schedule', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '18:00',
        end: '01:10',
        days: [1, 3, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };
      const timezoneSchedule = instance.toTimezoneSchedule(utcSchedule, 0);
      expect(timezoneSchedule).toBeDefined();
      expect(timezoneSchedule).toEqual({
        name: 'testing schedule',
        start: '18:00',
        end: '01:10',
        days: [1, 3, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('shift a UTC schedule to a timezone(UTC+8) schedule', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '01:00',
        end: '01:10',
        days: [1, 3, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };
      const timezoneSchedule = instance.toTimezoneSchedule(utcSchedule, -480);
      expect(timezoneSchedule).toBeDefined();
      expect(timezoneSchedule).toEqual({
        name: 'testing schedule',
        start: '09:00',
        end: '09:10',
        days: [1, 3, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('shift an overnight UTC schedule to a timezone(UTC+8) schedule', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '18:00',
        end: '17:10',
        days: [1, 3, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };
      const timezoneSchedule = instance.toTimezoneSchedule(utcSchedule, -480);
      expect(timezoneSchedule).toBeDefined();
      expect(timezoneSchedule).toEqual({
        name: 'testing schedule',
        start: '02:00',
        end: '01:10',
        days: [1, 2, 4],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

  });

  describe('test a timezone schedule shifting to a utc schedule', () => {

    it('shift a timezone(UTC+0) schedule to a UTC schedule', () => {
      const timezoneSchedule: Schedule = {
        name: 'testing schedule',
        start: '02:00',
        end: '09:10',
        days: [1, 2, 4],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };
      const utcSchedule = instance.toUTCSchedule(timezoneSchedule, 0);
      expect(utcSchedule).toBeDefined();
      expect(utcSchedule).toEqual({
        name: 'testing schedule',
        start: '02:00',
        end: '09:10',
        days: [1, 2, 4],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('shift a timezone(UTC+8) schedule to a UTC schedule', () => {
      const timezoneSchedule: Schedule = {
        name: 'testing schedule',
        start: '02:00',
        end: '09:10',
        days: [1, 2, 4],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };
      const utcSchedule = instance.toUTCSchedule(timezoneSchedule, -480);
      expect(utcSchedule).toBeDefined();
      expect(utcSchedule).toEqual({
        name: 'testing schedule',
        start: '18:00',
        end: '01:10',
        days: [1, 3, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('shift an overnight timezone(UTC+8) schedule to a UTC schedule', () => {
      const timezoneSchedule: Schedule = {
        name: 'testing schedule',
        start: '02:00',
        end: '01:10',
        days: [1, 2, 4],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };
      const utcSchedule = instance.toUTCSchedule(timezoneSchedule, -480);
      expect(utcSchedule).toBeDefined();
      expect(utcSchedule).toEqual({
        name: 'testing schedule',
        start: '18:00',
        end: '17:10',
        days: [1, 3, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

  });

  describe('test overlapping schedule cases', () => {

    afterEach(() => jasmine.clock().uninstall());

    const offset = -480; // GMT+8

    it('test schedule - one-shot, not overnight and GMT+8', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();
    });

    it('test schedule - one-shot, overnight and GMT+8', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '14:00', // -> GMT+8 22:00
        end: '04:00', // -> GMT+8 12:00
        days: [7],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();
    });

    it('test schedule - period, not overnight and GMT+8', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();
    });

    it('test schedule - period, overnight and GMT+8', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '14:00', // -> GMT+8 22:00
        end: '08:00', // -> GMT+8 16:00
        days: [7], // -> GMT+8 [7]
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-15 21:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-15 22:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-15 23:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 15:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 16:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      const utcSchedule2: Schedule = {
        name: 'testing schedule',
        start: '01:00', // -> GMT+8 09:00
        end: '01:00', // -> GMT+8 09:00
        days: [1],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-17 07:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-17 10:00:00', 'Asia/Taipei').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeFalsy();
    });

    it('test schedule - one-shot, not overnight and UTC', () => {
      const utcSchedule: Schedule = {
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
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 15:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();
    });

    it('test schedule - one-shot, overnight and UTC', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '22:00',
        end: '12:00',
        days: [7],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();
    });

    it('test schedule - period, not overnight and UTC', () => {
      const utcSchedule1: Schedule = {
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
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule1)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule1)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule1)).toBeFalsy();
    });

    it('test schedule - period, overnight and UTC', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '22:00',
        end: '16:00',
        days: [7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-15 21:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-15 22:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-15 23:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 15:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 16:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule)).toBeFalsy();

      const utcSchedule2: Schedule = {
        name: 'testing schedule',
        start: '09:00',
        end: '09:00',
        days: [1],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeFalsy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-16 23:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-17 07:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeTruthy();

      jasmine.clock().mockDate(moment.tz('2018-04-17 10:00:00', 'Etc/UTC').toDate());
      expect(instance.isOverlapping(utcSchedule2)).toBeFalsy();
    });

  });

  describe('test to setup a one-shot schedule', () => {

    afterEach(() => jasmine.clock().uninstall());

    it('set to one-shot schedule - GMT+8', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Asia/Taipei').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: 1523880001,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: 1523880001,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [2],
        active: 1,
        active_until: 1523966401,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('set to one-shot schedule - GMT+8, overnight case for tolerance testing', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '15:00', // -> GMT+8 23:00
        end: '12:00', // -> GMT+8 20:00
        days: [7],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-15 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '15:00', // -> GMT+8 23:00
        end: '12:00', // -> GMT+8 20:00
        days: [7],
        active: 1,
        active_until: 1523880001,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-15 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '15:00', // -> GMT+8 23:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: 1523966401,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      // forced enable, execute now
      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '15:00', // -> GMT+8 23:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: 1523966401,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      // forced enable, later execute
      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '15:00', // -> GMT+8 23:00
        end: '12:00', // -> GMT+8 20:00
        days: [2],
        active: 1,
        active_until: 1524052801,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      const utcScheduleOff: Schedule = {
        name: 'testing schedule',
        start: '15:00', // -> GMT+8 23:00
        end: '12:00', // -> GMT+8 20:00
        days: [7],
        active: 0,
        active_until: 1524052801,
        esh: {
          H00: 1,
          H02: 1,
        },
      };
      expect(instance.setScheduleForOneShot(utcScheduleOff)).toEqual({
        name: 'testing schedule',
        start: '15:00', // -> GMT+8 23:00
        end: '12:00', // -> GMT+8 20:00
        days: [7],
        active: 0,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('set to one-shot schedule - UTC', () => {
      const utcSchedule: Schedule = {
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
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 07:00:00', 'Etc/UTC').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: 1523908801,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: 1523908801,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [2],
        active: 1,
        active_until: 1523995201,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('set to one-shot schedule - UTC, overnight case for tolerance testing', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '23:00',
        end: '20:00',
        days: [7],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-15 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '23:00',
        end: '20:00',
        days: [7],
        active: 1,
        active_until: 1523908801,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-15 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '23:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: 1523995201,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      // forced enable, execute now
      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '23:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: 1523995201,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      // forced enable, later execute
      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setScheduleForOneShot(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '23:00',
        end: '20:00',
        days: [2],
        active: 1,
        active_until: 1524081601,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      const utcScheduleOff: Schedule = {
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 0,
        active_until: 1524081601,
        esh: {
          H00: 1,
          H02: 1,
        },
      };
      expect(instance.setScheduleForOneShot(utcScheduleOff)).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 0,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

  });

  describe('test schedule - setActiveUntil', () => {

    afterEach(() => jasmine.clock().uninstall());

    it('one-shot schedule - GMT+8', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: 1,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setActiveUntil(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1],
        active: 1,
        active_until: 1523880001,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setActiveUntil(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [2],
        active: 1,
        active_until: 1523966401,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('period schedule - GMT+8', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1, 2, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setActiveUntil(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1, 2, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Asia/Taipei').toDate());
      expect(instance.setActiveUntil(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '00:00', // -> GMT+8 08:00
        end: '12:00', // -> GMT+8 20:00
        days: [1, 2, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('one-shot schedule - UTC', () => {
      const utcSchedule: Schedule = {
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
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setActiveUntil(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1],
        active: 1,
        active_until: 1523908801,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setActiveUntil(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [2],
        active: 1,
        active_until: 1523995201,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

    it('period schedule - UTC', () => {
      const utcSchedule: Schedule = {
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1, 2, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      };

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setActiveUntil(utcSchedule, true)).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1, 2, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });

      jasmine.clock().mockDate(moment.tz('2018-04-16 18:00:00', 'Etc/UTC').toDate());
      expect(instance.setActiveUntil(utcSchedule, false)).toEqual({
        name: 'testing schedule',
        start: '08:00',
        end: '20:00',
        days: [1, 2, 7],
        active: 1,
        active_until: null,
        esh: {
          H00: 1,
          H02: 1,
        },
      });
    });

  });

  it('test checking out-of-date schedule', () => {
    const outOfDateSchedule: Schedule = {
      name: 'testing schedule',
      start: '18:00',
      end: '18:10',
      days: [1],
      active: 1,
      active_until: 1000,
      esh: {
        H00: 1,
        H02: 1,
      },
    };
    const result1 = instance.isOutOfDate(outOfDateSchedule);
    expect(result1).toBeTruthy();

    const workingSchedule: Schedule = {
      name: 'testing schedule',
      start: '18:00',
      end: '18:10',
      days: [1],
      active: 1,
      active_until: (Date.now() / 1000 | 0) + 1000,
      esh: {
        H00: 1,
        H02: 1,
      },
    };
    const result2 = instance.isOutOfDate(workingSchedule);
    expect(result2).toBeFalsy();

    const inactiveSchedule: Schedule = {
      name: 'testing schedule',
      start: '18:00',
      end: '18:10',
      days: [1],
      active: 0,
      active_until: (Date.now() / 1000 | 0) + 1000,
      esh: {
        H00: 1,
        H02: 1,
      },
    };
    // we don't care inactive schedule is out of date or not, so it always return false
    const result3 = instance.isOutOfDate(inactiveSchedule);
    expect(result3).toBeFalsy();
  });

  it('test checking one-shot schedule', () => {
    const oneShotSchedule: Schedule = {
      name: 'testing schedule',
      start: '18:00',
      end: '18:10',
      days: [1],
      active: 1,
      active_until: 1000,
      esh: {
        H00: 1,
        H02: 1,
      },
    };
    const result1 = instance.isOneShot(oneShotSchedule);
    expect(result1).toBeTruthy();

    const notOneShotSchedule: Schedule = {
      name: 'testing schedule',
      start: '18:00',
      end: '18:10',
      days: [1, 3, 5],
      active: 1,
      active_until: null,
      esh: {
        H00: 1,
        H02: 1,
      },
    };
    const result2 = instance.isOneShot(notOneShotSchedule);
    expect(result2).toBeFalsy();
  });

});