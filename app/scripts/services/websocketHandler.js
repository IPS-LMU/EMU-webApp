'use strict';

angular.module('emulvcApp')
	.service('Websockethandler', function Websockethandler($q, $rootScope, $location, HistoryService, Ssffparserservice, ConfigProviderService, viewState, Wavparserservice, Soundhandlerservice, Espsparserservice, uuid, Binarydatamaniphelper, Ssffdataservice, dialogService) {
		// shared service object
		var sServObj = {};
		// Keep all pending requests here until they get responses
		var callbacks = {};
		// Create a unique callback ID to map requests to responses
		// var currentCallbackId = 0;
		// Create our websocket object with the address to the websocket
		var ws = {};

		// empty promise object to be resolved when connection is up
		var conPromise = {};

		var connected = false;

		// var promises = [];

		////////////////////////////
		// handle received functions

		function handleReceivedESPS(fileName, data) {
			var labelJSO = Espsparserservice.toJSO(data, fileName);
			$rootScope.$broadcast('newlyLoadedLabelJson', labelJSO);
		}

		function handleReceivedSSFF(fileName, data) {
			var arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(data);
			var ssffJso = Ssffparserservice.ssff2jso(arrBuff);
			ssffJso.fileURL = document.URL + fileName;
			$rootScope.$broadcast('newlyLoadedSSFFfile', ssffJso, fileName.replace(/^.*[\\\/]/, ''));
		}

		////////////////////////////
		// ws function

		// broadcast on open
		function wsonopen(message) {
			connected = true;
			$rootScope.$broadcast('connectedToWSserver');
			$rootScope.$apply(conPromise.resolve(message));
		}

		function wsonmessage(message) {
			listener(JSON.parse(message.data));
		}

		function wsonerror(message) {
			console.log(message);
			console.log('WEBSOCKET ERROR!!!!!');
			$rootScope.$apply(conPromise.resolve(message));
		}

		function wsonclose(message) {
			connected = false;
			console.log(message);
			console.log('WEBSOCKET closed!!!!!');
		}

		function sendRequest(request) {
			var defer = $q.defer();
			var callbackId = getCallbackId();
			callbacks[callbackId] = {
				time: new Date(),
				cb: defer
			};
			request.callbackID = callbackId;
			// console.log('Sending request', request);
			ws.send(JSON.stringify(request));
			return defer.promise;
		}

		function listener(data) {
			var messageObj = data;
			// console.log("Received data from websocket: ", messageObj);
			// If an object exists with callbackID in our callbacks object, resolve it
			if (callbacks.hasOwnProperty(messageObj.callbackID)) {
				// console.log(callbacks[messageObj.callbackID]);
				// console.log('resolving callback: ' + messageObj.type + ' Nr.: ' + messageObj.callbackID);
				switch (messageObj.type) {
				case 'getESPSfile':
					handleReceivedESPS(messageObj.fileName, messageObj.data);
					break;
				case 'getSSFFfile':
					handleReceivedSSFF(messageObj.fileName, messageObj.data);
					break;
				}

				$rootScope.$apply(callbacks[messageObj.callbackID].cb.resolve(messageObj.data));

				delete callbacks[messageObj.callbackID];
				if (viewState.curTaskPercCompl >= 100) {
					viewState.curTaskPercCompl = 0;
					dialogService.close();
				} else {
					viewState.curTaskPercCompl += 1;
				}
			}
		}

		// This creates a new callback ID for a request
		function getCallbackId() {
			var newUUID = uuid.new();
			return newUUID;
		}

		///////////////////////////////////////////
		// public api
		sServObj.initConnect = function (url) {
			var defer = $q.defer();
			ws = new WebSocket(url);
			ws.onopen = wsonopen;
			ws.onmessage = wsonmessage;
			ws.onerror = wsonerror;
			ws.onclose = wsonclose;

			conPromise = defer;
			return defer.promise;
		};

		//
		sServObj.isConnected = function () {
			return connected;
		};

		// close connection with ws
		sServObj.closeConnect = function () {
			ws.onclose = function () {};
			ws.close();

		};

		// ws getProtocol
		sServObj.getProtocol = function () {
			var request = {
				type: 'getProtocol'
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws getDoUserManagement
		sServObj.getDoUserManagement = function () {
			var request = {
				type: 'getDoUserManagement'
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws getConfigFile
		sServObj.getConfigFile = function () {
			var request = {
				type: 'getConfigFile'
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws getUsrUttList
		sServObj.getUsrUttList = function (usrName) {
			var request = {
				type: 'getUttList',
				usrName: usrName
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws getAudioFile
		sServObj.getSSFFfile = function (fileName) {
			var request = {
				type: 'getSSFFfile',
				fileName: fileName
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws getAudioFile
		sServObj.getESPSfile = function (fileName) {
			var request = {
				type: 'getESPSfile',
				fileName: fileName
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws getAudioFile
		sServObj.getAudioFile = function (fileName) {
			var request = {
				type: 'getAudioFile',
				fileName: fileName
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws checkAccessCode
		sServObj.checkAccessCode = function (code) {
			var request = {
				type: 'checkAccessCode',
				data: code
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws request for saving uttList
		sServObj.saveUsrUttList = function (usrName, uttList) {
			var stripped = angular.toJson(uttList); // remove $$hash
			var request = {
				type: 'saveUttList',
				usrName: usrName,
				data: stripped // is sting!!!
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws request for saving ssff file
		sServObj.saveSSFFfile = function (fName) {
			var ssffJSO = Ssffdataservice.getDataOfFile(fName);
			var buf = Ssffparserservice.jso2ssff(ssffJSO);
			var base64 = Binarydatamaniphelper.arrayBufferToBase64(buf);

			var request = {
				type: 'saveSSFFfile',
				fileURL: ssffJSO.fileURL.split($location.absUrl())[1],
				data: base64
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		// ws request for saving esps file
		sServObj.saveESPSfile = function (fName) {
			console.log(fName);
		};

		// ws get Utt from ws server
		sServObj.getUtt = function (utt) {
			var promises = [];
			var getUttPromise = $q.defer();
			var curProm;
			var curFile;

			// load audio file first
			curFile = sServObj.findFileInUtt(utt, ConfigProviderService.vals.signalsCanvasConfig.extensions.audio);
			//console.log(curFile)
			sServObj.getAudioFile(curFile).then(function (audioF) {
				// var arrBuff = stringToArrayBuffer(audioF);
				var arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(audioF);
				console.log(typeof arrBuff);

				var wavJSO = Wavparserservice.wav2jso(arrBuff);
				return wavJSO;
			}).then(function (wavJSO) {
				// set needed vals
				viewState.curViewPort.sS = 0;
				viewState.curViewPort.eS = wavJSO.Data.length;
				viewState.curViewPort.bufferLength = wavJSO.Data.length;
				viewState.setscrollOpen(0);
				viewState.resetSelect();
				Soundhandlerservice.wavJSO = wavJSO;
				$rootScope.$broadcast('cleanPreview');
			}).then(function () {
				// load signal files
				ConfigProviderService.vals.signalsCanvasConfig.extensions.signals.forEach(function (ext) {
					curFile = sServObj.findFileInUtt(utt, ext);
					curProm = sServObj.getSSFFfile(curFile);
					promises.push(curProm);
				});
				// load label files
				ConfigProviderService.vals.labelCanvasConfig.order.forEach(function (ext) {
					curFile = sServObj.findFileInUtt(utt, ext);
					curProm = sServObj.getESPSfile(curFile);
					promises.push(curProm);
				});

			});

			$q.all(promises).then(function () {
				getUttPromise.resolve('finishedLoadingUtt');
			});

			return getUttPromise.promise;

		};

		// ws save Utt to ws server
		sServObj.saveUtt = function (utt) {
			var promises = [];
			var saveUttPromise = $q.defer();
			var curProm;
			var curFile;

			curFile = sServObj.findFileInUtt(utt, ConfigProviderService.vals.signalsCanvasConfig.extensions.audio);
			ConfigProviderService.vals.signalsCanvasConfig.extensions.signals.forEach(function (ext) {
				curFile = sServObj.findFileInUtt(utt, ext);
				curProm = sServObj.saveSSFFfile(curFile);
				promises.push(curProm);
			});

			ConfigProviderService.vals.labelCanvasConfig.order.forEach(function (ext) {
				curFile = sServObj.findFileInUtt(utt, ext);
				curProm = sServObj.saveESPSfile(curFile);
				promises.push(curProm);
			});

			$q.all(promises).then(function () {
				saveUttPromise.resolve('finishedSavingUtt');
			});

			return saveUttPromise.promise;

		};


		// helper function to find file in utt
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

		return sServObj;
	});