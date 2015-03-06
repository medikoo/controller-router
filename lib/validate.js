'use strict';

var customError = require('es5-ext/error/custom')
  , forEach     = require('es5-ext/object/for-each')
  , validObject = require('es5-ext/object/valid-object')
  , isDirect    = require('./is-token-direct')

  , stringify = JSON.stringify;

module.exports = function (conf/*, options*/) {
	validObject(conf);
	forEach(conf, function (conf, path) {
		var isMatch;
		validObject(conf);
		if (path !== '/') {
			path.split('/').forEach(function (token) {
				if (!token) throw customError("Invalid path " + stringify(path), 'INVALID_PATH');
				if (isDirect(token)) return;
				try { RegExp('^' + token + '$'); } catch (e) {
					throw customError("Invalid regular expression in path " + stringify(path),
						'INVALID_PATH_REGEX');
				}
				isMatch = true;
			});
		}
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
