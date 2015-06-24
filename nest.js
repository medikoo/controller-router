// Generates new routes map, where provided routes are nested against extra url

'use strict';

var forEach          = require('es5-ext/object/for-each')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , callable         = require('es5-ext/object/valid-callable')
  , ensurePath       = require('./lib/ensure-path')
  , resolvePathMeta  = require('./lib/resolve-path-meta')

  , slice = Array.prototype.slice, apply = Function.prototype.apply, create = Object.create;

module.exports = function (path, nestedRoutes/*, match*/) {
	var routes = create(null), match, pathData;
	path = ensurePath(path);
	pathData = resolvePathMeta(path);
	if (!pathData.static) match = callable(arguments[2]);
	forEach(nestedRoutes, function (conf, nestedPath) {
		var nestedMatch;
		if (typeof conf === 'function') conf = { controller: conf };
		else if (conf === true) conf = {};
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
