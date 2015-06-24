'use strict';

module.exports = function (t, a) {
	a.deep(t('/'), { path: '/', static: true, tokens: [], matchPositions: [] });
	a.deep(t('foo'), { path: 'foo', static: true, tokens: ['foo'], matchPositions: [] });
	a.deep(t('foo/bar'), { path: 'foo/bar', static: true, tokens: ['foo', 'bar'],
		matchPositions: [] });
	a.deep(t('foo/[a-z]+'), { path: 'foo/[a-z]+', static: false,
		tokens: ['foo', new RegExp(/^[a-z]+$/)], matchPositions: [1] });
	a.deep(t('foo/[a-z]+/bar/\\d+'), { path: 'foo/[a-z]+/bar/\\d+', static: false,
		tokens: ['foo', new RegExp(/^[a-z]+$/), 'bar', new RegExp(/^\d+$/)], matchPositions: [1, 3] });
};
