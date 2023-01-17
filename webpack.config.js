

const path = require("path")

 module.exports = {
    entry: './app.js',
    output: {
     filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
              test: /\.m?js$/,
              include: /node_modules\/wechaty/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    ['@babel/preset-env', { targets: { node: "current"} }]
                  ],
                }
              }
            }
          ]
    }
  };