'use strict';

angular.module('emulvcApp')
	.service('ConfigProviderService', function ConfigProviderService($rootScope, $http) {

		// shared service object
		var sServObj = {};
		sServObj.vals = {};

		/**
		 *
		 */
		sServObj.httpGetConfig = function() { // SIC SIC SIC... und gar nicht teuer...
			$http.get('configFiles/defaultConfig.json').success(function(data) {
				sServObj.setVals(data);
				$rootScope.$broadcast('configLoaded', data);
			});
		};

		/**
		 * depth of 3 = max
		 */
		sServObj.setVals = function(data) {
			if ($.isEmptyObject(sServObj.vals)) {
				console.log(data)
				sServObj.vals = data;
			} else {
				console.log(data)
				Object.keys(data).forEach(function(key1) {
					console.log(key1 + ' : ' + data[key1]);
					sServObj.vals[key1] = data[key1];
					Object.keys(data[key1]).forEach(function(key2) {
						console.log('\t' + key2);
					})

				})
			}
		};

		return sServObj;

	});