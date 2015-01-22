'use strict';

var callable  = require('es5-ext/object/valid-callable')
  , validate  = require('./lib/validate')
  , getRouter = require('./lib/get-router')

  , defaultResolve = function (result) { return result || true; };

module.exports = function (routes/*, options*/) {
	var options = Object(arguments[1]);
	if (options.resolve !== undefined) callable(options.resolve);
	return getRouter(validate(routes), options.resolve || defaultResolve);
};
