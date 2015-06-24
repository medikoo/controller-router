'use strict';

module.exports = function (t, a) {
	a.throws(function () { t(''); }, 'INVALID_PATH');
	a.throws(function () { t('//'); }, 'INVALID_PATH');
	a.throws(function () { t('/foo/'); }, 'INVALID_PATH');
	a.throws(function () { t('/foo'); }, 'INVALID_PATH');
	a.throws(function () { t('foo/'); }, 'INVALID_PATH');
	a.throws(function () { t('foo/bar/'); }, 'INVALID_PATH');
	a.throws(function () { t('/foo/bar'); }, 'INVALID_PATH');
	a.throws(function () { t('foo//bar'); }, 'INVALID_PATH');
	a.throws(function () { t('foo/*/bar'); }, 'INVALID_PATH_REGEX');
	a(t('/'), '/');
	a(t('foo'), 'foo');
	a(t('foo/bar'), 'foo/bar');
	a(t('foo/bar/loerm'), 'foo/bar/loerm');
	a(t('[a-z]+'), '[a-z]+');
	a(t('[a-z]+/[a-z]+'), '[a-z]+/[a-z]+');
	a(t('foo/[a-z]+/bar'), 'foo/[a-z]+/bar');
};
