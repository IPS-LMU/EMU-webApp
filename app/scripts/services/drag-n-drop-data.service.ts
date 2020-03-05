import * as angular from 'angular';

angular.module('emuwebApp')
	.service('DragnDropDataService', function DragnDropDataService($q) {

		this.convertedBundles = [];
		this.sessionDefault = '';

		///////////////////////////////
		// public api

		this.getBundle = function (name) {
			var defer = $q.defer();
			this.convertedBundles.forEach((bundle) => {
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

		this.resetToInitState = function () {
			this.convertedBundles = [];
			this.sessionDefault = '';
		};

		this.setDefaultSession = function (name) {
			this.sessionDefault = name;
		};

		this.getDefaultSession = function () {
			return this.sessionDefault;
		};

	});
