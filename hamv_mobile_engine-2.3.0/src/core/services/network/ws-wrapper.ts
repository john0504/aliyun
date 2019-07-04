import { AuthError } from '../../errors/auth-error';
import { NetworkError } from '../../errors/network-error';
import { TimeoutError } from '../../errors/timeout-error';
import { Logger } from '../../../log/log-service';

export interface Authenticator {
    getAuthRequest(): Promise<any>;
    processResponse(res): Promise<any>;
}

export class WebsocketWrapper {

    static idCount = 1;
    static DEFAULT_REQUEST_TIMEOUT = 10000;
    static DEFAULT_CONNECTION_TIMEOUT = 5000;

    static isString(obj: any): boolean {
        return typeof obj === 'string';
    }

    private wsConnectPromise: Promise<any>;
    private ws: WebSocket;
    private responseDefers = {};
    private requestTimeoutIds = {};

    private onOpenCallbacks = [];
    private onEventCallbacks = [];
    private onErrorCallbacks = [];
    private onCloseCallbacks = [];

    private auth: Authenticator;
    private authPromise: Promise<any>;
    private isAuthenticating: boolean = false;
    private isAuthenticated: boolean = false;

    constructor(
      private url: string,
      private protocols?: Array<string>
    ) {
    }

    public setAuthenticator(authenticator: Authenticator) {
        this.auth = authenticator;
    }

    public connect(): Promise<any> {
        if (this.isOpened() ||
            this.getReadyState() === WebSocket.CONNECTING) {
            return this.wsConnectPromise;
        }

        return this.wsConnectPromise = new Promise((resolve, reject) => {
            let ws = this.protocols ?
                new WebSocket(this.url, this.protocols) : new WebSocket(this.url);
            let timeoutId = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    reject(new NetworkError('Websocket open failed.'));
                }
            }, WebsocketWrapper.DEFAULT_CONNECTION_TIMEOUT);

            ws.onopen = (ev: Event) => {
                clearTimeout(timeoutId);
                resolve();
                Logger.log('ws-open');
                this.onOpenHandler(ev);

                ws.onopen = undefined;
                ws.onclose = (ev: CloseEvent) => {
                    this.isAuthenticated = false;
                    Logger.log('ws-close -> ', ev);
                    this.onCloseHandler(ev);
                };
            };
            ws.onerror = (ev: ErrorEvent) => {
                this.isAuthenticated = false;
                Logger.log('ws-error -> ', ev);
                this.onErrorHandler(ev);
            };
            ws.onmessage = (ev: MessageEvent) => {
                Logger.log('ws-onmessage -> ', ev);
                this.onMessageHandler(ev);
            };
            ws.onclose = (ev: CloseEvent) => {
                clearTimeout(timeoutId);
                reject(new NetworkError('Websocket open failed.'));

                this.isAuthenticated = false;
                Logger.log('ws-close -> ', ev);
                this.onCloseHandler(ev);

                ws.onopen = undefined;
                ws.onclose = (ev: CloseEvent) => {
                    this.isAuthenticated = false;
                    Logger.log('ws-close -> ', ev);
                    this.onCloseHandler(ev);
                };
            };

