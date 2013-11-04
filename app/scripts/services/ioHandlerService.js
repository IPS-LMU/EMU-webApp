'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice) {
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
				$rootScope.$broadcast('newlyLoadedAudioFile', wavJSO, filePath.replace(/^.*[\\\/]/, ''));
			}).
			error(function(data, status) {
				console.log('Request failed with status: ' + status);
			});
		};

		/**
		 *
		 */
		sServObj.findTimeOfMinSample = function() {
			return 0.000000; // maybe needed at some point...
		};

		/**
		 *
		 */
		sServObj.findTimeOfMaxSample = function() {
			return viewState.curViewPort.bufferLength / Soundhandlerservice.wavJSO.SampleRate;
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
				$rootScope.$broadcast('newlyLoadedSSFFfile', ssffJso, filePath.replace(/^.*[\\\/]/, ''));
			});
		};

		/**
		 *
		 */
		sServObj.httpGetUtterence = function(utt, pathPrefix) {
			console.log("sdfasdf")
			utt.files.forEach(function(f){	
				// do suffix check for now and load accordingly
				if(f.indexOf('wav', f.length - f.length) !== -1){
					sServObj.httpGetAudioFile('testData/msajc003/msajc003.wav')
				}
				if(f.indexOf('TextGrid', f.length - f.length) !== -1){
					// sServObj.httpGetTextGrid('testData/msajc003/msajc003.TextGrid');
				}
			});

		};


		/**
		 * pass through to Textgridparserservice
		 */
		sServObj.toTextGrid = function(labelJSO) {
			return (Textgridparserservice.toTextGrid(labelJSO));
		};


		return sServObj;
	});