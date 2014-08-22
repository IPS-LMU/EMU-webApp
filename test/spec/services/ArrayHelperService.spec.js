'use strict';

describe('Service: ArrayHelperService', function () {

	// load the controller's module
	beforeEach(module('emuwebApp'));


	/**
	 *
	 */
	it('should find min/max in mock array', inject(function (ArrayHelperService) {
		var mockArr = [123, 3, 432, 2, 4, 4];

		var res = ArrayHelperService.findMinMax(mockArr, 'min');
		expect(res.val).toEqual(2);
		expect(res.idx).toEqual(3);

		res = ArrayHelperService.findMinMax(mockArr, 'max');
		expect(res.val).toEqual(432);
		expect(res.idx).toEqual(2);

	}));


	/**
	 *
	 */
	it('should create absolute array of mock array', inject(function (ArrayHelperService) {
		var mockArr = [3, 2, 1, 1, -1, -2, -3, -4];

		var res = ArrayHelperService.convertToAbsValues(mockArr);
		expect(res.length).toEqual(8);
		expect(res[0]).toEqual(3);
		expect(res[7]).toEqual(4);

	}));

	/**
	 *
	 */
	it('should find thresholds in mock array', inject(function (ArrayHelperService, viewState) {
		var x = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
		var minVal = 13
		var maxVal = 19
		var threshold = 0.2
		var direction = 1
		var res = ArrayHelperService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction);
		expect(viewState.round(res, 1)).toEqual(3.2);

		threshold = 0.35
		var res = ArrayHelperService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction);
		expect(viewState.round(res, 1)).toEqual(4.1);

		threshold = 0.8;
		var res = ArrayHelperService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction);
		expect(viewState.round(res, 1)).toEqual(6.8);

		// change direction
		threshold = 0.2;
		var res = ArrayHelperService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1);
		expect(res.length).toEqual(0);

		var x = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11]
		var res = ArrayHelperService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1);
		expect(viewState.round(res, 1)).toEqual(5.8);
	}));

	/**
	 *
	 */
	it('should multiply each element of array with value', inject(function (ArrayHelperService) {
		var mockArr = [3, 2, 1, 1, -1, -2, -3, -4];

		var res = ArrayHelperService.multiplyEachElement(mockArr, 2);
		expect(res.length).toEqual(8);
		expect(res[0]).toEqual(6);
		expect(res[7]).toEqual(-8);

	}));

	/**
	 *
	 */
	it('should do calculate correct interpolation', inject(function (ArrayHelperService, viewState) {
		var res = ArrayHelperService.interp2points(1, 1, 2, 2, 1.5);
		expect(res).toEqual(1.5);
		var res = ArrayHelperService.interp2points(14, 4, 15, 5, 14.2);
		expect(viewState.round(res, 1)).toEqual(4.2);
		var res = ArrayHelperService.interp2points(-42, 3, 125, 41, 0);
		expect(res).toEqual(12.55688622754491);

	}));

	/**
	 *
	 */
	it('should flatten array of arrays', inject(function (ArrayHelperService) {

		var arrOfArrs = [
			[1],
			[2],
			[3],
			[4],
			[5, 6]
		];
		expect(typeof arrOfArrs[0]).toEqual('object');
		var flatArr = ArrayHelperService.flattenArrayOfArray(arrOfArrs);
		expect(typeof flatArr[0]).toEqual('number');

	}));

});