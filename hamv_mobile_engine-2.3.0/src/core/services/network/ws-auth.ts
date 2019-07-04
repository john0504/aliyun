import { Injectable } from '@angular/core';

import { AuthError } from '../../errors/auth-error';

import { Authenticator } from './ws-wrapper';
import { AccountService } from '../account/account-service';
import { MuranoApiService } from './murano-api-service';

@Injectable()
export class WebsocketAuth implements Authenticator {

    constructor(private accountService: AccountService) {
    }

    public getAuthRequest(): Promise<any> {
        return this.accountService.getAccount()
            .then((user) => {
                if (user && user.token) {
                    let token = user.token;
                    return Promise.resolve<any>({
                        id: 'ws-request-auth',
                        request: 'login',
                        data: {
                            token,
                        },
                    });
                } else {
                    return Promise.reject(new AuthError('No token'));
                }
            });
    }

    public processResponse(res): Promise<any> {
        if (res.status &&
            res.status.toUpperCase() === MuranoApiService.STATUS_OK.toUpperCase()) {
            return Promise.resolve(true);
        } else {
            return Promise.reject(new AuthError(res.message || 'Invalid token'));
        }
    }
}
