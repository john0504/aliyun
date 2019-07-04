export const functionMap = {
  tempCelsius: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '--°C',
        icon: 'thermostat',
      };
    }
    return {
      value: val,
      text: round(val, 1) + '°C',
      icon: 'thermostat',
    };
  },
  tempCelsiusToFahrenheit: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '--°F',
        icon: 'thermostat',
      };
    }
    return {
      value: val,
      text: round(val * (9 / 5) + 32, 2) + '°F',
      icon: 'thermostat',
    };
  },
  tempFahrenheit: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '--°F',
        icon: 'thermostat',
      };
    }
    return {
      value: val,
      text: round(val, 2) + '°F',
      icon: 'thermostat',
    };
  },
  tempFahrenheitToCelsius: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '--°C',
        icon: 'thermostat',
      };
    }
    return {
      value: val,
      text: round((val - 32) * 5 / 9, 2) + '°C',
      icon: 'thermostat',
    };
  },
  humidity: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '--%',
      };
    }
    return {
      value: val,
      text: round(val, 1) + '%',
    };
  },
  timer: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '--:--',
        icon: 'timer',
      };
    }
    let hour = val / 60 | 0;
    let min = val % 60;
    let hourS = hour < 10 ? '0' + hour : hour + '';
    let minS = min < 10 ? '0' + min : min + '';
    return {
      value: val,
      text: hourS + ':' + minS,
      icon: 'timer',
    };
  },
  //create more from here
  timerHour: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--:--',
        icon: 'time',
      };
    }
    let hour = val;
    let hourS = hour < 10 ? '0' + hour : hour + '';
    return {
      value: val,
      text: hourS + ':00',
      icon: 'time',
    };
  },
  dust: (val) => {
    if (val < 0) {
      return {
        value: val,
        text: '--μg/m³',
        icon: 'cloud',
      };
    }
    return {
      value: val,
      text: val + 'μg/m³',
      icon: 'cloud',
    };
  },
  text: (val) => {
    if (val === undefined || val === null || val === -32767) {
      return {
        value: val,
        text: '--',
      };
    }
    return {
      value: val,
      text: round(val, 2) + '',
    };
  },
  airbox_humi: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--　　%',
      };
    }
    return {
      value: val,
      text: round(val / 100, 1) + '　　%',
    };
  },
  airbox_temp: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--　　°C',
      };
    }
    return {
      value: val,
      text: round(val / 100, 1) + '　　°C',
    };
  },
  airbox_pm25: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '-- μg/m³',
      };
    }
    return {
      value: val,
      text: round(val, 0) + ' μg/m³',
    };
  },
  airbox_co2: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--　ppm',
      };
    }
    return {
      value: val,
      text: round(val, 0) + '　ppm',
    };
  },
  airbox_voc: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--　 ppb',
      };
    }
    return {
      value: val,
      text: round(val, 0) + '　 ppb',
    };
  },
  ugm3: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--μg/m³',
      };
    }
    return {
      value: val,
      text: round(val, 0) + 'μg/m³',
    };
  },
  ppm: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--ppm',
      };
    }
    return {
      value: val,
      text: round(val, 0) + 'ppm',
    };
  },
  ppb: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--ppb',
      };
    }
    return {
      value: val,
      text: round(val, 0) + 'ppb',
    };
  },
  airbox_level: (val) => {
    if (val > 5 || val < 0) {
      return {
        value: val,
        text: '',
        icon: 'level0',
      };
    }
    switch (val) {
      case 0:
        return {
          value: val,
          text: '',
          icon: 'level0',
        };
      case 1:
        return {
          value: val,
          text: '',
          icon: 'level1',
        };
      case 2:
        return {
          value: val,
          text: '',
          icon: 'level2',
        };
      case 3:
        return {
          value: val,
          text: '',
          icon: 'level3',
        };
      case 4:
        return {
          value: val,
          text: '',
          icon: 'level4',
        };
      case 5:
        return {
          value: val,
          text: '',
          icon: 'level5',
        };
    }
    return {
      value: val,
      text: '',
      icon: 'level0',
    };
  },
  div10: (val) => {
    if (val === -32767) {
      return {
        value: val,
        text: '--',
      };
    }
    return {
      value: val,
      text: round(val * 10, 2) + '',
    };
  },
  tempInt8: (val) => {
    if (val === -32767 || val === undefined || val === null) {
      return {
        value: val,
        text: '--°C',
        icon: 'thermostat',
      };
    }
    if (val > 127) {
      return {
        value: -256 + val,
        text: round(-256 + val, 2) + '°C',
        sendValue: val,
        icon: 'thermostat',
      };
    }
    if (val < 0) {
      return {
        value: val,
        text: round(val, 2) + '°C',
        sendValue: 256 + val,
        icon: 'thermostat',
      };
    }
    return {
      value: val,
      text: round(val, 2) + '°C',
      sendValue: val,
      icon: 'thermostat',
    };
  },
};

function round(value: number, precision: number) {
  const base = 10 ** precision;
  return Math.round(value * base) / base;
}
