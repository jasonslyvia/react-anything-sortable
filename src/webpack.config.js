module.exports {
  entry: {
    app: './index.js'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
    }]
  },
}
