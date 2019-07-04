import { NgModule } from '@angular/core';
import { NgRedux, NgReduxModule } from '@angular-redux/store';
import { Middleware, combineReducers } from 'redux';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AppEngine } from '../core/app-engine';
import { AppEngineModule } from '../core/app-engine.module';
import { WebsocketEventType } from '../core/models/ws-message';
import { Util } from '../core/utils/util';
import { Logger } from '../log/log-service';
import { AppActions } from './actions/app-actions';
import { AppTasks } from './actions/app-tasks';
import appReducer  from './reducers/app-reducer';
import errors from './reducers/errors';
import { AuthService } from './services/auth-service';
import { ErrorsService } from './services/errors-service';
import { StateStore } from './store/state-store';

@NgModule({
    imports: [
        NgReduxModule,
        AppEngineModule,
    ],
    providers: [
        AppTasks,
        AuthService,
        ErrorsService,
        StateStore,
    ],
})
export class ReduxModule {

    private pageReducers;
    private middlewares: Array<Middleware>;

    private subs: Array<Subscription>;
    private isAuthenticated$: Observable<any>;
    private isAuthenticated: boolean;
    private loginTask;
    private reconnectAttempts = 0;

    constructor(
        private ngRedux: NgRedux<any>,
        private appEngine: AppEngine,
        private appTasks: AppTasks,
        private authService: AuthService,
        private stateStore: StateStore,
    ) {
        this.pageReducers = {};
        this.middlewares = [];
        this.subs = [];
        this.isAuthenticated$ = this.stateStore.isAuthenticated$;
    }

    public configureStore(pageReducers) {
        Logger.log('configureStore');
        this.pageReducers = pageReducers;
        let r = this._createReducer(this.pageReducers);
        let m = this.middlewares;
        let e = [];
        this.ngRedux.configureStore(r, {}, m, e);
    }

    public injectReducer(name, reducer) {
        this.pageReducers[name] = reducer;
        this.ngRedux.replaceReducer(this._createReducer(this.pageReducers));
    }

    private _createReducer(reducers) {
        let r = Object.assign({}, reducers, { core: appReducer, errors: errors, });
        return combineReducers<any>(r as any);
    }

    public applyMiddleWare(middlewares: Array<Middleware>) {
        this.middlewares = middlewares;
    }

    public setLoginPage(loginPage) {
        this.authService.setLoginPage(loginPage);
    }

