import { DataTransform } from '../data-transform';
import * as moment from 'moment';

export class EchartsDatasetTransform implements DataTransform {

  // output: chart options - dataset part
  public transform(settings?): any {
    const { historicalData, aggregate, seriesColumnLayout, timePeriodFilter, modelInfo } = settings;
    const history = Array.isArray(historicalData) ? historicalData : [];
    const info = modelInfo || {
      title: 'status',
    };
    if (seriesColumnLayout) {
      const columns = ['dateTime', info.title];
      const series = [];
      const chartOptions = {
        dataset: {
          dimensions: columns,
          source: series,
        },
      };

      history.forEach(data => {
        const d = new Date(data.time);
        const dateString = this.getDateTimeString(d, timePeriodFilter);
        const v = this.getDataValue(data.value, aggregate);
        const item = [dateString, v];
        series.push(item);
      });
      return chartOptions;
    }
    const columns = ['dateTime'];
    const series = [info.title];
    const chartOptions = {
      dataset: {
        source: [
          columns,
          series,
        ]
      },
    };

    history.forEach(data => {
      const d = new Date(data.time);
      const dateString = this.getDateTimeString(d, timePeriodFilter);
      columns.push(dateString);
      const v = this.getDataValue(data.value, aggregate);
      series.push(v);
    });

    return chartOptions;
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

  private getDateTimeString(date, timePeriodFilter = 'none') {
    if (timePeriodFilter === 'day') {
      return moment(date).format('h:[00] a');
    } else if (timePeriodFilter === 'week') {
      return moment(date).format('ddd');
    } else if (timePeriodFilter === 'month') {
      return moment(date).format('Do');
    }
    return moment(date).format('M/DD');
  }
}