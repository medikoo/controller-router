'use strict';

module.exports = function (t, a) {
	var conf1 = {
		matchPositionsLength: 3,
		matchPositions: [2, 4, 5]
	};
	var conf2 = {
		matchPositionsLength: 2,
		matchPositions: [8, 9]
	};
	var conf3 = {
		matchPositionsLength: 3,
		matchPositions: [1, 7, 9]
	};
	a.deep([conf1, conf2, conf3].sort(t), [conf2, conf1, conf3]);
};
