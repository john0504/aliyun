import { Component, Input } from '@angular/core';

@Component({
  selector: 'echarts-core',
  templateUrl: 'echarts-core.html'
})
export class EchartsCore {

  @Input()
  set initOptions(val) {
    this._initOptions = val;
  }

  @Input()
  set options(val) {
    this._options = val;
  }

  @Input()
  set merge(mergeOptions) {
    if (mergeOptions) {
      this._mergeOptions = mergeOptions;
    }
  }

  @Input()
  set loading(val: boolean) {
    this._loading = val;
    if (val) {
      this._empty = false;
    }
  }

  @Input()
  set loadingOptions(val) {
    this._loadingOptions = val;
  }

  @Input()
  set empty(val: boolean) {
    this._empty = val && !this._loading;
    if (this._empty) {
      this._loading = false;
    }
  }

  protected chartsIntance;
  _initOptions;
  _options;
  _mergeOptions;
  private _loading: boolean = false;
  _loadingOptions;
  private _empty: boolean = false;

  constructor() {}

  onChartInit(ec) {
    this.chartsIntance = ec;
  }

}
