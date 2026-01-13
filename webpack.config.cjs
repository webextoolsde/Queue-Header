const path = require("path");

const config = {
  mode: "production",
  entry: "./src/header_queue.js",
  output: {
    path: path.resolve(__dirname, "src/build"),
    filename: "queue-header-widget.js",
    publicPath: "build/"
  },
  module: {
    rules: [
      {
        use: "babel-loader",
        test: /\.js$/
      }
    ]
  }
};

module.exports = config;
