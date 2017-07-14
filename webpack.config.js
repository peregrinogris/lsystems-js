const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = {
  entry: "./src/index.js",
  plugins: [new UglifyJsPlugin({ minimize: true })],
  devtool: 'source-map',
  output: {
    path: `${__dirname}/dist/js`,
    filename: "app.min.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['env'],
        },
      },
    ],
  },
  resolve: {
    modules: [path.resolve('./src'), 'node_modules'],
  },
};
