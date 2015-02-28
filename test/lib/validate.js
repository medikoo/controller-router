'use strict';

module.exports = function (t, a) {
	var conf = {};
	a(t(conf), conf);
	a.throws(function () { t('foo'); }, TypeError);
	conf = {
		foo: function () {},
		'bar/dwa': function () {},
		'elo/*': {
			match: function (a1) {},
			controller: function () {}
		},
		'elo/*/bar/*': {
			match: function (a1, a2) {},
			controller: function () {}
		},
		'elo/dwa': function () {},
		elo: function () {},
		fiszka: function () {}
	};
	a(t(conf), conf);
	conf.marko = {};
	a.throws(function () { t(conf); }, 'INVALID_CONTROLLER');
	conf.marko = function () {};
	t(conf);
	conf['marko/*'] = {
		controller: function () {},
		match: true
	};
	a.throws(function () { t(conf); }, 'INVALID_MATCH');
	conf['marko/*'] = {
		controller: function () {},
		match: function (a1) {}
	};
	a(t(conf), conf);
};
