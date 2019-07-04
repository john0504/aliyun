import { Injectable } from '@angular/core';

import { AppEngineTasks } from './tasks/app-engine-tasks';
import { WebsocketEventType } from './models/ws-message';

@Injectable()
export class WebSocketMessageDispatcher {

    private eventCommands;
    private subscribers;

    constructor(private appEngineTasks: AppEngineTasks) {

        this.eventCommands = {};
        this.eventCommands[WebsocketEventType.TOKEN_EXPIRED] = (res) => {
            return this.appEngineTasks.wsEventTokenExpiredTask(res);
        };
        this.eventCommands[WebsocketEventType.DEVICE_CHANGE] = (res) => {
            return this.appEngineTasks.wsEventDeviceChangeTask(res);
        };
        this.eventCommands[WebsocketEventType.ADD_DEVICE] = (res) => {
            return this.appEngineTasks.wsEventAddDeviceTask(res);
        };
        this.eventCommands[WebsocketEventType.DELETE_DEVICE] = (res) => {
            return this.appEngineTasks.wsEventDeleteDeviceTask(res);
        };
        this.eventCommands[WebsocketEventType.SET_GROUP] = (res) => {
            return this.appEngineTasks.wsEventSetGroupTask(res);
        };
        this.eventCommands[WebsocketEventType.DELETE_GROUP] = (res) => {
            return this.appEngineTasks.wsEventDeleteGroupTask(res);
        };
        this.eventCommands[WebsocketEventType.CALENDAR] = (res) => {
            return this.appEngineTasks.wsEventCalendarTask(res);
        };
        this.eventCommands[WebsocketEventType.USER_DATA_CHANGE] = (res) => {
            return this.appEngineTasks.wsEventUserDataChangeTask(res);
        };
        this.eventCommands['UNKNOWN_EVENT'] = (res) => {
            return Promise.resolve();
        };

        this.subscribers = {};
    }

    public onEventReceived(message) {
        let res = message.data ? JSON.parse(message.data) : null;
        if (res && res.event) {
            let eventPromise;
            if (this.eventCommands[res.event]) {
                eventPromise = this.eventCommands[res.event](res);
            } else {
                eventPromise = this.eventCommands['UNKNOWN_EVENT'](res);
            }
            eventPromise
                .then(() => {
                    const s = this.subscribers[res.event];
                    if (s && s.next) s.next(res);
                })
                .catch((error) => {
                    const s = this.subscribers[res.event];
                    if (s && s.error) s.error(error);
                });
        }
    }

    public subscribe(eventId: string, next: Function, error?: Function) {
        this.subscribers[eventId] = { next, error };
    }

    public unsubscribe(eventId: string) {
        if (this.subscribers[eventId]) {
            delete this.subscribers[eventId];
        }
    }
}
