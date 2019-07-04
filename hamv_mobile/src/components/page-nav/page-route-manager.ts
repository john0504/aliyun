import { Injectable } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';

import {
  appPageConfig,
  PageInterface,
} from '../../app/app.routes';

@Injectable()
export class PageRouteManager {

  private _config: { [key: string]: PageInterface };

  set config(config: { [key: string]: PageInterface }) {
    this._config = config;
  }

  get config() {
    return this._config;
  }

  constructor() {
    this._config = cloneDeep(appPageConfig);
  }

  //TODO: can do more check in here
  public getPage(page: string): string {
    const item = this._config && this._config[page];
    return item && item.target ? item.target : page;
  }
}