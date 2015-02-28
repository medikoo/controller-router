'use strict';

var includes    = require('es5-ext/array/#/contains')
  , customError = require('es5-ext/error/custom')
  , forEach     = require('es5-ext/object/for-each')
  , validObject = require('es5-ext/object/valid-object')

  , stringify = JSON.stringify;

module.exports = function (conf/*, options*/) {
	validObject(conf);
	forEach(conf, function (conf, path) {
		var tokens, isMatch;
		validObject(conf);
		tokens = path.split('/');
		if (!tokens.every(Boolean)) {
			throw customError("Invalid path " + stringify(path), 'INVALID_PATH');
		}
		isMatch = includes.call(tokens, '*');
		if (typeof conf === 'function') {
			if (isMatch) {
				throw customError("Missing match function for " + stringify(path), 'MISSING_MATCH');
			}
			return;
		}
		if (!isMatch) {
			throw customError("Invalid controller for " + stringify(path), 'INVALID_CONTROLLER');
		}
		if (typeof conf.controller !== 'function') {
			throw customError("Invalid controller for " + stringify(path), 'INVALID_CONTROLLER');
		}
		if (typeof conf.match !== 'function') {
			throw customError("Invalid match function for " + stringify(path), 'INVALID_MATCH');
		}
	});
	return conf;
};
