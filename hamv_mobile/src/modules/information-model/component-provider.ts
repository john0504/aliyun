import { Injectable } from '@angular/core';

@Injectable()
export class ComponentProvider {

  private _componentMap: Map<string, any>;

    constructor() {
        this._componentMap = new Map<string, any>();
    }

    public registerComponent(key, component) {
        this._componentMap.set(key, component);
    }

    public getComponent(key): any {
        return this._componentMap.get(key);
    }

    public unregisterComponent(key) {
        this._componentMap.delete(key);
    }
}
