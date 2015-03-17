'use strict';

var forEach          = require('es5-ext/object/for-each')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , callable         = require('es5-ext/object/valid-callable')
  , stringifiable    = require('es5-ext/object/validate-stringifiable-value')
  , tokenizePath     = require('./lib/tokenize-path')
  , validate         = require('./lib/validate')

  , slice = Array.prototype.slice, apply = Function.prototype.apply, create = Object.create;

module.exports = function (path, nestedRoutes/*, match*/) {
	var routes = create(null), match, pathData;
	path = stringifiable(path);
	validate(nestedRoutes);
	pathData = tokenizePath(path);
	if (!pathData.direct) match = callable(arguments[2]);
	forEach(nestedRoutes, function (conf, nestedPath) {
		var nestedMatch;
		if (typeof conf === 'function') conf = { controller: conf };
		else conf = normalizeOptions(conf);
		routes[(nestedPath === '/') ? path : (path + '/' + nestedPath)] = conf;
		if (match) {
			if (conf.match) {
				nestedMatch = conf.match;
				conf.match = function () {
					return apply.call(match, this, slice.call(arguments, 0, pathData.matchPositions.length))
						&& apply.call(nestedMatch, this, slice.call(arguments, pathData.matchPositions.length));
				};
			} else {
				conf.match = match;
			}
		}
	});
	return routes;
};
