'use strict';

var clear = require('es5-ext/array/#/clear');

module.exports = function (t, a) {
	var called = [], obj = {}, conf, context = {};
	var router = t(conf = {
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

	a.deep(router.call(context, '/'), { conf: conf['/'], result: undefined, context: context });
	a.deep(called, ['root']);
	clear.call(called);

	a.deep(router.call(context, '/foo/'), { conf: conf.foo, result: undefined, context: context });
	a.deep(called, ['foo']);
	clear.call(called);

	a(router.call(context, 'miszka'), false);
	a.deep(called, []);

	a.deep(router.call(context, 'marko'), { conf: conf.marko, result: undefined, context: context });
	a.deep(called, ['marko']);
	clear.call(called);

	a.deep(router.call(context, 'bar/dwa'), { conf: conf['bar/dwa'], result: obj, context: context });
	a.deep(called, ['bar/dwa']);
	clear.call(called);

	a.deep(router.call(context, 'elo/dwa'),
		{ conf: conf['elo/dwa'], result: undefined, context: context });
	a.deep(called, ['elo/dwa']);
	clear.call(called);

	a(router.call(context, 'elo/dwa/marko'), false);
	a.deep(called, ['elo/dwa/*:match']);
	clear.call(called);

	a.deep(router.call(context, 'elo/dwa/foo'),
		{ conf: conf['elo/dwa/[a-z]+'], result: undefined, context: context });
	a.deep(called, ['elo/dwa/*:match', 'elo/dwa/*:controller']);
	clear.call(called);

	a(router.call(context, 'elo/dwa/foo/foo/ilo'), false);
	a.deep(called, ['elo/dwa/*/foo/*:match2']);
	clear.call(called);

	a.deep(router.call(context, 'elo/dwa/foo/foo/bar'),
		{ conf: conf['elo/dwa/[a-z]+/foo/[a-z]+'], result: undefined, context: context });
	a.deep(called, ['elo/dwa/*/foo/*:match2', 'elo/dwa/*/foo/*:controller']);
	clear.call(called);

	a(router.call(context, 'elo/dwa/abla/bar'), false);
	a.deep(called, []);

	a(router.call(context, 'elo/dwa/foo/bar/miko'), false);
	a.deep(called, []);

	a.deep(router.call(context, 'elo/dwa/filo'),
		{ conf: conf['elo/dwa/filo'], result: undefined, context: context });
	a.deep(called, ['elo/dwa/filo']);
	clear.call(called);

	a.deep(router.call(context, 'elo/trzy'),
		{ conf: conf['elo/trzy'], result: undefined, context: context });
	a.deep(called, ['elo/trzy']);
	clear.call(called);
};
