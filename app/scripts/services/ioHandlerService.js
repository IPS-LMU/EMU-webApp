'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, $location, $q, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice, ConfigProviderService, Espsparserservice, Ssffdataservice) {
		// shared service object
		var sServObj = {};

		/**
		 *
		 */
		sServObj.postSaveSSFF = function() {

			var data = Ssffparserservice.jso2ssff(Ssffdataservice.data[0]); // SIC hardcoded [0];
			console.log()
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
			console.log('loading utt');
			console.log(utt);
			var curFile;

			var defer = $q.defer();
			curFile = sServObj.findFileInUtt(utt, ConfigProviderService.vals.signalsCanvasConfig.extensions.audio);

			$http.get(curFile, {
				responseType: 'arraybuffer'
			}).success(function(data) {
				var wavJSO = Wavparserservice.wav2jso(data);
				// $rootScope.$broadcast('newlyLoadedAudioFile', wavJSO, filePath.replace(/^.*[\\\/]/, ''));
				return wavJSO;
			}).then(function(newData){
				console.log(newData)
			})

			defer.promise
				.then(function(result){
				    	curFile = sServObj.findFileInUtt(utt, ConfigProviderService.vals.signalsCanvasConfig.extensions.audio);
						sServObj.httpGetAudioFile(curFile);
					}, function(error){
    					$scope.openModal('views/error.html', 'dialog', 'wav Loading error','Error loading Wave File !');
				}).then(function(result){
					// load signal files
					ConfigProviderService.vals.signalsCanvasConfig.extensions.signals.forEach(function(ext) {
						curFile = sServObj.findFileInUtt(utt, ext);
						sServObj.httpGetSSFFfile(curFile);
					});
				}, function(error){
					    $scope.openModal('views/error.html', 'dialog', 'ssff Loading error','Error loading ssff File !');
				  }).then(function(result){
				  	// load label files
					ConfigProviderService.vals.labelCanvasConfig.order.forEach(function(ext) {
						curFile = sServObj.findFileInUtt(utt, ext);
						sServObj.httpGetESPS(curFile);
					});
				 	}, function(error){
					    $scope.openModal('views/error.html', 'dialog', 'esps Loading error','Error loading esps File !');
				});
			defer.resolve();
			console.log("finished loading utt");
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