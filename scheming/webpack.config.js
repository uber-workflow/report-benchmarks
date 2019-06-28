var path = require("path");
module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve("./build"),
    filename: "index.js"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/react"]
            }
          }
        ]
      }
    ]
  },
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
  stats: {
    colors: true
  },
  devtool: "source-map"
};
