'use strict';

angular.module('emulvcApp')
	.service('Httphandler', function Httphelper($rootScope, $http, HistoryService, viewState, ConfigProviderService, Soundhandlerservice, Ssffparserservice, Wavparserservice, Espsparserservice) {
		var sServObj = {};

		/**
		 *
		 */
		sServObj.findFileInUtt = function (utt, fileExt) {
			var res;
			utt.files.forEach(function (f) {
				// do suffix check
				if (f.indexOf(fileExt, f.length - f.length) !== -1) {
					res = f;
				}
			});
			return (res);
		};

		/**
		 *
		 */
		sServObj.getUttList = function (filePath) {
			var getProm = $http.get(filePath);
			return getProm;
		};


		/**
		 *
		 */
		sServObj.getSSFFfile = function (filePath) {
			$http.get(filePath, {
				responseType: 'arraybuffer'
			}).success(function (data) {
				var ssffJso = Ssffparserservice.ssff2jso(data);
				ssffJso.fileURL = document.URL + filePath;
				$rootScope.$broadcast('newlyLoadedSSFFfile', ssffJso, filePath.replace(/^.*[\\\/]/, ''));
			});
		};

		/**
		 *
		 */
		sServObj.getESPS = function (filePath) {
			$http.get(filePath).success(function (data) {
				var labelJSO = Espsparserservice.toJSO(data, filePath);
				$rootScope.$broadcast('newlyLoadedLabelJson', labelJSO);
			}).
			error(function (data, status) {
				console.log('Request failed with status: ' + status);
			});
		};


		/**
		 *
		 */
		sServObj.getUtt = function (utt) {
			var curFile;

			// load audio file first
			curFile = sServObj.findFileInUtt(utt, ConfigProviderService.vals.signalsCanvasConfig.extensions.audio);

			$http.get(curFile, {
				responseType: 'arraybuffer'
			}).then(function (vals) {
				// console.log(data)
				var wavJSO = Wavparserservice.wav2jso(vals.data);

				return wavJSO;
			}).then(function (wavJSO) {
				// set needed vals
				viewState.curViewPort.sS = 0;
				viewState.curViewPort.eS = wavJSO.Data.length;
				// for dev
				// viewState.curViewPort.sS = 22136;
				// viewState.curViewPort.eS = 22145;
				
				viewState.curViewPort.bufferLength = wavJSO.Data.length;
				viewState.setscrollOpen(0);
				viewState.resetSelect();
				Soundhandlerservice.wavJSO = wavJSO;
				$rootScope.$broadcast('cleanPreview');
			}).then(function () {
				ConfigProviderService.vals.signalsCanvasConfig.extensions.signals.forEach(function (ext) {
					curFile = sServObj.findFileInUtt(utt, ext);
					sServObj.getSSFFfile(curFile);
				});
			}).then(function () {
				// load label files
				ConfigProviderService.vals.labelCanvasConfig.order.forEach(function (ext) {
					curFile = sServObj.findFileInUtt(utt, ext);
					console.log(curFile);
					sServObj.getESPS(curFile);
				});
			}).then(function () {
				console.log('history');
				HistoryService.history();
			});
		};

		return sServObj;
				// /**
		//  *
		//  */
		// sServObj.postSaveSSFF = function() {

		// 	var data = Ssffparserservice.jso2ssff(Ssffdataservice.data[0]); // SIC hardcoded [0];
		// 	// console.log($location.absUrl());


		// 	var binary = '';
		// 	var bytes = new Uint8Array(data);
		// 	var len = bytes.byteLength;
		// 	for (var i = 0; i < len; i++) {
		// 		binary += String.fromCharCode(bytes[i])
		// 	}
		// 	var base64 = window.btoa(binary);

		// 	$http({
		// 		url: 'index.html',
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		data: {
		// 			method: 'saveSSFFfile',
		// 			fileURL: Ssffdataservice.data[0].fileURL.split($location.absUrl())[1],
		// 			data: base64
		// 		}
		// 	}) //.success(function() {});
		// };
	});