'use strict';

angular.module('emulvcApp')
	.service('ConfigProviderService', function ConfigProviderService($rootScope, $http) {

		// shared service object
		var sServObj = {};
		sServObj.vals = {};

		/**
		 *
		 */
		sServObj.httpGetConfig = function () { // SIC SIC SIC...
			$http.get('configFiles/defaultConfig.json').success(function (data) {
				sServObj.setVals(data);
				$rootScope.$broadcast('configLoaded', data);
			});
		};

		/**
		 * depth of 2 = max
		 */
		sServObj.setVals = function (data) {
			if ($.isEmptyObject(sServObj.vals)) {
				sServObj.vals = data;
			} else {
				Object.keys(data).forEach(function (key1) {
					// console.log(key1 + ' : ' + data[key1]);
					// sServObj.vals[key1] = data[key1];
					Object.keys(data[key1]).forEach(function (key2) {
						if (sServObj.vals[key1][key2] !== undefined) {
							// console.log('\t' + key2);
							// console.log(data[key1][key2]);
							sServObj.vals[key1][key2] = data[key1][key2];
						} else {
							console.error('BAD ENTRY IN CONFIG');
						}
					});

				});
			}
		};

		return sServObj;

	});