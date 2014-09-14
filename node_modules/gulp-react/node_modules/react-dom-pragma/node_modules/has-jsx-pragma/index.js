'use strict';
var commentRegex = require('comment-regex');

module.exports = function (str) {
	var res = commentRegex.block().exec(str);
	return res && res[0].indexOf('/**') !== -1 && res[0].indexOf('@jsx') !== -1;
};
