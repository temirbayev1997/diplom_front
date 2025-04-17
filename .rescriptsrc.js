module.exports = [
    config => {
      config.resolve.alias = {
        ...config.resolve.alias,
        'webpack-hot-middleware/client': require.resolve('./src/webpackHotDevClient.js')
      };
      return config;
    }
  ];