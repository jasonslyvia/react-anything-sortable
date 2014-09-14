'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var react = require('react-tools');
var reactDomPragma = require('react-dom-pragma');

module.exports = function (options) {
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-react', 'Streaming not supported'));
			return;
		}

		var str = file.contents.toString();
		var filePath = file.path;

		if (path.extname(filePath) === '.jsx') {
			str = reactDomPragma(str);
		}

		try {
			file.contents = new Buffer(react.transform(str, options));
			file.path = gutil.replaceExtension(filePath, '.js');
			cb(null, file);
		} catch (err) {
			cb(new gutil.PluginError('gulp-react', err, {
				fileName: filePath
			}));
		}
	});
};