            this.ws = ws;
        });
    }

    public disconnect(code: number = 1000, reason?: string) {
        if (this.ws && this.getReadyState() !== WebSocket.CLOSED) {
            this.ws.close(code, reason);
        }
        this.ws = null;
    }

    private clean() {
        for (let key in this.requestTimeoutIds) {
            let timeoutId = this.requestTimeoutIds[key];
            clearTimeout(timeoutId);
        }
        this.requestTimeoutIds = {};
        for (let key in this.responseDefers) {
            this.rejectRequest(key, new NetworkError('Websocket disconnect'));
        }
        this.responseDefers = {};
    }

    public authenticate(): Promise<any> {
        return this.connect()
            .catch((e) => {
                this.disconnect(4001, 'Websocket open failed.');
                return Promise.reject(e);
            })
            .then(() => {
                return this.isAuthenticated || this.isAuthenticating
                    ? this.authPromise
                    : this.authPromise = this._ca();
            });
    }

    //connection authentication promise
    private _ca(): Promise<any> {
        this.isAuthenticating = true;
        return Promise.resolve()
            .then(() => {
                return this.auth
                    ? this.auth.getAuthRequest()
                    : Promise.reject(new AuthError('No authenticator'));
            })
            .then((request) => {
                return this._send(request);
            })
            .then((res) => {
                return this.auth
                    ? this.auth.processResponse(res)
                    : Promise.reject(new AuthError('Invalid token'));
            })
            .then(() => {
                this.isAuthenticating = false;
                this.isAuthenticated = true;
            })
            .catch((e) => {
                this.isAuthenticating = false;
                if (e instanceof AuthError) {
                    this.disconnect(4003, 'Auth error');
                }
                return Promise.reject(e);
            });
    }

    /**
     * Return Promise, which will be resolved/rejected on server response with the same requestId
     */
    public send(request, timeout?: number): Promise<any> {
        return this.authenticate()
            .then(() => {
                return this._send(request, timeout);
            });
    }

    private _send(request, timeout = WebsocketWrapper.DEFAULT_REQUEST_TIMEOUT): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!request.id) {
                this.ws.send(
                    WebsocketWrapper.isString(request)
                        ? request
                        : JSON.stringify(request)
                );
                resolve();
            } else {
                request.id = WebsocketWrapper.idCount++;
                this.responseDefers[request.id] = {
                    resolve,
                    reject
                };
                this.ws.send(JSON.stringify(request));
                let timeoutId = setTimeout(() => {
                    delete this.requestTimeoutIds[request.id];
                    this.rejectRequest(request.id, new TimeoutError('Request timeout'));
                }, timeout < 0 ? WebsocketWrapper.DEFAULT_REQUEST_TIMEOUT : timeout);
                this.requestTimeoutIds[request.id] = timeoutId;
                Logger.log('request => ', request);
            }
        });
    }

    private onMessageHandler(message: MessageEvent) {
        let res;
        try {
            res = JSON.parse(message.data);
        } catch (e) {
            res = message.data;
        }

        if (res && res.id) {
            if (!!this.requestTimeoutIds[res.id]) {
                let timeoutId = this.requestTimeoutIds[res.id];
                clearTimeout(timeoutId);
                delete this.requestTimeoutIds[res.id];
                this.resolveRequest(res.id, res);
            }
        } else {
            this.onEventHandler(message);
        }
    }

    private resolveRequest(requestId, response) {
        if (this.responseDefers[requestId]) {
            this.responseDefers[requestId].resolve(response);
            delete this.responseDefers[requestId];
        }
    }

    private rejectRequest(requestId, message) {
        if (this.responseDefers[requestId]) {
            this.responseDefers[requestId].reject(message);
            delete this.responseDefers[requestId];
        }
    }

    public onOpen(cb) {
        cb && this.onOpenCallbacks.push(cb);
    }

    public onEvent(cb) {
        cb && this.onEventCallbacks.push(cb);
    }

    public onClose(cb) {
        cb && this.onCloseCallbacks.push(cb);
    }

    public onError(cb) {
        cb && this.onErrorCallbacks.push(cb);
    }

    private onOpenHandler(event: Event) {
        this.notifyOpenCallbacks(event);
    }

    private notifyOpenCallbacks(event) {
        for (let i = 0; i < this.onOpenCallbacks.length; i++) {
            this.onOpenCallbacks[i].call(this, event);
        }
    }

    private onEventHandler(message: MessageEvent) {
        for (let i = 0; i < this.onEventCallbacks.length; i++) {
            this.onEventCallbacks[i].call(this, message);
        }
    }

    private onCloseHandler(event: CloseEvent) {
        this.notifyCloseCallbacks(event);
        this.clean();
    }

    private notifyCloseCallbacks(event) {
        for (let i = 0; i < this.onCloseCallbacks.length; i++) {
            this.onCloseCallbacks[i].call(this, event);
        }
    }

    private onErrorHandler(event) {
        this.notifyErrorCallbacks(event);
    }

    private notifyErrorCallbacks(event) {
        for (let i = 0; i < this.onErrorCallbacks.length; i++) {
            this.onErrorCallbacks[i].call(this, event);
        }
    }

    public isOpened() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    public getReadyState() {
        if (!this.ws) {
            return -1;
        }
        return this.ws.readyState;
    }
}
