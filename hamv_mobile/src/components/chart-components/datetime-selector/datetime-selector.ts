import {
  DT_DAY,
  DT_WEEK,
  DT_MONTH,
  DT_YEAR,
} from './datetime-functions';

export class DatetimeSelector {

  period: string;
  base: number;
  private _dtWorkers: Map<string, Function>;

  public rangeItem: {
    startTime?,
    endTime?,
    rangeText,
  };

  constructor() {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    this.period = '';
    this.base = current.getTime();

    this.rangeItem = {
      rangeText: ''
    };

    this._dtWorkers = new Map<string, Function>();
    this._dtWorkers.set('day', DT_DAY);
    this._dtWorkers.set('week', DT_WEEK);
    this._dtWorkers.set('month', DT_MONTH);
    this._dtWorkers.set('year', DT_YEAR);

    this.changePeriod();
  }

  public changePeriod(period: string = 'day', callback?) {
    if (period === this.period) return;
    this.period = period;
    this.changeRange(0, true, callback);
  }

  public changeRange(direction: number, reset: boolean, callback?) {
    const range = this.rangeItem;
    if (direction > 0 && !this.canForward()) return;
    const marker = reset ? new Date(this.base) : new Date(range.startTime);
    const worker = this._dtWorkers.get(this.period) || DT_WEEK;
    this.rangeItem = worker(marker, direction);
    callback && callback();
  }

  public canForward(): boolean {
    return this.rangeItem.endTime <= this.base;
  }

}