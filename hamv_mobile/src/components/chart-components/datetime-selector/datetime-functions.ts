import * as moment from 'moment';

export const DT_DAY = (marker: Date, direction: number) => {
  marker.setDate(marker.getDate() + direction);
  const startTime = marker.getTime();
  marker.setDate(marker.getDate() + 1);
  const endTime = marker.getTime() - 1000;
  const rangeText = moment(startTime).format('ll');

  return {
    startTime,
    endTime,
    rangeText,
  };
};

export const DT_WEEK = (marker: Date, direction: number) => {
  marker.setDate(marker.getDate() + direction * 7);
  marker.setDate(marker.getDate() - marker.getDay());
  const startTime = marker.getTime();
  marker.setDate(marker.getDate() + 7);
  const endTime = marker.getTime() - 1000;
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  let rangeText = moment(startDate).format('MMM DD');
  if (startDate.getMonth() === endDate.getMonth()) {
    rangeText += moment(endDate).format(' [-] DD');
  } else {
    rangeText += moment(endDate).format(' [-] MMM DD');
  }
  rangeText += moment(endDate).format(', YYYY');

  return {
    startTime,
    endTime,
    rangeText,
  };
};

export const DT_MONTH = (marker: Date, direction: number) => {
  marker.setDate(1);
  const m = marker.getMonth() + direction;
  marker.setMonth(m);
  const startTime = marker.getTime();
  const nextMonth = (m + 1) % 12;
  marker.setMonth(nextMonth);
  if (nextMonth == 0) {
    marker.setFullYear(marker.getFullYear() + 1);
  }
  const endTime = marker.getTime() - 1000;
  const rangeText = moment(startTime).format('MMM YYYY');

  return {
    startTime,
    endTime,
    rangeText,
  };
};

export const DT_YEAR = (marker: Date, direction: number) => {
  marker.setFullYear(marker.getFullYear() + direction);
  marker.setMonth(0, 1);
  const startTime = marker.getTime();
  marker.setFullYear(marker.getFullYear() + 1);
  const endTime = marker.getTime() - 1000;
  const rangeText = moment(startTime).format('YYYY');

  return {
    startTime,
    endTime,
    rangeText,
  };
};