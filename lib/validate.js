'use strict';

var customError  = require('es5-ext/error/custom')
  , forEach      = require('es5-ext/object/for-each')
  , object       = require('es5-ext/object/valid-object')
  , isDirect     = require('./is-token-direct')
  , validatePath = require('./validate-path')

  , stringify = JSON.stringify;

module.exports = function (conf/*, options*/) {
	object(conf);
	forEach(conf, function (conf, path) {
		var isMatch;
		object(conf);
		validatePath(path);
		if (path !== '/') isMatch = !path.split('/').every(isDirect);
		if (typeof conf === 'function') {
			if (isMatch) {
				throw customError("Missing match function for " + stringify(path), 'MISSING_MATCH');
			}
			return;
		}
		if (typeof conf.controller !== 'function') {
			throw customError("Invalid controller for " + stringify(path), 'INVALID_CONTROLLER');
		}
		if (typeof conf.match !== 'function') {
			if (isMatch) {
				throw customError("Invalid match function for " + stringify(path), 'INVALID_MATCH');
			}
			return;
		}
		if (!isMatch) {
			throw customError("Missing regular expression in path " + stringify(path),
				'MISSING_PATH_REGEX');
		}
	});
	return conf;
};
