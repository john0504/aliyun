import {
  Component,
  forwardRef,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppTasks } from 'app-engine';
import {
  Subject,
  Subscription,
} from 'rxjs';
import { empty } from 'rxjs/observable/empty';
import { defer } from 'rxjs/observable/defer';
import {
  catchError,
  debounceTime,
  switchMap,
  map,
} from 'rxjs/operators';
import cloneDeep from 'lodash/cloneDeep';

import {
  ComponentModel,
  ControlItemModel,
  InformationModelService,
  ChartLogic,
  ChartLogicState,
  UIOptions,
  UIComponentBase,
  ValueItem,
} from '../../../modules/information-model';
import { DatetimeSelector } from '../../chart-components/datetime-selector/datetime-selector';
import { DataTransform } from '../../chart-components/data-transform';
import { EchartsDatasetTransform } from '../../chart-components/transform/echarts-dataset-transform';
import { ValueReplacerPipe } from '../../../modules/information-model/pipes/value-replacer/value-replacer';
import { LineChartModel } from './line-chart.model';

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LineChart), multi: true }],
  encapsulation: ViewEncapsulation.None,
})
export class LineChart extends UIComponentBase implements OnInit, OnDestroy {
  title: string = '';
  logics: Array<ChartLogic>;
  states: Array<ChartLogicState>;
  private _ims: InformationModelService;

  private debounceTrigger: Subject<any> = new Subject();
  private downloadWorker: Subscription;

  dtSelector: DatetimeSelector;
  transform: DataTransform;
  aggregateMethod: string = 'avg';
  period = 1;

  _noData: boolean = true;
  _mergeOptions;
  _options;
  _lineChartModel: LineChartModel;
  _pipe = new ValueReplacerPipe();
  _modelCallback = (v, index) => {
    const vText = this.states[index].getValueText(v);
    const tText = this.translate.instant(vText);
    return this._pipe.transform(tText, v);
  }

  constructor(
    ims: InformationModelService,
    private appTasks: AppTasks,
    private translate: TranslateService,
  ) {
    super(ims, 'line-chart', null);
    this._lineChartModel = new LineChartModel();
    this._lineChartModel.valueTextCallback = this._modelCallback;
    this._options = cloneDeep(this._lineChartModel.basicModel);
    this._ims = ims;
    this.logics = [];
    this.states = [];
    this.dtSelector = new DatetimeSelector();
    this.transform = new EchartsDatasetTransform();
  }

  ngOnInit() {
    this.downloadWorker = this.debounceTrigger
      .pipe(
        debounceTime(500),
        switchMap(() => {
          const promises = this.states.map(state => {
            const deviceSn = this.data && this.data.deviceSn;
            return this.requestData(deviceSn, state.key);
          });
          return defer(() => Promise.all(promises))
            .pipe(
              map(results => this.processResults(null, results)),
              catchError(e => {
                this.processResults(e);
                return empty();
              })
            );
        })
      )
      .subscribe();
    this.debounceTrigger.next();
  }

  ngOnDestroy() {
    this.downloadWorker.unsubscribe();
  }

  protected processLayout(model: ComponentModel, values: Array<ValueItem> | UIOptions, key: string, index: number, unitModel: ControlItemModel) {
    if (!values || !model || !unitModel || index !== 0) return;
    this.title = model.title;
    const logic = this.getLogic(index);
    const state = logic.processLayout(values, key, unitModel);
    this.states[index] = state;
  }

  protected processUIState(currentValueState: any, key: string, index: number, model: ControlItemModel) {
    if (!key || index !== 0) return;
    const logic = this.getLogic(index);
    const state = logic.processUIState(currentValueState, key, model);
    this.states[index] = state;
    this.period = model.options ? model.options.period : 1;
  }

  protected processDisableState(disableState, key: string, index: number, model: ControlItemModel) {
    if (!key || index !== 0) return;
    const logic = this.getLogic(index);
    const state = logic.processDisableState(disableState, key, model);
    this.states[index] = state;
  }

  private getLogic(index: number) {
    const logic = this.logics[index] || new ChartLogic(this._ims, this.exoChange);
    this.logics[index] = logic;
    return logic;
  }

  changePeriod(period: string) {
    this.dtSelector.changePeriod(period, () => this.debounceTrigger.next());
  }

  changeRange(direction: number) {
    this.dtSelector.changeRange(direction, false, () => this.debounceTrigger.next());
  }

  private requestData(deviceSn: string, key: string) {
    if (!deviceSn || !key) return Promise.reject('No device SN or field as inputs');
    const range = this.dtSelector.rangeItem;
    let sampling_size;
    switch (this.dtSelector.period) {
      case 'day':
        sampling_size = '1h';
        break;
      case 'week':
        sampling_size = '1d';
        break;
      case 'month':
        sampling_size = '1d';
        break;
      case 'year':
        sampling_size = '30d';
        break;
    }
    return this.appTasks
      .getHistoricalData(deviceSn, key, {
        start_time: range.startTime + 'ms',
        end_time: range.endTime + 'ms',
        order_by: 'asc',
        sampling_size,
        aggregate: this.aggregateMethod
      });
  }

  private processResults(e, results?) {
    if (e) {
      this._noData = true;
      this._options = cloneDeep(this._lineChartModel.basicModel);
      return;
    }
    results.forEach((historicalData, index) => {

      let count = 0;
      let sum = 0;
      historicalData.forEach(element => {
        const v = this.getDataValue(element.value, this.aggregateMethod);
        if (typeof v === 'number') {
          element.value[this.aggregateMethod] = element.value[this.aggregateMethod] / this.period;
          sum += element.value[this.aggregateMethod];
          count++;
        }
      });
      this._noData = count <= 0;
      let avgText = "";
      if (this._noData) {
        avgText = this._modelCallback(-32767, index);
      } else {
        avgText = this._modelCallback(sum / count, index);
      }
      const g = this._lineChartModel.averageTag(avgText);

      const echartModel = this.transform.transform({
        historicalData,
        seriesColumnLayout: true,
        timePeriodFilter: this.dtSelector.period,
        modelInfo: {
          title: this.title,
        },
        aggregate: this.aggregateMethod
      });

      echartModel.graphic = [g];
      this._mergeOptions = echartModel;
    });
  }

  private getDataValue(value: any, aggregate?: string) {
    try {
      if (!aggregate) {
        return value === 'none' || value === -32767 ? undefined : value;
      }

      const v = value[aggregate];
      return this.getDataValue(v);
    } catch {
      return undefined;
    }
  }
}
