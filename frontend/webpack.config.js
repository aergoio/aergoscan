const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  return {
    mode: devMode ? 'development' : 'production',
    entry: [
      'regenerator-runtime/runtime',
      './src/index.js',
    ],
    output: {
      path: path.resolve(__dirname, './build'),
      filename: '[name].js',
      chunkFilename: '[name].js'
    },
    plugins: [
      new HtmlWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              }
            },
          ]
        },
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'vendor',
      },
    }
  };
};