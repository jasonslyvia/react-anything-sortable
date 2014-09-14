'use strict';
var hasJsxPragma = require('has-jsx-pragma');

module.exports = function (str) {
	return hasJsxPragma(str) ? str : ('/** @jsx React.DOM */\n' + str);
};
