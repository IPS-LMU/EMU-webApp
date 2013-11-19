'use strict';

angular.module('emulvcApp')
	.service('Websockethandler', function Websockethandler($q, $rootScope) {
		// We return this object to anything injecting our service
		var Service = {};
		// Keep all pending requests here until they get responses
		var callbacks = {};
		// Create a unique callback ID to map requests to responses
		var currentCallbackId = 0;
		// Create our websocket object with the address to the websocket
		var ws = {};
		// var ws = new WebSocket("ws://localhost:8080"); // SIC hardcoded

		function wsonopen() {
			console.log("Socket has been opened!");
			$rootScope.$broadcast('connectedToWSserver');

		}

		function wsonmessage(message) {
			listener(JSON.parse(message.data));
		}

		function sendRequest(request) {
			var defer = $q.defer();
			var callbackId = getCallbackId();
			callbacks[callbackId] = {
				time: new Date(),
				cb: defer
			};
			request.callback_id = callbackId;
			console.log('Sending request', request);
			ws.send(JSON.stringify(request));
			return defer.promise;
		}

		function listener(data) {
			var messageObj = data;
			console.log("Received data from websocket: ", messageObj);
			// If an object exists with callback_id in our callbacks object, resolve it
			if (callbacks.hasOwnProperty(messageObj.callback_id)) {
				console.log(callbacks[messageObj.callback_id]);
				console.log(messageObj.data);
				console.log('################################')
				$rootScope.$apply(callbacks[messageObj.callback_id].cb.resolve(messageObj.data));

				delete callbacks[messageObj.callback_id];
			}
		}

		// This creates a new callback ID for a request
		function getCallbackId() {
			currentCallbackId += 1;
			if (currentCallbackId > 10000) {
				currentCallbackId = 0;
			}
			return currentCallbackId;
		}

		Service.initConnect = function(url) {
			ws = new WebSocket(url);
			ws.onopen = wsonopen;
			ws.onmessage = wsonmessage;
		};

		// Define a "getter" for getting customer data
		Service.getUsrUttList = function() {
			var request = {
				type: 'getUttList',
				usrName: 'florian'
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		Service.saveUsrUttList = function(usrName, uttList) {
			var request = {
				type: 'saveUttList',
				usrName: usrName,
				uttList: uttList
			};
			// Storing in a variable for clarity on what sendRequest returns
			var promise = sendRequest(request);
			return promise;
		};

		return Service;
	});