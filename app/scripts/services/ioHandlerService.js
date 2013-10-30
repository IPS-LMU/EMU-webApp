'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, Ssffparserservice, Wavparserservice, Textgridparserservice) {
		// shared service object
		var sServObj = {};

		/**
		 *
		 */
		sServObj.httpGetLabelJson = function(filePath) {
			$http.get(filePath).success(function(data) {
				console.log(data);
				$rootScope.$broadcast('newlyLoadedLabelJson', data);
			});
		};

		/**
		 * 
		 */
		sServObj.httpGetTextGrid = function(filePath) {
			$http.get(filePath).success(function(data) {
				var labelJSO = Textgridparserservice.toJSO(data)
				// console.log(labelJSO);
				$rootScope.$broadcast('newlyLoadedLabelJson', labelJSO);
			});
		};

		/**
		 *
		 */
		sServObj.httpGetAudioFile = function(filePath) {
			// var my = this;
			$http.get(filePath, {
				responseType: 'arraybuffer'
			}).success(function(data) {
				var wavJSO = Wavparserservice.wav2jso(data);
				$rootScope.$broadcast('newlyLoadedAudioFile', wavJSO, filePath);
			}).
			error(function(data, status) {
				console.log('Request failed with status: ' + status);
			});
		};

		/**
		 *
		 */
		sServObj.httpGetSSFFfile = function(filePath) {
			$http.get(filePath, {
				responseType: 'arraybuffer'
			}).success(function(data) {
				var ssffJso = Ssffparserservice.ssff2jso(data);
				ssffJso.fileURL = document.URL + filePath;
				$rootScope.$broadcast('newlyLoadedSSFFfile', ssffJso);
			});
		};


		return sServObj;
	});