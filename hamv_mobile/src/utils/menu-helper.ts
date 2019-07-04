import { Menu } from 'ionic-angular';
import remove from 'lodash/remove';

export class MenuHelper {

    private _menu: Menu;
    private listeners: Array<any>;

    constructor(menu: Menu) {
        this._menu = menu;
        this.listeners = [];
    }

    public enable(enable: boolean) {
        this._menu.enable(enable);
    }

    public addListener(id: string, event: string, handler, capture?: boolean) {
        let e = this.getElement(id);
        if (!e) return;
        e.addEventListener(event, handler, capture);
        this.listeners.push({
            element: e,
            event: event,
            handler: handler,
            capture: capture
        });
    }

    public removeListener(id: string) {
        let e = this.listeners.find((value) => {
            return value.element.id === id;
        });
        if (!e) return;
        e.element.removeEventListener(e.event, e.handler, e.capture);
        remove(this.listeners, (value) => {
            return value.element.id === id;
        });
    }

    public clear() {
        this.listeners.forEach((e) => {
            e.element.removeEventListener(e.event, e.handler, e.capture);
        });
        this.listeners.length = 0;
    }

    public getElement(id: string): Element {
        return this._menu.getNativeElement().querySelector(id);
    }
}
