'use strict';

angular.module('emulvcApp')
	.service('ConfigProviderService', function ConfigProviderService($rootScope, $http) {

		// shared service object
		var sServObj = {};
		sServObj.vals = {};

		sServObj.httpGetConfig = function() { // SIC SIC SIC... und gar nicht teuer...
			$http.get('configFiles/defaultConfig.json').success(function(data) {
				sServObj.vals = data;
				$rootScope.$broadcast('configLoaded', data);
			});
		};


		return sServObj;

	});