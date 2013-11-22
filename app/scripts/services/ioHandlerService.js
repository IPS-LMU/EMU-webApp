'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, $location, $q, HistoryService, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice, ConfigProviderService, Espsparserservice, Ssffdataservice, Websockethandler) {
		// shared service object
		var sServObj = {};

		sServObj.wsH = Websockethandler;		

		/**
		 *
		 */
		sServObj.postSaveSSFF = function() {

			var data = Ssffparserservice.jso2ssff(Ssffdataservice.data[0]); // SIC hardcoded [0];
			// console.log($location.absUrl());


			var binary = '';
			var bytes = new Uint8Array(data);
			var len = bytes.byteLength;
			for (var i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i])
			}
			var base64 = window.btoa(binary);

			$http({
				url: 'index.html',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				data: {
					method: 'saveSSFFfile',
					fileURL: Ssffdataservice.data[0].fileURL.split($location.absUrl())[1],
					data: base64
				}
			}) //.success(function() {});
		};


		/**
		 *
		 */
		sServObj.httpGetUttJson = function(filePath) {
			$http.get(filePath).success(function(data) {
				// console.log(data);
				$rootScope.$broadcast('newlyLoadedUttList', data);
			});
		};

		/**
		 *
		 */
		sServObj.httpGetLabelJson = function(filePath) {
			$http.get(filePath).success(function(data) {
				// console.log(data);
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
			}).
			error(function(data, status) {
				console.log('Request failed with status: ' + status);
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
			var curFile;

			// load audio file first
			curFile = sServObj.findFileInUtt(utt, ConfigProviderService.vals.signalsCanvasConfig.extensions.audio);

			$http.get(curFile, {
				responseType: 'arraybuffer'
			}).then(function(vals) {
				// console.log(data)
				var wavJSO = Wavparserservice.wav2jso(vals.data);
				
				return wavJSO;
			}).then(function(wavJSO) {
				// set needed vals
				viewState.curViewPort.sS = 0;
				viewState.curViewPort.eS = wavJSO.Data.length;
				viewState.curViewPort.bufferLength = wavJSO.Data.length;
				viewState.setscrollOpen(0);
				viewState.resetSelect();
				Soundhandlerservice.wavJSO = wavJSO;
				$rootScope.$broadcast('cleanPreview');
			}).then(function() {
				ConfigProviderService.vals.signalsCanvasConfig.extensions.signals.forEach(function(ext) {
					curFile = sServObj.findFileInUtt(utt, ext);
					sServObj.httpGetSSFFfile(curFile);
				});
			}).then(function() {
				// load label files
				ConfigProviderService.vals.labelCanvasConfig.order.forEach(function(ext) {
					curFile = sServObj.findFileInUtt(utt, ext);
					sServObj.httpGetESPS(curFile);
					console.log(curFile);
				});
			}).then(function() {
			    console.log("history");
			    HistoryService.history();
			});
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