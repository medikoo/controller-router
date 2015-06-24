// Ensures that provided path applies to router convention

'use strict';

var stringifiable = require('es5-ext/object/validate-stringifiable-value')
  , customError   = require('es5-ext/error/custom')
  , isStatic      = require('./is-token-static')

  , stringify = JSON.stringify;

module.exports = function (path) {
	path = stringifiable(path);
	if (path === '/') return path;
	path.split('/').forEach(function (token) {
		if (!token) throw customError("Invalid path " + stringify(path), 'INVALID_PATH');
		if (isStatic(token)) return;
		try { RegExp('^' + token + '$'); } catch (e) {
			throw customError("Invalid regular expression in path " + stringify(path),
				'INVALID_PATH_REGEX');
		}
	});
	return path;
};
