import { TestBed, getTestBed } from '@angular/core/testing';
import { MockNgRedux, NgReduxTestingModule } from '@angular-redux/store/testing';
import { Subject } from 'rxjs/Subject';

import { ErrorsService } from './errors-service';
import { StateStore } from '../store/state-store';

describe('Errors service', () => {

  let instance: ErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgReduxTestingModule,
      ],
      providers: [
        StateStore,
        ErrorsService,
      ],
    });

    const injector = getTestBed();
    instance = injector.get(ErrorsService);
    expect(instance).toBeTruthy();
  });

  afterEach(() => MockNgRedux.reset());

  it('can subscribe errors service subject', () => {
    const subject = instance.getSubject();
    expect(subject instanceof Subject).toBeTruthy();

    const subscription = subject.subscribe();
    expect(subscription.closed).toBeFalsy();
    subscription.unsubscribe();
    expect(subscription.closed).toBeTruthy();
  });

  it('can broadcast remove errors actions', () => {
    const stub = MockNgRedux.getSelectorStub(['errors']);
    stub.next([new Error('abcde')]);
    stub.complete();
  });

  it('stop broadcasting errors actions when errors array is empty', () => {
    const stub = MockNgRedux.getSelectorStub(['errors']);
    stub.next([]);
    stub.complete();
  });

});