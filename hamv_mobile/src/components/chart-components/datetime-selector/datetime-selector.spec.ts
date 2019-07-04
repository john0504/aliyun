import { DatetimeSelector } from './datetime-selector';
import * as moment from 'moment-timezone';
import * as TimeShift from 'timeshift-js';

describe('Test datetime selector', () => {

  let instance: DatetimeSelector;

  beforeEach(() => {
    window['Date'] = TimeShift.Date;
    TimeShift.setTime(moment.tz('2017-11-09T04:19:44.146545+00:00', 'Asia/Taipei').toDate());
    TimeShift.setTimezoneOffset(-480);
    instance = new DatetimeSelector();
  });

  afterEach(() => window['Date'] = TimeShift.OriginalDate);

  it('init state', () => {
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);

    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000,
    });
  });

  it('change period - day', () => {
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);

    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000,
    });

    instance.changePeriod('day');
    expect(instance.period).toEqual('day');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 9, 2017',
      startTime: 1510156800000,
      endTime: 1510243199000
    });
  });

  it('change period - month', () => {
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000,
    });

    instance.changePeriod('month');
    expect(instance.period).toEqual('month');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 2017',
      startTime: 1509465600000,
      endTime: 1512057599000
    });
  });

  it('change period - year', () => {
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000,
    });

    instance.changePeriod('year');
    expect(instance.period).toEqual('year');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: '2017',
      startTime: 1483200000000,
      endTime: 1514735999000
    });
  });

  it('change period - same period', () => {
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000,
    });

    instance.changePeriod('day');
    expect(instance.period).toEqual('day');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 9, 2017',
      startTime: 1510156800000,
      endTime: 1510243199000
    });

    instance.changePeriod('day');
    expect(instance.period).toEqual('day');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 9, 2017',
      startTime: 1510156800000,
      endTime: 1510243199000
    });
  });

  it('change range - backward then forward', () => {
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000,
    });

    instance.changeRange(-1, false);
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Oct 29 - Nov 04, 2017',
      startTime: 1509206400000,
      endTime: 1509811199000
    });

    instance.changeRange(1, false);
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000
    });
  });

  it('change range - forward to future', () => {
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000,
    });

    instance.changeRange(-1, false);
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Oct 29 - Nov 04, 2017',
      startTime: 1509206400000,
      endTime: 1509811199000
    });

    instance.changeRange(1, false);
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000
    });

    instance.changeRange(1, false);
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000
    });
  });

  it('test callback', () => {
    expect(instance.period).toEqual('week');
    expect(instance.base).toEqual(1510156800000);
    expect(instance.rangeItem).toEqual({
      rangeText: 'Nov 05 - 11, 2017',
      startTime: 1509811200000,
      endTime: 1510415999000,
    });

    const spy = spyOn(console, 'log').and.callThrough();
    expect(spy).not.toHaveBeenCalled();
    const cb = () => {
      console.log('callback triggered');
    };
    instance.changePeriod('day', cb);
    expect(spy).toHaveBeenCalledWith('callback triggered');
  });
});