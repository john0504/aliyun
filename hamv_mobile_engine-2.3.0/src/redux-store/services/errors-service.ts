import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AppActions } from '../actions/app-actions';
import { StateStore } from '../store/state-store';

@Injectable()
export class ErrorsService {

    private errors$: Observable<any>;
    private subject: Subject<any>;
    private e;

    constructor(
        private ngRedux: NgRedux<any>,
        private stateStore: StateStore,
    ) {
        this.subject = new Subject<any>();
        this.errors$ = this.stateStore.error$;
        this.errors$
            .subscribe((errors) => {
                if (errors && errors.length > 0 && this.e !== errors[0]) {
                    this.e = errors[0];
                    this.subject.next(this.e);
                    this.ngRedux.dispatch(AppActions.action(AppActions.REMOVE_ERROR, this.e));
                }
            });
    }

    public getSubject(): Subject<any> {
        return this.subject;
    }
}
