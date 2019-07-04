import { Injectable } from '@angular/core';

@Injectable()
export class ViewStateService {

    private _viewStateMap: Map<string, any>;

    constructor() {
        this._viewStateMap = new Map<string, any>();
    }

    public setViewState(key, viewState) {
        this._viewStateMap.set(key, viewState);
    }

    public getViewState(key): any {
        return this._viewStateMap.get(key);
    }

    public clearAll() {
        this._viewStateMap.clear();
    }
}
