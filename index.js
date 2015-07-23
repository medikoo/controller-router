// ControllerRouter class

'use strict';

var includes             = require('es5-ext/array/#/contains')
  , customError          = require('es5-ext/error/custom')
  , identity             = require('es5-ext/function/identity')
  , assign               = require('es5-ext/object/assign')
  , ensureObject         = require('es5-ext/object/valid-object')
  , ensureStringifiable  = require('es5-ext/object/validate-stringifiable-value')
  , forEach              = require('es5-ext/object/for-each')
  , endsWith             = require('es5-ext/string/#/ends-with')
  , d                    = require('d')
  , lazy                 = require('d/lazy')
  , compareDynamicRoutes = require('./lib/compare-dynamic-routes')
  , isStatic             = require('./lib/is-token-static')
  , resolvePathMeta      = require('./lib/resolve-path-meta')
  , ensurePath           = require('./lib/ensure-path')

  , push = Array.prototype.push, slice = Array.prototype.slice, apply = Function.prototype.apply
  , create = Object.create, defineProperty = Object.defineProperty, stringify = JSON.stringify;

var ControllerRouter = module.exports = Object.defineProperties(function (routes/*, options*/) {
	var options;
	// Validate initialization
	if (!(this instanceof ControllerRouter)) return new ControllerRouter(routes, arguments[1]);
	options = Object(arguments[1]);
	this.constructor.ensureRoutes(routes, options);

	if (options.eventProto != null) {
		// Override default event prototype
		defineProperty(this, '_eventProto', d(ensureObject(options.eventProto)));
	}

	defineProperty(this, 'routes', d(routes));

	// Configure internal routes map
	forEach(this.constructor.normalizeRoutes(routes, options), function (conf, path) {
		var pathData = resolvePathMeta(path);
		if (pathData.static) {
			this._staticRoutes[path] = conf;
			return;
		}
		if (!this._dynamicRoutes[pathData.tokens.length]) {
			this._dynamicRoutes[pathData.tokens.length] = [];
		}
		pathData.conf = conf;
		pathData.matchPositionsLength = pathData.matchPositions.length;
		this._dynamicRoutes[pathData.tokens.length].push(pathData);
	}, this);
	forEach(this._dynamicRoutes, function (data) { data.sort(compareDynamicRoutes); });
}, {
	// Validates provided routes map
	ensureRoutes: d(function (routes) {
		forEach(ensureObject(routes), function (conf, path) {
			var isDynamic;
			ensureObject(conf);
			ensurePath(path);
			if (path !== '/') isDynamic = !path.split('/').every(isStatic);
			if (typeof conf === 'function') {
				if (isDynamic) {
					throw customError("Missing match function for " + stringify(path), 'MISSING_MATCH');
				}
				return;
			}
			if (typeof conf.controller !== 'function') {
				throw customError("Invalid controller for " + stringify(path), 'INVALID_CONTROLLER');
			}
			if (typeof conf.match !== 'function') {
				if (isDynamic) {
					throw customError("Invalid match function for " + stringify(path), 'INVALID_MATCH');
				}
				return;
			}
			if (!isDynamic) {
				throw customError("Missing regular expression in path " + stringify(path),
					'MISSING_PATH_REGEX');
			}
		});
		return routes;
	}),
	// Normalizes routes to bare ControllerRouter format. If ControllerRouter extension
	// provides more sophisticated routes format, this should be a function which transforms it
	// directly to map as understood by ControllerRouter
	normalizeRoutes: d(identity)
});

Object.defineProperties(ControllerRouter.prototype, assign({
	// Routes path to controller
	route: d(function (path/*, …controllerArgs*/) {
		var args = [create(this._eventProto)];
		push.apply(args, arguments);
		return this.routeEvent.apply(this, args);
	}),
	// Routes path to controller and provides an event to be used for controller invocation
	routeEvent: d(function (event, path/*, …controllerArgs*/) {
		var pathTokens, controllerArgs = slice.call(arguments, 2), conf, initConf, controller, result;
		ensureObject(event);
		path = ensureStringifiable(path);
		if (!path) return false;
		if (path[0] === '/') path = path.slice(1);
		if (endsWith.call(path, '/')) path = path.slice(0, -1);
		event.path = path || '/';
		conf = this._staticRoutes[path || '/'];
		if (conf) {
			initConf = this.routes[path || '/'];
			controller = conf.controller || conf;
			try {
				result = apply.call(controller, event, controllerArgs);
			} catch (e) {
				e.conf = initConf;
				e.event = event;
				throw e;
			}
		} else {
			pathTokens = path.split('/');
			if (!this._dynamicRoutes[pathTokens.length]) return false;
			this._dynamicRoutes[pathTokens.length].some(function (data) {
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
				if (data.conf.match.apply(event, args)) {
					conf = data.conf;
					initConf = this.routes[data.path];
				}
				return true;
			}, this);
			if (!conf) return false;
			try {
				result = apply.call(conf.controller, event, controllerArgs);
			} catch (e) {
				e.conf = initConf;
				e.event = event;
				throw e;
			}
		}
		return {
			conf: initConf,
			event: event,
			result: result
		};
	}),
	// Default prototype for an route event
	_eventProto: d(Object.prototype)
}, lazy({
	// Internal map of dynamic routes (those that contain regexp tokens)
	_dynamicRoutes: d(function () { return create(null); }),
	// Internal map of static routes (no regexp tokens)
	_staticRoutes: d(function () { return create(null); })
})));
