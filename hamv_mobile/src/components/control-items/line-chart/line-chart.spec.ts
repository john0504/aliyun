import { Component } from '@angular/core';
import {
  TestBed,
  ComponentFixture,
  getTestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  TranslateModule,
  TranslateLoader,
} from '@ngx-translate/core';
import {
  HttpClientModule,
  HttpClient,
} from '@angular/common/http';
import {
  IonicModule,
} from 'ionic-angular';
import { AppTasks } from 'app-engine';
import { File } from '@ionic-native/file';
import { FileMock } from '@ionic-native-mocks/file';
import { MockComponent } from 'ng-mocks';

import { LineChart } from './line-chart';
import { EchartsCore } from '../../chart-components/echarts-core/echarts-core';
import {
  ComponentProvider,
  InformationModelModule,
} from '../../../modules/information-model';
import { AppTasksMock } from '../../../mocks/app-engine.mocks';

import { createTranslateLoader, } from '../../../mocks/providers.mocks';

describe('Component: Line Chart', () => {

  let component: LineChart;
  let fixture: ComponentFixture<LineChart>;
  let appTasks: AppTasks;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        LineChart,
        MockComponent(EchartsCore)
      ],
      imports: [
        IonicModule.forRoot(LineChart),
        InformationModelModule.forRoot(),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: AppTasks, useClass: AppTasksMock },
        { provide: File, useClass: FileMock },
      ]
    });

    fixture = TestBed.createComponent(LineChart);
    component = fixture.componentInstance;

    const injector = getTestBed();
    appTasks = injector.get(AppTasks);
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component instanceof LineChart).toBeTruthy();
    fixture.detectChanges();
  });

  it('change peroid - month', fakeAsync(() => {
    component.data = { deviceSn: 'deviceSn' };
    const spy = spyOn(appTasks, 'getHistoricalData').and.callFake(() =>
      Promise.resolve([
        { time: '2017-11-09T04:19:44.146545+00:00', value: 0 },
        { time: '2017-11-09T04:19:43.441699+00:00', value: 0 },
        { time: '2017-11-09T04:19:03.580818+00:00', value: 3 },
        { time: '2017-11-09T04:19:22.580818+00:00', value: 'none' },
      ])
    );
    const state = {
      key: 'H03',
      status: {
        min: 16,
        max: 32,
        step: 1,
      },
      default: undefined,
      disableState: false,
      getValueText: v => v + '℃'
    };
    state.status['func'] = 'tempCelsius';
    component.states[0] = state;
    fixture.detectChanges();

    component.changePeriod('month');

    expect(component.dtSelector.period).toEqual('month');
    expect(component._mergeOptions).toBeUndefined();
    tick(600);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(component._mergeOptions).toBeDefined();
    fixture.detectChanges();
  }));

  it('change peroid - day', fakeAsync(() => {
    component.data = { deviceSn: 'deviceSn' };
    const spy = spyOn(appTasks, 'getHistoricalData').and.callFake(() =>
      Promise.resolve([
        { time: '2017-11-09T04:19:44.146545+00:00', value: 0 },
        { time: '2017-11-09T04:19:43.441699+00:00', value: 0 },
        { time: '2017-11-09T04:19:03.580818+00:00', value: 3 },
        { time: '2017-11-09T04:19:22.580818+00:00', value: 'none' },
      ])
    );
    const state = {
      key: 'H03',
      status: {
        min: 16,
        max: 32,
        step: 1,
      },
      default: undefined,
      disableState: false,
      getValueText: v => v + '℃'
    };
    state.status['func'] = 'tempCelsius';
    component.states[0] = state;
    fixture.detectChanges();

    component.changePeriod('day');

    expect(component.dtSelector.period).toEqual('day');
    expect(component._mergeOptions).toBeUndefined();
    tick(600);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(component._mergeOptions).toBeDefined();
    fixture.detectChanges();
  }));

  it('change peroid - year', fakeAsync(() => {
    component.data = { deviceSn: 'deviceSn' };
    const spy = spyOn(appTasks, 'getHistoricalData').and.callFake(() =>
      Promise.resolve([
        { time: '2017-11-09T04:19:44.146545+00:00', value: 0 },
        { time: '2017-11-09T04:19:43.441699+00:00', value: 0 },
        { time: '2017-11-09T04:19:03.580818+00:00', value: 3 },
        { time: '2017-11-09T04:19:22.580818+00:00', value: 'none' },
      ])
    );
    const state = {
      key: 'H03',
      status: {
        min: 16,
        max: 32,
        step: 1,
      },
      default: undefined,
      disableState: false,
      getValueText: v => v + '℃'
    };
    state.status['func'] = 'tempCelsius';
    component.states[0] = state;
    fixture.detectChanges();

    component.changePeriod('year');

    expect(component.dtSelector.period).toEqual('year');
    expect(component._mergeOptions).toBeUndefined();
    tick(600);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(component._mergeOptions).toBeDefined();
    fixture.detectChanges();
  }));

  it('change peroid - week', fakeAsync(() => {
    component.data = { deviceSn: 'deviceSn' };
    const spy = spyOn(appTasks, 'getHistoricalData').and.callFake(() =>
      Promise.resolve([
        {
          time: '2017-11-09T04:19:44.146545+00:00',
          value: {
            avg: 0,
          }
        },
        {
          time: '2017-11-09T04:19:43.441699+00:00',
          value: {
            avg: 0,
          }
        },
        {
          time: '2017-11-09T04:19:03.580818+00:00',
          value: {
            avg: 3,
          }
        },
        {
          time: '2017-11-09T04:19:22.580818+00:00',
          value: {
            avg: 'none',
          }
        },
      ])
    );
    const state = {
      key: 'H03',
      status: {
        min: 16,
        max: 32,
        step: 1,
      },
      default: undefined,
      disableState: false,
      getValueText: v => v + '℃'
    };
    state.status['func'] = 'tempCelsius';
    component.states[0] = state;
    fixture.detectChanges();

    component.changePeriod('day');
    component.changePeriod('week');

    expect(component.dtSelector.period).toEqual('week');
    expect(component._mergeOptions).toBeUndefined();
    tick(600);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(component._mergeOptions).toBeDefined();
    fixture.detectChanges();
  }));

  it('change direction - backward a \'week\'', () => {
    fixture.detectChanges();

    const baseStartTime = component.dtSelector.rangeItem.startTime;
    const baseEndTime = component.dtSelector.rangeItem.endTime;
    component.changeRange(-1);
    fixture.detectChanges();
    expect(component.dtSelector.rangeItem.startTime).toBeLessThan(baseStartTime);
    const startDiff = baseStartTime - component.dtSelector.rangeItem.startTime;
    expect(startDiff).toEqual(604800000); // 7*24*60*60*1000
    expect(component.dtSelector.rangeItem.endTime).toBeLessThan(baseEndTime);
    const endDiff = baseEndTime - component.dtSelector.rangeItem.endTime;
    expect(endDiff).toEqual(604800000);
  });

  it('change direction - backward then forward a \'week\'', () => {
    fixture.detectChanges();

    component.changeRange(-1);
    fixture.detectChanges();

    const baseStartTime = component.dtSelector.rangeItem.startTime;
    const baseEndTime = component.dtSelector.rangeItem.endTime;
    component.changeRange(1);
    fixture.detectChanges();
    expect(component.dtSelector.rangeItem.startTime).toBeGreaterThan(baseStartTime);
    const startDiff = baseStartTime - component.dtSelector.rangeItem.startTime;
    expect(Math.abs(startDiff)).toEqual(604800000);
    expect(component.dtSelector.rangeItem.endTime).toBeGreaterThan(baseEndTime);
    const endDiff = baseEndTime - component.dtSelector.rangeItem.endTime;
    expect(Math.abs(endDiff)).toEqual(604800000);
  });

  it('load data failed - http call error simulation', fakeAsync(() => {
    component.data = { deviceSn: 'deviceSn' };
    const spy = spyOn(appTasks, 'getHistoricalData').and.callFake(() => Promise.reject('http call failed'));
    const state = {
      key: 'H03',
      status: {
        min: 16,
        max: 32,
        step: 1,
      },
      default: undefined,
      disableState: false,
      getValueText: v => v + '℃'
    };
    state.status['func'] = 'tempCelsius';
    component.states[0] = state;
    fixture.detectChanges();

    component.changePeriod('month');

    expect(component.dtSelector.period).toEqual('month');
    expect(component._mergeOptions).toBeUndefined();
    tick(600);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(component._mergeOptions).toBeUndefined();
    fixture.detectChanges();
  }));

  it('load data failed - wrong component data content', fakeAsync(() => {
    const spy = spyOn(appTasks, 'getHistoricalData').and.callThrough();
    const state = {
      key: 'H03',
      status: {
        min: 16,
        max: 32,
        step: 1,
      },
      default: undefined,
      disableState: false,
      getValueText: v => v + '℃'
    };
    state.status['func'] = 'tempCelsius';
    component.states[0] = state;
    fixture.detectChanges();

    component.changePeriod('month');

    expect(component.dtSelector.period).toEqual('month');
    expect(component._mergeOptions).toBeUndefined();
    tick(600);
    fixture.detectChanges();
    expect(spy).not.toHaveBeenCalled();
    expect(component._mergeOptions).toBeUndefined();
    fixture.detectChanges();
  }));

  it('load data success, but no incoming data', fakeAsync(() => {
    component.data = { deviceSn: 'deviceSn' };
    const spy = spyOn(appTasks, 'getHistoricalData').and.callFake(() => Promise.resolve([]));
    const state = {
      key: 'H03',
      status: {
        min: 16,
        max: 32,
        step: 1,
      },
      default: undefined,
      disableState: false,
      getValueText: v => v + '℃'
    };
    state.status['func'] = 'tempCelsius';
    component.states[0] = state;
    fixture.detectChanges();

    component.changePeriod('month');

    expect(component.dtSelector.period).toEqual('month');
    expect(component._mergeOptions).toBeUndefined();
    tick(600);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(component._mergeOptions).toBeDefined();
    fixture.detectChanges();
  }));
});

