'use strict';

var customError = require('es5-ext/error/custom')
  , isFunction  = require('es5-ext/function/is-function')
  , forEach     = require('es5-ext/object/for-each')
  , validObject = require('es5-ext/object/valid-object')

  , create = Object.create, stringify = JSON.stringify;

var validateMatch = function (match, previous, path) {
	var length;
	if (!isFunction(match)) {
		throw customError("Invalid match function for " + stringify(path), 'INVALID_MATCH');
	}
	length = match.length;
	if (!length) {
		throw customError("Invalid length of match function for " + stringify(path),
			'INVALID_MATCH_LENGTH');
	}
	if (previous[length]) {
		throw customError("Duplicate match configuration for " + stringify(path), 'DUPLICATE_MATCH');
	}
	previous[length] = true;
	return match;
};

module.exports = function (conf/*, options*/) {
	validObject(conf);
	forEach(conf, function (conf, path) {
		var index, previousLengths;
		validObject(conf);
		if (typeof conf === 'function') return;
		if (typeof conf.controller !== 'function') {
			throw customError("Missing controller for " + stringify(path), 'MISSING_CONTROLLER');
		}
		validateMatch(conf.match, previousLengths = create(null), path);
		index = 1;
		while (conf['match' + (++index)] !== undefined) {
			validateMatch(conf['match' + index], previousLengths, path);
		}
	});
	return conf;
};
