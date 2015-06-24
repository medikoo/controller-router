'use strict';

module.exports = function (a, b) {
	var result;
	if (a.matchPositionsLength !== b.matchPositionsLength) {
		return a.matchPositionsLength - b.matchPositionsLength;
	}
	a.matchPositions.some(function (aPos, index) {
		var bPos = b.matchPositions[index];
		if (aPos === bPos) return false;
		return (result = bPos - aPos);
	});
	return result || 0;
};
