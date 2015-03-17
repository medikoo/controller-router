'use strict';

module.exports = function (t, a) {
	a.deep(t('/'), { path: '/', direct: true, tokens: [], matchPositions: [] });
	a.deep(t('foo'), { path: 'foo', direct: true, tokens: ['foo'], matchPositions: [] });
	a.deep(t('foo/bar'), { path: 'foo/bar', direct: true, tokens: ['foo', 'bar'],
		matchPositions: [] });
	a.deep(t('foo/[a-z]+'), { path: 'foo/[a-z]+', direct: false,
		tokens: ['foo', new RegExp(/^[a-z]+$/)], matchPositions: [1] });
	a.deep(t('foo/[a-z]+/bar/\\d+'), { path: 'foo/[a-z]+/bar/\\d+', direct: false,
		tokens: ['foo', new RegExp(/^[a-z]+$/), 'bar', new RegExp(/^\d+$/)], matchPositions: [1, 3] });
};
