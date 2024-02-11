const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: ["./src/app.js", "./sass/jssynth.scss"],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      }
    ]
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "html/index.html" },
        { from: "sounds/*.wav" },
        { from: "images/*.png" },
        { from: "lib/*.js" },
      ],
    }),
    new MiniCssExtractPlugin({
        filename: "jssynth.css",
    }),
    new TerserPlugin({
      terserOptions: {
        compress: true,
        mangle: true,
      },
      exclude: "lib/",
      extractComments: false,
    }),
  ],
  output: {
    filename: "jssynth.js",
    path: path.resolve(__dirname, "./dist"),
    clean: true,
  }
};
