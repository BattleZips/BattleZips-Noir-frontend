const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          assert: require.resolve('assert'),
          fs: false,
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: false,
          path: require.resolve('path-browserify'),
          url: require.resolve('url'),
          util: require.resolve('util/'),
        },
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false, // disable the behaviour
            },
          },
        ],
      },
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ],
    },
  },
};
