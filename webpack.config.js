const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

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
