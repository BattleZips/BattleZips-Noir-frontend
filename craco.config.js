const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          assert: require.resolve('assert'),
          crypto: require.resolve('crypto-browserify'),
          fs: false,
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: false,
          path: require.resolve('path-browserify'),
          stream: require.resolve('stream-browserify'),
          url: require.resolve('url'),
          util: require.resolve('util/')
        }
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false // disable the behaviour
            }
          }
        ]
      }
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        })
      ]
    }
  }
};
