import { EchartsDatasetTransform } from './echarts-dataset-transform';

describe('Test Echarts Dataset Transform', () => {

  let instance: EchartsDatasetTransform;

  beforeEach(() => {
    instance = new EchartsDatasetTransform();
  });

  it('test transform - row layout', () => {
    const historicalData = [
      { time: '2017-11-09T04:19:44.146545+00:00', value: 0 },
      { time: '2017-11-09T04:19:43.441699+00:00', value: 0 },
      { time: '2017-11-09T04:19:03.580818+00:00', value: 3 },
    ];
    const settings = {
      historicalData,
      seriesColumnLayout: false,
      modelInfo: {
        title: 'Temperature'
      }
    };
    expect(instance.transform(settings))
      .toEqual({
        dataset: {
          source: [
            ['dateTime', '11/09', '11/09', '11/09'],
            ['Temperature', 0, 0, 3],
          ]
        },
      });
  });

  it('test transform - column layout', () => {
    const historicalData = [
      { time: '2017-11-09T04:19:44.146545+00:00', value: 0 },
      { time: '2017-11-09T04:19:43.441699+00:00', value: 0 },
      { time: '2017-11-09T04:19:03.580818+00:00', value: 3 },
    ];
    const settings = {
      historicalData,
      seriesColumnLayout: true,
      modelInfo: {
        title: 'Temperature'
      }
    };
    expect(instance.transform(settings))
      .toEqual({
        dataset: {
          dimensions: ['dateTime', 'Temperature'],
          source: [
            ['11/09', 0],
            ['11/09', 0],
            ['11/09', 3],
          ]
        },
      });
  });

  it('test transform - timePeriodFilter: day', () => {
    const historicalData = [
      { time: '2017-11-09T04:19:44.146545', value: 0 },
      { time: '2017-11-09T05:19:43.441699', value: 0 },
      { time: '2017-11-09T11:19:03.580818', value: 3 },
    ];
    const settings = {
      historicalData,
      seriesColumnLayout: true,
      timePeriodFilter: 'day',
      modelInfo: {
        title: 'Temperature',
      }
    };
    expect(instance.transform(settings))
      .toEqual({
        dataset: {
          dimensions: ['dateTime', 'Temperature'],
          source: [
            ['4:00 am', 0],
            ['5:00 am', 0],
            ['11:00 am', 3],
          ]
        },
      });
  });

  it('test transform - timePeriodFilter: week', () => {
    const historicalData = [
      { time: '2017-11-09T04:19:44.146545+00:00', value: 0 },
      { time: '2017-11-10T05:19:43.441699+00:00', value: 0 },
      { time: '2017-11-12T11:19:03.580818+00:00', value: 3 },
    ];
    const settings = {
      historicalData,
      seriesColumnLayout: true,
      timePeriodFilter: 'week',
      modelInfo: {
        title: 'Temperature',
      }
    };
    expect(instance.transform(settings))
      .toEqual({
        dataset: {
          dimensions: ['dateTime', 'Temperature'],
          source: [
            ['Thu', 0],
            ['Fri', 0],
            ['Sun', 3],
          ]
        },
      });
  });

  it('test transform - timePeriodFilter: month', () => {
    const historicalData = [
      { time: '2017-11-09T04:19:44.146545+00:00', value: 0 },
      { time: '2017-11-10T05:19:43.441699+00:00', value: 0 },
      { time: '2017-11-21T11:19:03.580818+00:00', value: 3 },
    ];
    const settings = {
      historicalData,
      seriesColumnLayout: true,
      timePeriodFilter: 'month',
      modelInfo: {
        title: 'Temperature',
      }
    };
    expect(instance.transform(settings))
      .toEqual({
        dataset: {
          dimensions: ['dateTime', 'Temperature'],
          source: [
            ['9th', 0],
            ['10th', 0],
            ['21st', 3],
          ]
        },
      });
  });

  it('test transform - no historical data', () => {
    const settings = {
      seriesColumnLayout: false,
      modelInfo: {
        title: 'Temperature'
      }
    };
    expect(instance.transform(settings))
      .toEqual({
        dataset: {
          source: [
            ['dateTime'],
            ['Temperature'],
          ]
        },
      });
  });

  it('test transform - timePeriodFilter: month with aggregate "avg"', () => {
    const historicalData = [
      {
        time: '2017-11-09T04:19:44.146545+00:00',
        value: {
          avg: 'none',
        }
      },
      {
        time: '2017-11-10T05:19:43.441699+00:00',
        value: {
          avg: undefined,
        }
      },
      {
        time: '2017-11-21T11:19:03.580818+00:00',
        value: {
          avg: 3,
        }
      },
    ];
    const settings = {
      historicalData,
      seriesColumnLayout: true,
      timePeriodFilter: 'month',
      modelInfo: {
        title: 'Temperature',
      },
      aggregate: 'avg'
    };
    expect(instance.transform(settings))
      .toEqual({
        dataset: {
          dimensions: ['dateTime', 'Temperature'],
          source: [
            ['9th', undefined],
            ['10th', undefined],
            ['21st', 3],
          ]
        },
      });
  });

});