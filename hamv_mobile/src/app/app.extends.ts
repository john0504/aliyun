import { Observable } from 'rxjs/Observable';
import { concat } from 'rxjs/observable/concat';
import { timer } from 'rxjs/observable/timer';
import { debounceTime, delayWhen, distinctUntilChanged, first, startWith, scan, retryWhen } from 'rxjs/operators';
import { Util } from 'app-engine';

export const debounceImmediate = (dueTime: number) => <T>(source: Observable<T>) =>
  concat(source.pipe(first()), source.pipe(debounceTime(dueTime))).pipe(distinctUntilChanged());

export const retryWithBackoffDelay = () => <T>(source: Observable<T>) =>
  source.pipe(
    retryWhen(error => error
      .pipe(
        startWith(0),
        scan(count => ++count),
        delayWhen(count => timer(Util.getBackoffDelay(count))),
      ),
    ),
  );
