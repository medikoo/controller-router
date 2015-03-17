'use strict';

var isDirect = require('./is-token-direct');

module.exports = function (path) {
	var data = { path: path, matchPositions: [] };
	if (path === '/') {
		data.tokens = [];
		data.direct = true;
		return data;
	}
	data.tokens = path.split('/');
	data.tokens.forEach(function (token, index) {
		if (isDirect(token)) return;
		data.matchPositions.push(index);
		data.tokens[index] = new RegExp('^' + token + '$');
	});
	data.direct = !data.matchPositions.length;
	return data;
};
