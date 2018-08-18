const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './build/app.js',
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: true,
        mangle: true
      }
    })
  ],
  output: {
    filename: 'jssynth.js',
    path: path.resolve(__dirname, '.')
  }
};
