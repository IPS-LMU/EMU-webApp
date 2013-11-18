'use strict';

angular.module('emulvcApp')
	.service('Websockethandler', function Websockethandler() {
		// shared service object
		var sServObj = {};

		sServObj.connection = undefined;

		sServObj.initConnect = function(url) {
			console.log("sdfsdf	")
			sServObj.connection = new WebSocket(url, ['soap', 'xmpp']);

			// hook up callbacks
			sServObj.connection.onerror = sServObj.handleWsError;
			sServObj.connection.onopen = sServObj.handleWsOnOpen;
			sServObj.connection.onmessage = sServObj.handleWsOnMessage;
		};

		/**
		*/
		sServObj.handleWsOnOpen = function() {
			sServObj.connection.send('emuLVC says howdy');
		};

		/**
		*/
		sServObj.handleWsError = function(error) {
			console.log(error)
		};

		/**
		*/
		sServObj.handleWsOnMessage = function(evt) {
			console.log(evt.data)
		};

		return sServObj;

	});