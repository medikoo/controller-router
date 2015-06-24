'use strict';

var assign           = require('es5-ext/object/assign')
  , clear            = require('es5-ext/array/#/clear')
  , ControllerRouter = require('../');

module.exports = {
	Direct: function (t, a) {
		var called = [], obj = {}, conf, event = {};
		var router = new ControllerRouter(t('milo/foo', conf = {
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
		}));

		a(router.routeEvent(event, '/'), false);

		a.deep(router.routeEvent(event, '/milo/foo/'),
			{ conf: { controller: conf['/'] }, result: undefined, event: event });
		a.deep(called, ['root']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/foo/foo/'),
			{ conf: { controller: conf.foo }, result: undefined, event: event });
		a.deep(called, ['foo']);
		clear.call(called);

		a(router.routeEvent(event, '/milo/foo/miszka'), false);
		a.deep(called, []);

		a.deep(router.routeEvent(event, '/milo/foo/marko'),
			{ conf: { controller: conf.marko }, result: undefined, event: event });
		a.deep(called, ['marko']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/foo/bar/dwa'),
			{ conf: { controller: conf['bar/dwa'] }, result: obj, event: event });
		a.deep(called, ['bar/dwa']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/foo/elo/dwa'), { conf: { controller: conf['elo/dwa'] },
			result: undefined, event: event });
		a.deep(called, ['elo/dwa']);
		clear.call(called);

		a(router.routeEvent(event, '/milo/foo/elo/dwa/marko'), false);
		a.deep(called, ['elo/dwa/*:match']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/foo/elo/dwa/foo'),
			{ conf: conf['elo/dwa/[a-z]+'], result: undefined, event: event });
		a.deep(called, ['elo/dwa/*:match', 'elo/dwa/*:controller']);
		clear.call(called);

		a(router.routeEvent(event, '/milo/foo/elo/dwa/foo/foo/ilo'), false);
		a.deep(called, ['elo/dwa/*/foo/*:match2']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/foo/elo/dwa/foo/foo/bar'),
			{ conf: conf['elo/dwa/[a-z]+/foo/[a-z]+'], result: undefined, event: event });
		a.deep(called, ['elo/dwa/*/foo/*:match2', 'elo/dwa/*/foo/*:controller']);
		clear.call(called);

		a(router.routeEvent(event, '/milo/foo/elo/dwa/abla/bar'), false);
		a.deep(called, []);

		a(router.routeEvent(event, '/milo/foo/elo/dwa/foo/bar/miko'), false);
		a.deep(called, []);

		a.deep(router.routeEvent(event, '/milo/foo/elo/dwa/filo'),
			{ conf: { controller: conf['elo/dwa/filo'] }, result: undefined, event: event });
		a.deep(called, ['elo/dwa/filo']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/foo/elo/trzy'), { conf: { controller: conf['elo/trzy'] },
			result: undefined, event: event });
		a.deep(called, ['elo/trzy']);
		clear.call(called);
	},
	Match: function (t, a) {
		var called = [], obj = {}, conf, nestConf, event = {};
		var router = new ControllerRouter(nestConf = t('milo/[a-z]+/foo', conf = {
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
		}, function (id) { return (id === 'elos'); }));

		a(router.routeEvent(event, '/'), false);

		a.deep(router.routeEvent(event, '/milo/binio/foo/'), false);

		a.deep(router.routeEvent(event, '/milo/elos/foo/'), { conf: { controller: conf['/'],
			match: nestConf['milo/[a-z]+/foo'].match }, result: undefined, event: event });
		a.deep(called, ['root']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/elos/foo/foo/'), { conf: { controller: conf.foo,
			match: nestConf['milo/[a-z]+/foo/foo'].match }, result: undefined, event: event });
		a.deep(called, ['foo']);
		clear.call(called);

		a(router.routeEvent(event, '/milo/elos/foo/miszka'), false);
		a.deep(called, []);

		a.deep(router.routeEvent(event, '/milo/elos/foo/marko'), { conf: { controller: conf.marko,
			match: nestConf['milo/[a-z]+/foo/marko'].match }, result: undefined, event: event });
		a.deep(called, ['marko']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/elos/foo/bar/dwa'), { conf: {
			controller: conf['bar/dwa'],
			match: nestConf['milo/[a-z]+/foo/bar/dwa'].match
		}, result: obj, event: event });
		a.deep(called, ['bar/dwa']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/elos/foo/elo/dwa'), { conf: {
			controller: conf['elo/dwa'],
			match: nestConf['milo/[a-z]+/foo/elo/dwa'].match
		}, result: undefined, event: event });
		a.deep(called, ['elo/dwa']);
		clear.call(called);

		a(router.routeEvent(event, '/milo/elos/foo/elo/dwa/marko'), false);
		a.deep(called, ['elo/dwa/*:match']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/elos/foo/elo/dwa/foo'),
			{ conf: assign({}, conf['elo/dwa/[a-z]+'],
				{ match: nestConf['milo/[a-z]+/foo/elo/dwa/[a-z]+'].match }),
				result: undefined, event: event });
		a.deep(called, ['elo/dwa/*:match', 'elo/dwa/*:controller']);
		clear.call(called);

		a(router.routeEvent(event, '/milo/elos/foo/elo/dwa/foo/foo/ilo'), false);
		a.deep(called, ['elo/dwa/*/foo/*:match2']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/elos/foo/elo/dwa/foo/foo/bar'),
			{ conf: assign({}, conf['elo/dwa/[a-z]+/foo/[a-z]+'],
				{ match: nestConf['milo/[a-z]+/foo/elo/dwa/[a-z]+/foo/[a-z]+'].match }),
				result: undefined, event: event });
		a.deep(called, ['elo/dwa/*/foo/*:match2', 'elo/dwa/*/foo/*:controller']);
		clear.call(called);

		a(router.routeEvent(event, '/milo/elos/foo/elo/dwa/abla/bar'), false);
		a.deep(called, []);

		a(router.routeEvent(event, '/milo/elos/foo/elo/dwa/foo/bar/miko'), false);
		a.deep(called, []);

		a.deep(router.routeEvent(event, '/milo/elos/foo/elo/dwa/filo'),
			{ conf: { controller: conf['elo/dwa/filo'],
				match: nestConf['milo/[a-z]+/foo/elo/dwa/filo'].match },
				result: undefined, event: event });
		a.deep(called, ['elo/dwa/filo']);
		clear.call(called);

		a.deep(router.routeEvent(event, '/milo/elos/foo/elo/trzy'), { conf: {
			controller: conf['elo/trzy'],
			match: nestConf['milo/[a-z]+/foo/elo/trzy'].match
		}, result: undefined, event: event });
		a.deep(called, ['elo/trzy']);
		clear.call(called);
	}
};
