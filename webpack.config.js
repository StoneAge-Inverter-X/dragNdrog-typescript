const path = require("path");

module.exports = {
  entry: "./src/app.ts", //entry point of you app
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // path() returns an absolute path of the file
  },
  devtool: "inline-source-map", //in chrome dev tool,'Source' tab , you can see the ts code, and debug it
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }], //they are regualar expression
  },

  resolve: {
    extensions: [".ts", ".js"], //tells what kind of file to resolve
  },
};
