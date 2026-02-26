import path from "node:path";
import { fileURLToPath } from "node:url";
import CopyWebpackPlugin from "copy-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: process.env.NODE_ENV,
  entry: ["./src/app.js", "./css/main.css"],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
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
