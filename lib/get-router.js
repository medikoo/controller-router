'use strict';

var includes   = require('es5-ext/array/#/contains')
  , forEach    = require('es5-ext/object/for-each')
  , validValue = require('es5-ext/object/valid-value')

  , slice = Array.prototype.slice
  , apply = Function.prototype.apply;

var compareMatchers = function (a, b) {
	var result;
	if (a.count !== b.count) return a.count - b.count;
	a.positions.some(function (pos, index) {
		if (pos === b.positions[index]) return false;
		return (result = pos - b.positions[index]);
	});
	return result || 0;
};

module.exports = function (conf, normalize) {
	var match = {}, direct = {};
	forEach(conf, function (conf, path) {
		var tokens = path.split('/'), data, pos, count;
		if (!includes.call(tokens, '*')) {
			direct[path] = conf;
			return;
		}
		data = { conf: conf, tokens: tokens };
		pos = data.positions = [];
		count = 0;
		tokens.forEach(function (token, index) {
			if (token !== '*') return;
			++count;
			pos.push(index);
		});
		data.count = count;
		if (!match[tokens.length]) match[tokens.length] = [];
		match[tokens.length].push(data);
	});
	forEach(match, function (data) { data.sort(compareMatchers); });

	return function (path/*, …data*/) {
		var tokens = String(validValue(path)).split('/')
		  , data = slice.call(arguments, 1)
		  , controller = direct[path];
		if (controller) return normalize(apply.call(controller, this, data));
		if (!match[tokens.length]) return false;
		match[tokens.length].some(function (data) {
			var args = [];
			var matches = data.tokens.every(function (token, index) {
				if (token === '*') {
					args.push(tokens[index]);
					return true;
				}
				return (token === tokens[index]);
			});
			if (!matches) return false;
			if (data.conf.match.apply(this, args)) controller = data.conf.controller;
			return true;
		}, this);
		if (!controller) return false;
		return normalize(apply.call(controller, this, data));
	};
};
