'use strict';

var validValue = require('es5-ext/object/valid-value')

  , slice = Array.prototype.slice
  , apply = Function.prototype.apply;

module.exports = function (conf, normalize) {
	return function (path/*, …data*/) {
		var tokens = String(validValue(path)).split('/')
		  , data = slice.call(arguments, 1)
		  , controller = conf[tokens.join('/')], args, match, index;
		if (typeof controller === 'function') return normalize(apply.call(controller, this, data));
		args = [];
		while (tokens.length > 1) {
			args.unshift(tokens.pop());
			controller = conf[tokens.join('/')];
			if (!controller || (typeof controller !== 'object')) continue;
			match = controller.match;
			index = 1;
			while (match.length !== args.length) {
				match = controller['match' + (++index)];
				if (!match) break;
			}
			if (match) {
				if (match.apply(this, args)) {
					return normalize(apply.call(controller.controller, this, data));
				}
				return false;
			}
		}
		return false;
	};
};
