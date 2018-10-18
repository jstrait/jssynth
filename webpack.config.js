const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/app.js',
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
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'jssynth.html', to: 'build/' },
      { from: 'sounds/*.wav', to: 'build/' },
      { from: 'images/*.png', to: 'build/' },
      { from: 'lib/*.js', to: 'build/' },
    ], {}),
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
