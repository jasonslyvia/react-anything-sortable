var isDebug = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/lib',
    filename: 'index.js',
    library: 'react-anything-sortable',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      include: /src/,
      loader: 'babel?stage=0&loose=all'
    }]
  },
  externals: {
    'react/addons': {
      'commonjs': 'react/addons',
      'commonjs2': 'react/addons',
      'amd': 'React',
      'root': 'React'
    }
  },
  debug: isDebug,
  devtool: isDebug ? 'inline-source-map' : false,
  watch: isDebug
};
