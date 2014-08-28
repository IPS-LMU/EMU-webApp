'use strict';

describe('Service: ArrayHelperService', function () {

	// load the controller's module
	beforeEach(module('emuwebApp'));

	var deferred, $rootScope;

	beforeEach(function () {
		inject(function ($q, _$rootScope_) {
			$rootScope = _$rootScope_;
			deferred = $q.defer();
		});
	});

	/**
	 *
	 */
	it('should find thresholds in mock array', inject(function (AnagestService, ArrayHelperService, viewState) {
		var x = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		var minVal = 13;
		var maxVal = 19;
		var threshold = 0.2;
		var direction = 1;
		var res = AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction);
		// console.log(res);
		// expect(viewState.round(res, 1)).toEqual(3.2);

		// threshold = 0.35
		// var res = AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction);
		// expect(viewState.round(res, 1)).toEqual(4.1);

		// threshold = 0.8;
		// var res = AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction);
		// expect(viewState.round(res, 1)).toEqual(6.8);

		// // change direction
		// threshold = 0.2;
		// var res = AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1);
		// expect(res.length).toEqual(0);

		// var x = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11]
		// var res = AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1);
		// expect(viewState.round(res, 1)).toEqual(5.8);
	}));

});