// Resolve meta data for given path
// Whether it's static, and if it's dynamic resolve dynamic tokens positions.

'use strict';

var isStatic = require('./is-token-static');

module.exports = function (path) {
	var data = { path: path, matchPositions: [] };
	if (path === '/') {
		data.tokens = [];
		data.static = true;
		return data;
	}
	data.tokens = path.split('/');
	data.tokens.forEach(function (token, index) {
		if (isStatic(token)) return;
		data.matchPositions.push(index);
		data.tokens[index] = new RegExp('^' + token + '$');
	});
	data.static = !data.matchPositions.length;
	return data;
};
