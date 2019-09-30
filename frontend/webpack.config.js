const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AppManifestWebpackPlugin = require('app-manifest-webpack-plugin');

const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function appManifestPlugin(publicPath) {
  return new AppManifestWebpackPlugin({
    logo: path.resolve(__dirname, './src/assets/img/favicon.svg'),
    prefix: publicPath + (process.env.NODE_ENV === 'production' ? '/' : '/icons'),
    output: process.env.NODE_ENV === 'production' ? '/icons-[hash:8]/' : './icons/',
    config: {
      appName: 'Aergoscan',
      icons: {
        yandex: false,
        coast: false
      }
    }
  });
}

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  const configName = process.env.CONFIG_NAME || 'local';
  console.log(`Building with config "${configName}"`);
  const appConfig = require(`./config/${configName}.env`);
  console.log('Building with');
  console.log(`  API_URL=${appConfig.API_URL}`);
  console.log(`  AERGO_URL=${appConfig.AERGO_URL}`);

  const plugins = [
    // config
    new webpack.DefinePlugin({
      'process.env': appConfig
    }),
    // vue-loader requirement
    new VueLoaderPlugin(),
    // extract css into files
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
    // reduce moment.js file size
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ko/),
    // analyze bundle
    //new BundleAnalyzerPlugin(),
    // create HTML files
    new HtmlWebpackPlugin({ template: 'src/assets/html/index.html' }), // , chunks: ['popup', 'vendor'
    appManifestPlugin(''),
  ];

  return {
    mode: devMode ? 'development' : 'production',
    entry: [
      'regenerator-runtime/runtime',
      'proxy-polyfill',
      'promise-polyfill/src/polyfill',
      './src/index.js',
    ],
    output: {
      path: path.resolve(__dirname, './build'),
      filename: '[name].[hash].js',
      chunkFilename: '[name].[hash].js',
      publicPath: '/'
    },
    plugins,
    module: {
      rules: [
        // Vue.js
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        // JS, compiled with Babel
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
        // CSS, inline for hot-reloading during development or extracted for production
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            //{ loader: 'file-loader', options: { name: '[name].css' } },
            devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            //MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  path: 'postcss.config.js'
                },
              },
            },
            "sass-loader",
          ]
        },
        // Images, inline up to a certain size
        { test: /\.(svg)$/, loader: "url-loader?limit=10000"},
        { test: /\.(png)$/, loader: "url-loader?limit=1"},
        // Fonts, always external
        { test: /\.(otf|swf|eot|ttf|woff|woff2)$/, loader: "url-loader?limit=1"}
      ]
    },
    devtool: (() => {
			if (devMode) return 'cheap-source-map';
		  return 'source-map';
		})(),
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': path.resolve(__dirname),
        '@assets': path.resolve(__dirname, 'src/assets'),
        'vue$': 'vue/dist/vue.runtime.esm.js',
      },
      modules: [
        path.resolve(__dirname, 'node_modules'),
        'node_modules'
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'vendor',
      },
    },
    devServer: {
      inline: true,
      historyApiFallback: true,
      disableHostCheck: true,
      proxy: {
        "/aergo": {
          target: {
              host: "localhost",
              protocol: 'http:',
              port: 8080,
          },
        },
        ignorePath: true,
        changeOrigin: true,
        secure: false,
      },
      host: "localhost",
    },
  };
};




