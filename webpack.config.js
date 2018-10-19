const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: ['./src/app.js', './sass/jssynth.scss'],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            },
          },
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
 plugins: [
    new CopyWebpackPlugin([
      { from: 'jssynth.html', to: 'build/' },
      { from: 'sounds/*.wav', to: 'build/' },
      { from: 'images/*.png', to: 'build/' },
      { from: 'lib/*.js', to: 'build/' },
    ], {}),
    new MiniCssExtractPlugin({
        filename: "build/jssynth.css",
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: true,
        mangle: true
      }
    })
  ],
  output: {
    filename: 'build/jssynth.js',
    path: path.resolve(__dirname, '.')
  }
};
