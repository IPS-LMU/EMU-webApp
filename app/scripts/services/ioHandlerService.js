'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice, ConfigProviderService, Espsparserservice) {
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
		sServObj.httpGetESPS = function(filePath) {
			$http.get(filePath).success(function(data) {
				var labelJSO = Espsparserservice.toJSO(data, filePath);
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
		sServObj.httpGetUtterence = function(utt) {
			console.log("loading utt")
			var curFile;

			viewState.loadingUtt = true;
			// load audio file
			curFile = sServObj.findFileInUtt(utt, ConfigProviderService.vals.signalsCanvasConfig.extensions.audio);
			sServObj.httpGetAudioFile(curFile);

			// load signal files
			ConfigProviderService.vals.signalsCanvasConfig.extensions.signals.forEach(function(ext) {
				curFile = sServObj.findFileInUtt(utt, ext);
				sServObj.httpGetSSFFfile(curFile);
			})

			// load label files
			ConfigProviderService.vals.labelCanvasConfig.order.forEach(function(ext) {
				curFile = sServObj.findFileInUtt(utt, ext);
				sServObj.httpGetESPS(curFile);
			})

			viewState.loadingUtt = false; // SIC in async behaviour!!!
			console.log("finished loading utt")
		};

		/**
		 *
		 */
		sServObj.findFileInUtt = function(utt, fileExt) {
			var res;
			utt.files.forEach(function(f) {
				// do suffix check
				if (f.indexOf(fileExt, f.length - f.length) !== -1) {
					res = f;
				}
			})
			return (res);
		};


		/**
		 * pass through to Textgridparserservice
		 */
		sServObj.toTextGrid = function(labelJSO) {
			return (Textgridparserservice.toTextGrid(labelJSO));
		};


		return sServObj;
	});