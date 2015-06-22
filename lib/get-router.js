'use strict';

var includes     = require('es5-ext/array/#/contains')
  , ensureObject = require('es5-ext/object/valid-object')
  , forEach      = require('es5-ext/object/for-each')
  , validValue   = require('es5-ext/object/valid-value')
  , endsWith     = require('es5-ext/string/#/ends-with')
  , d            = require('d')
  , tokenizePath = require('./tokenize-path')

  , slice = Array.prototype.slice, create = Object.create, defineProperty = Object.defineProperty
  , apply = Function.prototype.apply;

var compareMatchers = function (a, b) {
	var result;
	if (a.matchPositionsLength !== b.matchPositionsLength) {
		return a.matchPositionsLength - b.matchPositionsLength;
	}
	a.matchPositions.some(function (aPos, index) {
		var bPos = b.matchPositions[index];
		if (aPos === bPos) return false;
		return (result = aPos - bPos);
	});
	return result || 0;
};

module.exports = function (conf/*, options*/) {
	var match = {}, direct = {}, options = Object(arguments[1]), baseContext;

	if (options.context != null) baseContext = ensureObject(options.context);

	forEach(conf, function (conf, path) {
		var pathData = tokenizePath(path);
		if (pathData.direct) {
			direct[path] = conf;
			return;
		}
		if (!match[pathData.tokens.length]) match[pathData.tokens.length] = [];
		pathData.conf = conf;
		pathData.matchPositionsLength = pathData.matchPositions.length;
		match[pathData.tokens.length].push(pathData);
	});
	forEach(match, function (data) { data.sort(compareMatchers); });

	return defineProperty(function (path/*, …data*/) {
		var pathTokens, data = slice.call(arguments, 1), conf, controller, result, context;
		if (this) context = this;
		else if (baseContext) context = create(baseContext);
		else context = {};
		path = String(validValue(path));
		if (!path) return false;
		if (path[0] === '/') path = path.slice(1);
		if (endsWith.call(path, '/')) path = path.slice(0, -1);
		context.path = path || '/';
		conf = direct[path || '/'];
		if (conf) {
			controller = conf.controller || conf;
			try {
				result = apply.call(controller, context, data);
			} catch (e) {
				e.conf = conf;
				e.context = context;
				throw e;
			}
		} else {
			pathTokens = path.split('/');
			if (!match[pathTokens.length]) return false;
			match[pathTokens.length].some(function (data) {
				var args = [];
				if (!data.tokens.every(function (token, index) {
						var pathToken = pathTokens[index];
						if (includes.call(data.matchPositions, index)) {
							if (!token.test(pathToken)) return false;
							args.push(pathToken);
							return true;
						}
						return (token === pathToken);
					})) {
					return false;
				}
				if (data.conf.match.apply(context, args)) conf = data.conf;
				return true;
			});
			if (!conf) return false;
			try {
				result = apply.call(conf.controller, context, data);
			} catch (e) {
				e.conf = conf;
				e.context = context;
				throw e;
			}
		}
		return {
			conf: conf,
			context: context,
			result: result
		};
	}, 'routes', d(conf));
};
