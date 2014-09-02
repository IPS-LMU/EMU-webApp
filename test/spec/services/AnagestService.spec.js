'use strict';

describe('Service: AnagestService', function () {


	var deferred, $rootScope;
	var mockDialogService = {};


	// load the controller's module
	beforeEach(module('emuwebApp'));

	beforeEach(module(function ($provide) {
		$provide.value('dialogService', mockDialogService);
	}));

	beforeEach(inject(function (dialogService, $q, _$rootScope_) {
		$rootScope = _$rootScope_;

		// mock open function 
		mockDialogService.open = function () {
			var deferred = $q.defer();
			deferred.resolve('called open on dialogService');
			return deferred.promise;
		};
	}));

	/**
	 *
	 */
	it('should find thresholds in mock array', inject(function (AnagestService, viewState) {
		var x = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		var minVal = 13;
		var maxVal = 19;
		var threshold = 0.2;
		var direction = 1;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(viewState.round(res, 1)).toEqual(3.2);
		});
		$rootScope.$apply();

		threshold = 0.35;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(viewState.round(res, 1)).toEqual(4.1);
		});
		$rootScope.$apply();


		threshold = 0.8;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(viewState.round(res, 1)).toEqual(6.8);
		});
		$rootScope.$apply();


		// change direction
		// should call error dialog -> no thresholds found
		threshold = 0.2;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1).then(function (res) {}, function (err) {
			expect(err).toEqual('Could not find any values that step over the threshold!!');
		});
		$rootScope.$apply();

		// new values
		x = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11];

		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1).then(function (res) {
			expect(viewState.round(res, 1)).toEqual(5.8);
		});
		$rootScope.$apply();

	}));

});