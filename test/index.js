'use strict';

var clear   = require('es5-ext/array/#/clear')
  , assign  = require('es5-ext/object/assign')
	, Promise = require('plain-promise');

module.exports = function (T, a, d) {
	var called = [], obj = {}, conf, event = {}, router;

	a.h1("Ensure routes");
	conf = {};
	a(T.ensureRoutes(conf), conf);
	a.throws(function () { T.ensureRoutes('foo'); }, TypeError);
	conf = {
		foo: function () {},
		'bar/dwa': function () {},
		'elo/[a-z]+': {
			match: function (a1) {},
			controller: function () {}
		},
		'elo/[a-z]+/bar/[0-9]+': {
			match: function (a1, a2) {},
			controller: function () {}
		},
		'elo/dwa': function () {},
		elo: function () {},
		fiszka: function () {}
	};
	a(T.ensureRoutes(conf), conf);
	conf.marko = {};
	a.throws(function () { T.ensureRoutes(conf); }, 'INVALID_CONTROLLER');
	conf.marko = function () {};
	T.ensureRoutes(conf);
	conf['marko/[a-z]+'] = {
		controller: function () {},
		match: true
	};
	a.throws(function () { T.ensureRoutes(conf); }, 'INVALID_MATCH');
	conf['marko/[a-z]+'] = {
		controller: function () {},
		match: function (a1) {}
	};
	a(T.ensureRoutes(conf), conf);

	a.h1("Router");
	router = new T(conf = {
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

	a.deep(router.routeEvent(event, '/'), { conf: conf['/'], result: undefined, event: event });
	a.deep(called, ['root']);
	clear.call(called);

	a.deep(router.routeEvent(event, '/foo/'), { conf: conf.foo, result: undefined, event: event });
	a.deep(called, ['foo']);
	clear.call(called);

	a(router.routeEvent(event, 'miszka'), false);
	a.deep(called, []);

	a.deep(router.routeEvent(event, 'marko'), { conf: conf.marko, result: undefined, event: event });
	a.deep(called, ['marko']);
	clear.call(called);

	a.deep(router.routeEvent(event, 'bar/dwa'), { conf: conf['bar/dwa'], result: obj, event: event });
	a.deep(called, ['bar/dwa']);
	clear.call(called);

	a.deep(router.routeEvent(event, 'elo/dwa'),
		{ conf: conf['elo/dwa'], result: undefined, event: event });
	a.deep(called, ['elo/dwa']);
	clear.call(called);

	a(router.routeEvent(event, 'elo/dwa/marko'), false);
	a.deep(called, ['elo/dwa/*:match']);
	clear.call(called);

	a.deep(router.routeEvent(event, 'elo/dwa/foo'),
		{ conf: conf['elo/dwa/[a-z]+'], result: undefined, event: event });
	a.deep(called, ['elo/dwa/*:match', 'elo/dwa/*:controller']);
	clear.call(called);

	a(router.routeEvent(event, 'elo/dwa/foo/foo/ilo'), false);
	a.deep(called, ['elo/dwa/*/foo/*:match2']);
	clear.call(called);

	a.deep(router.routeEvent(event, 'elo/dwa/foo/foo/bar'),
		{ conf: conf['elo/dwa/[a-z]+/foo/[a-z]+'], result: undefined, event: event });
	a.deep(called, ['elo/dwa/*/foo/*:match2', 'elo/dwa/*/foo/*:controller']);
	clear.call(called);

	a(router.routeEvent(event, 'elo/dwa/abla/bar'), false);
	a.deep(called, []);

	a(router.routeEvent(event, 'elo/dwa/foo/bar/miko'), false);
	a.deep(called, []);

	a.deep(router.routeEvent(event, 'elo/dwa/filo'),
		{ conf: conf['elo/dwa/filo'], result: undefined, event: event });
	a.deep(called, ['elo/dwa/filo']);
	clear.call(called);

	a.deep(router.routeEvent(event, 'elo/trzy'),
		{ conf: conf['elo/trzy'], result: undefined, event: event });
	a.deep(called, ['elo/trzy']);
	clear.call(called);

	a.h1("Promise");
	clear.call(called);
	router = new T(conf = {
		'/': function () { called.push('root'); return 'foo'; },
		'matched/[0-9]+': {
			match: function (token) {
				this.token = token;
				return new Promise(function (resolve) {
					setTimeout(function () { resolve(true); }, token);
				});
			},
			controller: function () {
				called.push(this.token);
			}
		}
	}, { promiseResultImplementation: assign(function () {}, { resolve: function (result) {
		return { name: 'promise', result: result };
	} }) });

	var result = router.route('/');
	a.deep(result, { name: 'promise',
		result: { conf: conf['/'], result: 'foo', event: result.result.event } });
	a.deep(called, ['root']);
	clear.call(called);

	var wasCalled = false;
	router.route('/matched/50').done(a.never, function (err) {
		wasCalled = true;
		a(err.code, 'OUTDATED_ROUTE_CALL');
	});
	router.route('/matched/100').done(function () {
			a(wasCalled, true);
			d();
	}, a.never);
};
