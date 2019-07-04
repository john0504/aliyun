import { TestBed, getTestBed } from '@angular/core/testing';
import { RemarkTime } from './remark-time';

describe('Check remark time pipe', () => {

  let instance: RemarkTime;

  beforeAll(() => {
    instance = new RemarkTime();
  });

  it('transform time string', () => {
    expect(instance.transform('08:10')).toEqual('8:10 AM');
    expect(instance.transform('10:10')).toEqual('10:10 AM');
    expect(instance.transform('12:10')).toEqual('12:10 PM');
    expect(instance.transform('20:10')).toEqual('8:10 PM');
    expect(instance.transform('22:10')).toEqual('10:10 PM');
    expect(instance.transform('00:10')).toEqual('0:10 AM');

    expect(instance.transform('2x:10')).toEqual('');
    expect(instance.transform('abc')).toEqual('');
    expect(instance.transform('21:z4')).toEqual('');
    expect(instance.transform('')).toEqual('');
    expect(instance.transform(' 21:10')).toEqual('');
    expect(instance.transform('21:10 PM')).toEqual('');
    expect(instance.transform('21:10 ')).toEqual('');
    expect(instance.transform('10:10 PM')).toEqual('');
  });

});