const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './jssynth-react.js',
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: true,
        mangle: true
      }
    })
  ],
  output: {
    filename: 'jssynth-react-packed.js',
    path: path.resolve(__dirname, '.')
  }
};
