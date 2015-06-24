'use strict';

module.exports = function (t, a) {
	a(t('foo'), true);
	a(t('foo-bar'), true);
	a(t('0'), true);
	a(t('0foo'), true);
	a(t('0-2-3'), true);
	a(t('0-foo-3-bar'), true);
	a(t('foo-3-bar'), true);
	a(t('[a-z]+'), false);
	a(t('\\d+'), false);
	a(t('\\d{3}'), false);
	a(t('\\d{3,}'), false);
};
