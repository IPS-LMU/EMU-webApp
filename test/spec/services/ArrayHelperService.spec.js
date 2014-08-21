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
	it('should find thresholds in mock array', inject(function (ArrayHelperService) {
		var th = 0.2;
		
		// simple single threshold
		var mockArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		var res = ArrayHelperService.findThresholds(mockArr, 2, 8, th);
		expect(res[0]).toEqual(2);

		// reversed array
		mockArr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
		var res = ArrayHelperService.findThresholds(mockArr, 2, 8, th);
		// console.log(res)

		// multiple thresholds
		mockArr = [1, 2, 3, 4, 5, 4, 4, 3, 2];
		res = ArrayHelperService.findThresholds(mockArr, 2, 8, th);
		expect(res.length).toEqual(2);
		expect(res[0]).toEqual(2);
		expect(res[1]).toEqual(6);
	}));


});