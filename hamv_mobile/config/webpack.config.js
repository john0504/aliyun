const defaultWebpackConfig = require('../node_modules/@ionic/app-scripts/config/webpack.config.js');
const webpack = require('webpack');

const newPlugin = new webpack.ProvidePlugin({
  echarts: 'echarts'
});

defaultWebpackConfig.dev.plugins.push(newPlugin);
defaultWebpackConfig.prod.plugins.push(newPlugin);

module.exports = defaultWebpackConfig;
