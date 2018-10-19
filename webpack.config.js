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
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
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
        ],
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
      { from: 'jssynth.html', to: 'dist/' },
      { from: 'sounds/*.wav', to: 'dist/' },
      { from: 'images/*.png', to: 'dist/' },
      { from: 'lib/*.js', to: 'dist/' },
    ], {}),
    new MiniCssExtractPlugin({
        filename: "dist/jssynth.css",
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: true,
        mangle: true,
      },
    }),
  ],
  output: {
    filename: 'dist/jssynth.js',
    path: path.resolve(__dirname, '.'),
  }
};
