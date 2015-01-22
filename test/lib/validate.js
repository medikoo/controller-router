'use strict';

module.exports = function (t, a) {
	var conf = {};
	a(t(conf), conf);
	a.throws(function () { t('foo'); }, TypeError);
	conf = {
		foo: function () {},
		'bar/dwa': function () {},
		elo: {
			match: function (a1) {},
			match2: function (a1, a2) {},
			controller: function () {}
		},
		'elo/dwa': {
			match: function (a1) {},
			match2: function (a1, a2) {},
			controller: function () {}
		},
		eli: {
			match: function (a1) {},
			controller: function () {}
		}
	};
	a(t(conf), conf);
	conf.marko = {};
	a.throws(function () { t(conf); }, 'MISSING_CONTROLLER');
	conf.marko.controller = function () {};
	a.throws(function () { t(conf); }, 'INVALID_MATCH');
	conf.marko.match = function () {};
	a.throws(function () { t(conf); }, 'INVALID_MATCH_LENGTH');
	conf.marko.match = function (a1) {};
	conf.marko.match2 = function (a1) {};
	a.throws(function () { t(conf); }, 'DUPLICATE_MATCH');
	conf.marko.match2 = function (a1, a2) {};
	a(t(conf), conf);
};
