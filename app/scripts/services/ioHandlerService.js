'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, Ssffparserservice) {
		// shared service object
		var sServObj = {};

		/**
		 *
		 */
		sServObj.httpGetLabelJson = function() {
			$http.get('testData/msajc003.json').success(function(data) {
				console.log(data);
				$rootScope.$broadcast('newlyLoadedLabelJson', data);
			});
		};

		/**
		 *
		 */
		sServObj.httpGetAudioFile = function(filePath) {
			// var my = this;
			$http.get('testData/msajc003.wav', {
				responseType: "arraybuffer"
			}).success(function(data) {
				$rootScope.$broadcast('newlyLoadedAudioFile', data);
			}).
			error(function(data, status) {
				console.log("Request failed with status: " + status);
			});
		};

		/**
		 *
		 */
		sServObj.httpGetSSFFfile = function(filePath) {
			$http.get(filePath, {
				responseType: "arraybuffer"
			}).success(function(data) {
				var ssffJso = Ssffparserservice.ssff2jso(data);
				$rootScope.$broadcast('newlyLoadedSSFFfile', ssffJso);
			});
		};


		return sServObj;
	});