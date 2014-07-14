'use strict';

angular.module('emuwebApp')
	.service('Ssffparserservice', function Ssffparserservice($q) {

		// shared service object
		var sServObj = {};

		var workerPath = 'scripts/workers/ssffParserWorker.js';
		var worker;
		var defer;

		// event listener function for worker to respond to messages
		function messageWorkerCallback(e) {
			if (e.data.status.type === 'SUCCESS') {
				killOldAndCreateNewWorker();
				defer.resolve(e.data);
			} else {
				killOldAndCreateNewWorker();
				defer.reject(e.data);
			}

		}

		// worker.addEventListener('message', function (e) {
		// 	if (e.data.status.type === 'SUCCESS') {
		// 		defer.resolve(e.data);
		// 	} else {
		// 		defer.reject(e.data);
		// 	}
		// }, false);

		/**
		 *
		 */
		function killOldAndCreateNewWorker(createNew) {
			if (worker !== undefined) {
				worker.terminate();
			}
			if (createNew) {
				worker = new Worker(workerPath);
				worker.addEventListener('message', messageWorkerCallback, false);
			}
		}

		/**
		 * parse array of ssff file using webworker
		 * @param array of ssff files encoded as base64 stings
		 * @returns promise
		 */
		sServObj.asyncParseSsffArr = function (ssffArray) {
			killOldAndCreateNewWorker(true);
			defer = $q.defer();
			worker.postMessage({
				'cmd': 'parseArr',
				'ssffArr': ssffArray
			}); // Send data to our worker.
			return defer.promise;
		};


		/**
		 * convert jso to ssff binary file using webworker
		 * @param java script object of ssff file (internal rep)
		 * @returns promise
		 */
		sServObj.asyncJso2ssff = function (jso) {
			killOldAndCreateNewWorker(true);
			defer = $q.defer();
			worker.postMessage({
				'cmd': 'jso2ssff',
				'jso': jso
			}); // Send data to our worker.
			return defer.promise;
		};


		return sServObj;

	});