var webpackConfig = require('./webpack.test.js');
const isDocker = require('is-docker')();

module.exports = function(config) {
  var _config = {
    basePath: '../',

    frameworks: ['jasmine'],

    files: [
      {
        pattern: './test-config/karma-test-shim.js',
        watched: true
      },
      { pattern: './test-assets/**/*', included: true },
    ],

    preprocessors: {
      './test-config/karma-test-shim.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    },

    webpackServer: {
      noInfo: true
    },

    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },

    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },

    reporters: config.coverage ? ['kjhtml', 'dots', 'coverage-istanbul'] : ['kjhtml', 'dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeCustom'],
    customLaunchers: {
      ChromeCustom: {
        base: 'Chrome',
        flags: isDocker ? [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--headless',
          '--disable-gpu',
          '--remote-debugging-port=9222',
        ] : [],
      },
    },
    singleRun: false,
  };

  config.set(_config);
};