    public start() {
        this.authService.start();
        this.appEngine.setDnssdCallbacks({
            dnssdCallback: (serviceList) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.UPDATE_DNSSD_LIST, serviceList));
            }
        });

        this.appEngine.setWebsocketCallbacks({
            onOpen: (open) => {
                this.reconnectAttempts = 0;
            },
            onClose: (close) => {
                this.reconnect();
            },
        });

        this.appEngine.subscribe(
            WebsocketEventType.TOKEN_EXPIRED,
            () => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_TOKEN_EXPIRED));
            },
            (error) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_TOKEN_EXPIRED, error, true));
            }
        );

        this.appEngine.subscribe(
            WebsocketEventType.DEVICE_CHANGE,
            (res) => {
                this.appTasks.refreshDevicesTask([res.data.device]);
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_DEVICE_CHANGE, res));
            },
            (error) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_DEVICE_CHANGE, error, true));
            }
        );

        this.appEngine.subscribe(
            WebsocketEventType.ADD_DEVICE,
            (res) => {
                // this.appTasks.wsRequestGetTask(res.data.device);
                this.appTasks.filterDevicesTask();
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_ADD_DEVICE, res));
            },
            (error) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_ADD_DEVICE, error, true));
            }
        );

        this.appEngine.subscribe(
            WebsocketEventType.DELETE_DEVICE,
            (res) => {
                this.appTasks.refreshGroupsTask();
                this.appTasks.refreshDevicesTask([res.data.device]);
                this.appTasks.filterDevicesTask();
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_DELETE_DEVICE, res));
            },
            (error) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_DELETE_DEVICE, error, true));
            }
        );

        this.appEngine.subscribe(
            WebsocketEventType.SET_GROUP,
            (res) => {
                this.appTasks.refreshGroupsTask([res.data.name]);
                this.appTasks.refreshDevicesTask();
                this.appTasks.filterGroupsTask();
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_SET_GROUP, res));
            },
            (error) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_SET_GROUP, error, true));
            }
        );

        this.appEngine.subscribe(
            WebsocketEventType.DELETE_GROUP,
            (res) => {
                this.appTasks.refreshDevicesTask();
                this.appTasks.refreshGroupsTask([res.data.name]);
                this.appTasks.filterGroupsTask();
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_DELETE_GROUP, res));
            },
            (error) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_DELETE_GROUP, error, true));
            }
        );

        this.appEngine.subscribe(
            WebsocketEventType.CALENDAR,
            (res) => {
                this.appTasks.refreshDevicesTask([res.data.device]);
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_CALENDAR, res));
            },
            (error) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_CALENDAR, error, true));
            }
        );

        this.appEngine.subscribe(
            WebsocketEventType.USER_DATA_CHANGE,
            (res) => {
                this.appTasks.getUserDataTask();
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_USER_DATA_CHANGE, res));
            },
            (error) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_USER_DATA_CHANGE, error, true));
            }
        );

        this.appEngine.subscribe(
            'UNKNOWN_EVENT',
            (res) => {
                this.ngRedux.dispatch(AppActions.action(AppActions.WS_EVENT_UNKNOWN));
            }
        );

        this.subs.push(
            this.isAuthenticated$
                .subscribe((isAuthenticated) => {
                    this.isAuthenticated = isAuthenticated;
                    if (isAuthenticated) this.startTasks();
                })
        );
    }

    private reconnect() {
        if (this.loginTask) return;
        let backoffDelay = Util.getBackoffDelay(++this.reconnectAttempts, 500, 10000);
        setTimeout(() => {
            if (this.isAuthenticated) {
                // this.loginTask = this.appTasks.wsRequestLoginTask()
                //     .then(() => {
                //         this.reconnectAttempts = 0;
                //         this.loginTask = null;
                //         return this.startTasks();
                //     })
                //     .catch(() => {
                //         this.loginTask = null;
                //         this.reconnect();
                //     });
            } else {
                this.reconnectAttempts = 0;
                this.loginTask = null;
            }
        }, backoffDelay);
        Logger.log('reconnectAttempts = ' + this.reconnectAttempts
            + ', backoffDelay = ' + backoffDelay);
    }

    private startTasks(): Promise<any> {
        return Promise
            .all([
                // this.appTasks.wsRequestProvisionTokenTask(),
                // this.appTasks.wsRequestListDeviceTask(),
                // this.appTasks.wsRequestListGroupTask(),
                // this.appTasks.wsRequestGetUserDataTask(),
                // this.appTasks.wsRequestGetMeTask(),
            ])
            .catch((errors) => {
                Logger.log('errors => ', errors);
                if (this.isAuthenticated) {
                    setTimeout(() => {
                        this.startTasks();
                    }, 15000);
                }
            });
    }

    public stop() {
        this.authService.stop();
        this.subs && this.subs.forEach((s) => {
            s.unsubscribe();
        });
        this.subs.length = 0;
        this.appEngine.unsubscribe(WebsocketEventType.TOKEN_EXPIRED);
        this.appEngine.unsubscribe(WebsocketEventType.DEVICE_CHANGE);
        this.appEngine.unsubscribe(WebsocketEventType.ADD_DEVICE);
        this.appEngine.unsubscribe(WebsocketEventType.DELETE_DEVICE);
        this.appEngine.unsubscribe(WebsocketEventType.SET_GROUP);
        this.appEngine.unsubscribe(WebsocketEventType.DELETE_GROUP);
        this.appEngine.unsubscribe(WebsocketEventType.CALENDAR);
        this.appEngine.unsubscribe(WebsocketEventType.USER_DATA_CHANGE);
        this.appEngine.unsubscribe('UNKNOWN_EVENT');
    }
}
