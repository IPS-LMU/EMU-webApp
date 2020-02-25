import * as angular from 'angular';

angular.module('emuwebApp')
	.service('DragnDropDataService', function DragnDropDataService($q) {
		// shared service object
		var sServObj = {} as any;
		sServObj.convertedBundles = [];
		sServObj.sessionDefault = '';

		///////////////////////////////
		// public api

		sServObj.getBundle = function (name) {
			var defer = $q.defer();
			angular.forEach(sServObj.convertedBundles, function (bundle) {
				if (bundle.name === name) {
					var bc = angular.copy(bundle);
					delete bc.name;
					defer.resolve({
						status: 200,
						data: bc
					});
				}
			});
			return defer.promise;
		};

		sServObj.resetToInitState = function () {
			sServObj.convertedBundles = [];
			sServObj.sessionDefault = '';
		};

		sServObj.setDefaultSession = function (name) {
			sServObj.sessionDefault = name;
		};

		sServObj.getDefaultSession = function () {
			return sServObj.sessionDefault;
		};

		return sServObj;
	});
