'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http) {
		// shared service object
		var sServObj = {};

		sServObj.httpGetLabelJson = function() {
			$http.get('testData/PhoneticTier.json').success(function(data) {
				console.log(data);
				$rootScope.$broadcast('newlyLoadedLabelJson', data);
			});
		};

		sServObj.httpGetAudioFile = function() {
			var my = this;
			$http.get('testData/msajc003.wav', {
				responseType: "arraybuffer"
			}).success(function(data) {
				console.log(data)
				$rootScope.$broadcast('newlyLoadedAudioFile', data);
			}).
			error(function(data, status) {
				console.log("Request failed with status: " + status);
			});
		};

		return sServObj;
	});