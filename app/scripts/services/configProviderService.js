'use strict';

angular.module('emulvcApp')
	.service('ConfigProviderService', function ConfigProviderService() {

		// shared service object
		var sServObj = {};
		sServObj.vals = {};

		/**
		 * depth of 2 = max
		 */
		sServObj.setVals = function (data) {
			if ($.isEmptyObject(sServObj.vals)) {
				sServObj.vals = data;
			} else {
				Object.keys(data).forEach(function (key1) {
					Object.keys(data[key1]).forEach(function (key2) {
						if (sServObj.vals[key1][key2] !== undefined) {
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