const EXAMPLE_AC_TEMP = {
  "type": "line-chart",
  "title": "INFORMATION_MODEL.TEMPERATURE",
  "models": [{
    "key": "H03",
    "values": {
      "min": 16,
      "max": 32,
      "step": 1,
      "func": "tempCelsius"
    },
    "disable": [{
      "conditions": [{
        "key": "H00",
        "op": "eq",
        "target": 0
      }]
    }, {
      "conditions": [{
        "key": "H01",
        "op": "gte",
        "target": 2
      }, {
        "key": "H01",
        "op": "lte",
        "target": 3
      }]
    }, {
      "conditions": [{
        "key": "H29",
        "op": "gt",
        "target": 0
      }]
    }]
  }]
};

@Component({
  template: '<ui-component [(ngModel)]="status" [model]="model" color="primary" [data]="data"></ui-component>'
})
class TestChartComponent {
  status = {
    H03: 2,
  };
  model = EXAMPLE_AC_TEMP;
  data = {
    deviceSn: 'deviceSn'
  };
}

describe('Component: Line Chart - lifecycle', () => {

  let cp: ComponentProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestChartComponent,
        LineChart,
        MockComponent(EchartsCore)
      ],
      imports: [
        IonicModule.forRoot(LineChart),
        InformationModelModule.forRoot(),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
          },
        }),
      ],
      providers: [
        { provide: AppTasks, useClass: AppTasksMock },
        { provide: File, useClass: FileMock },
      ]
    });

    const injector = getTestBed();
    cp = injector.get(ComponentProvider);
    cp.registerComponent('line-chart', LineChart);
  });

  afterEach(() => cp.unregisterComponent('line-chart'));

  it('should create', () => {
    const fixture = TestBed.createComponent(TestChartComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    expect(component instanceof TestChartComponent).toBeTruthy();
    fixture.detectChanges();
  });

});
