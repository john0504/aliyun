import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import {
    Modal,
    ModalController,
} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { mergeMap } from 'rxjs/operators';

import { Account } from '../../core/models/account';
import { AuthError } from '../../core/errors/auth-error';
import { AccountError } from '../../core/errors/account-error';
import { HttpError } from '../../core/errors/http-error';
import { NetworkError } from '../../core/errors/network-error';
import { Util } from '../../core/utils/util';
import { AppActions } from '../actions/app-actions';
import { AppTasks } from '../actions/app-tasks';
import { ErrorsService } from './errors-service';
import { Logger } from '../../log/log-service';
import { StateStore } from '../store/state-store';

@Injectable()
export class AuthService {

    private subs: Array<Subscription>;
    private isAuthenticated$: Observable<any>;
    private isAuthenticated: boolean = false;
    private account$: Observable<any>;
    private account: Account;

    private retryAttempts: number = 0;

    private loginModal: Modal;
    private loginPage;

    constructor(
        private errorsService: ErrorsService,
        private appTasks: AppTasks,
        private network: Network,
        private stateStore: StateStore,
        public modalCtrl: ModalController,
    ) {
        this.subs = [];
        this.isAuthenticated$ = this.stateStore.isAuthenticated$;
        this.account$ = this.stateStore.account$;
    }

    public setLoginPage(loginPage) {
        this.loginPage = loginPage;
    }

    public start() {
        this.appTasks.getAccountTask();
        this.subs.push(
            this.errorsService.getSubject()
                .subscribe((error) => {
                    this.handleErrors(error);
                })
        );
        this.subs.push(
            this.isAuthenticated$
                .subscribe((isAuthenticated) => {
                    this._auth(isAuthenticated);
                })
        );
        this.subs.push(
            this.account$
                .subscribe((account) => {
                    this.account = account;
                    if (account && !account.isLoggedIn) {
                        this.goLoginPage();
                    }
                })
        );
        this.subs.push(
            this.network.onConnect()
                .pipe(mergeMap(() => this.isAuthenticated$))
                .subscribe((isAuthenticated) => {
                    this._auth(isAuthenticated);
                })
        );
    }

    private _auth(isAuthenticated) {
        Logger.log('here - isAuthenticated = ' + isAuthenticated);
        if (!isAuthenticated) {
            this.appTasks.sessionTask();
        } else if (!this.isAuthenticated) {
            // this.appTasks.wsRequestLoginTask();
        }
        this.isAuthenticated = isAuthenticated;
    }

    public stop() {
        this.subs && this.subs.forEach((s) => {
            s.unsubscribe();
        });
        this.subs.length = 0;
    }

    private handleErrors(a) {
        switch (a.type) {
            case AppActions.SESSION_DONE:
                const err = a.payload;
                if (err instanceof AuthError) {
                    this.appTasks.refreshTokenTask();
                } else if (err instanceof AccountError) {
                    if (err.code === 404) {
                        this.goLoginPage(true);
                    } else {
                        this.goLoginPage();
                    }
                } else if (err instanceof NetworkError || err instanceof HttpError) {
                    this.retryLater();
                } else {
                    this.retryLater();
                }
                break;
            case AppActions.REFRESH_TOKEN_DONE:
                this.goLoginPage();
                break;
        }
    }

    private goLoginPage(clean: boolean = false) {
        if (clean) {
            this.appTasks.removeAllDataTask()
                .then(() => this.goLoginPage());
        } else if (this.account && this.account.isOAuth) {
            this.appTasks.logoutTask()
                .then(() => this.openLoginPage());
        } else {
            this.openLoginPage();
        }
    }

    private openLoginPage() {
        if (!this.loginModal) {
            this.loginModal = this.modalCtrl.create(this.loginPage, null, {
                showBackdrop: false,
                enableBackdropDismiss: false,
                cssClass: 'app-start-modal',
            });
            this.loginModal.onWillDismiss(() => {
                this.loginModal = null;
            });
            this.loginModal.present();
        }
    }

    private retryLater() {
        let backoffDelay = Util.getBackoffDelay(++this.retryAttempts, 5000, 30000);
        setTimeout(() => {
            if (!this.isAuthenticated) {
                this.appTasks.sessionTask();
            } else {
                this.retryAttempts = 0;
            }
        }, backoffDelay);
        Logger.log('backoffDelay => ', backoffDelay);
    }

}
