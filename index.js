'use strict';

var callable  = require('es5-ext/object/valid-callable')
  , validate  = require('./lib/validate')
  , getRouter = require('./lib/get-router')

  , defaultNormalize = function (result) { return result || true; };

module.exports = function (routes/*, options*/) {
	var options = Object(arguments[1]);
	if (options.normalizeResult !== undefined) callable(options.normalizeResult);
	return getRouter(validate(routes), options.normalizeResult || defaultNormalize);
};
