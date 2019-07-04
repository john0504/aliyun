import { ScheduleRepeatTime } from './schedule-repeat-time';
import { createTranslateLoader } from '../../mocks/providers.mocks';

describe('Check Schedule Repeat Time', () => {

  let instance: ScheduleRepeatTime;

  beforeEach(() => {
    const translateService = jasmine.createSpyObj('TranslateService', ['instant']);
    translateService.instant.and.callFake(key => key);
    instance = new ScheduleRepeatTime(translateService);
  });

  it('transform weekdays array', () => {
    //ususal case
    expect(instance.transform({ days: [1, 2, 3], active_until: null })).toEqual('SCHEDULE_REPEAT_TIME.MONDAY, SCHEDULE_REPEAT_TIME.TUESDAY, SCHEDULE_REPEAT_TIME.WEDNESDAY');
    expect(instance.transform({ days: [3, 2, 1], active_until: null })).toEqual('SCHEDULE_REPEAT_TIME.MONDAY, SCHEDULE_REPEAT_TIME.TUESDAY, SCHEDULE_REPEAT_TIME.WEDNESDAY');
    expect(instance.transform({ days: [4, 5, 6, 7], active_until: null })).toEqual('SCHEDULE_REPEAT_TIME.THURSDAY, SCHEDULE_REPEAT_TIME.FRIDAY, SCHEDULE_REPEAT_TIME.SATURDAY, SCHEDULE_REPEAT_TIME.SUNDAY');
    expect(instance.transform({ days: [6, 7], active_until: null })).toEqual('SCHEDULE_REPEAT_TIME.WEEKENDS');
    expect(instance.transform({ days: [1, 2, 3, 4, 5], active_until: null })).toEqual('SCHEDULE_REPEAT_TIME.WEEKDAYS');
    expect(instance.transform({ days: [1, 2, 3, 4, 5, 6, 7], active_until: null })).toEqual('SCHEDULE_REPEAT_TIME.EVERY_DAY');
    expect(instance.transform({ days: [2], active_until: 1 })).toEqual('');

    //dunno case
    expect(instance.transform({ days: [1, 2], active_until: 1 })).toEqual('SCHEDULE_REPEAT_TIME.MONDAY, SCHEDULE_REPEAT_TIME.TUESDAY');

    //should not use case
    expect(instance.transform({ days: [1], active_until: 1 })).toEqual('');
    expect(instance.transform({ days: [], active_until: null })).toEqual('');
  });

  it('transform illegal case', () => {
    try {
      instance.transform({ days: 'abc', active_until: 1 });
    } catch (e) {
      expect(e instanceof TypeError).toBeTruthy();
      expect(e.message).toEqual('days.sort is not a function');
    }
  });
});