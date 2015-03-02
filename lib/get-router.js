'use strict';

var includes   = require('es5-ext/array/#/contains')
  , forEach    = require('es5-ext/object/for-each')
  , validValue = require('es5-ext/object/valid-value')
  , isDirect   = require('./is-token-direct')

  , slice = Array.prototype.slice
  , apply = Function.prototype.apply;

var compareMatchers = function (a, b) {
	var result;
	if (a.count !== b.count) return a.count - b.count;
	a.positions.some(function (aPos, index) {
		var bPos = b.positions[index];
		if (aPos === bPos) return false;
		return (result = aPos - bPos);
	});
	return result || 0;
};

module.exports = function (conf, normalize) {
	var match = {}, direct = {};
	forEach(conf, function (conf, path) {
		var tokens = path.split('/'), data, pos = [], count = 0;
		tokens.forEach(function (token, index) {
			if (isDirect(token)) return;
			++count;
			pos.push(index);
			tokens[index] = new RegExp('^' + token + '$');
		});
		if (!count) {
			direct[path] = conf;
			return;
		}
		data = { conf: conf, tokens: tokens, positions: pos, count: count };
		if (!match[tokens.length]) match[tokens.length] = [];
		match[tokens.length].push(data);
	});
	forEach(match, function (data) { data.sort(compareMatchers); });

	return function (path/*, …data*/) {
		var pathTokens = String(validValue(path)).split('/')
		  , data = slice.call(arguments, 1)
		  , controller = direct[path];
		if (controller) {
			if (controller.controller) controller = controller.controller;
			return normalize(apply.call(controller, this, data));
		}
		if (!match[pathTokens.length]) return false;
		match[pathTokens.length].some(function (data) {
			var args = [];
			if (!data.tokens.every(function (token, index) {
					var pathToken = pathTokens[index];
					if (includes.call(data.positions, index)) {
						if (!token.test(pathToken)) return false;
						args.push(pathToken);
						return true;
					}
					return (token === pathToken);
				})) {
				return false;
			}
			if (data.conf.match.apply(this, args)) controller = data.conf.controller;
			return true;
		}, this);
		if (!controller) return false;
		return normalize(apply.call(controller, this, data));
	};
};
