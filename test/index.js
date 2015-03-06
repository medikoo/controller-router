'use strict';

var clear = require('es5-ext/array/#/clear');

module.exports = function (t, a) {
	var called = [], obj = {};
	var router = t({
		'/': function () { called.push('root'); },
		foo: function () { called.push('foo'); },
		'bar/dwa': function () { called.push('bar/dwa'); return obj; },
		'elo/dwa': function () { called.push('elo/dwa'); },
		'elo/dwa/[a-z]+': {
			match: function (a1) {
				called.push('elo/dwa/*:match');
				return a1 === 'foo';
			},
			controller: function () { called.push('elo/dwa/*:controller'); }
		},
		'elo/dwa/[a-z]+/foo/[a-z]+': {
			match: function (a1, a2) {
				called.push('elo/dwa/*/foo/*:match2');
				return (a1 === 'foo') && (a2 === 'bar');
			},
			controller: function () { called.push('elo/dwa/*/foo/*:controller'); }
		},
		marko: function () { called.push('marko'); },
		'elo/trzy': function () { called.push('elo/trzy'); },
		'elo/dwa/filo': function () { called.push('elo/dwa/filo'); }
	});

	a(router('/'), true);
	a.deep(called, ['root']);
	clear.call(called);

	a(router('/foo/'), true);
	a.deep(called, ['foo']);
	clear.call(called);

	a(router('miszka'), false);
	a.deep(called, []);

	a(router('marko'), true);
	a.deep(called, ['marko']);
	clear.call(called);

	a(router('bar/dwa'), obj);
	a.deep(called, ['bar/dwa']);
	clear.call(called);

	a(router('elo/dwa'), true);
	a.deep(called, ['elo/dwa']);
	clear.call(called);

	a(router('elo/dwa/marko'), false);
	a.deep(called, ['elo/dwa/*:match']);
	clear.call(called);

	a(router('elo/dwa/foo'), true);
	a.deep(called, ['elo/dwa/*:match', 'elo/dwa/*:controller']);
	clear.call(called);

	a(router('elo/dwa/foo/foo/ilo'), false);
	a.deep(called, ['elo/dwa/*/foo/*:match2']);
	clear.call(called);

	a(router('elo/dwa/foo/foo/bar'), true);
	a.deep(called, ['elo/dwa/*/foo/*:match2', 'elo/dwa/*/foo/*:controller']);
	clear.call(called);

	a(router('elo/dwa/abla/bar'), false);
	a.deep(called, []);

	a(router('elo/dwa/foo/bar/miko'), false);
	a.deep(called, []);

	a(router('elo/dwa/filo'), true);
	a.deep(called, ['elo/dwa/filo']);
	clear.call(called);

	a(router('elo/trzy'), true);
	a.deep(called, ['elo/trzy']);
	clear.call(called);
};
