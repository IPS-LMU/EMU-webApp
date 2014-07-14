'use strict';

angular.module('emuwebApp')
	.service('Wavparserservice', function Wavparserservice($q) {
		// shared service object
		var sServObj = {};

		var workerPath = 'scripts/workers/wavParserWorker.js';
		var worker;
		var defer;

		// event listener function for worker to respond to messages
		function messageWorkerCallback(e) {
			if (e.data.status.type === 'SUCCESS') {
				killOldAndCreateNewWorker();
				defer.resolve(e.data.data);
			} else {
				killOldAndCreateNewWorker();
				defer.reject(e.data);
			}

		}

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


		// add event listener to worker to respond to messages
		// worker.addEventListener('message', function (e) {
		// 	// console.log('Worker said: ', e.data);
		// 	if (e.data.status.type === 'SUCCESS') {
		// 		defer.resolve(e.data.data);
		// 	} else {
		// 		defer.reject(e.data);
		// 	}
		// }, false);

		/**
		 * parse buffer containing wav file using webworker
		 * @param buf
		 * @returns promise
		 */
		sServObj.parseWavArrBuf = function (buf) {
			killOldAndCreateNewWorker(true);
			defer = $q.defer();
			worker.postMessage({
				'cmd': 'parseBuf',
				'buffer': buf
			}); // Send data to our worker.
			return defer.promise;
		};

		return sServObj;

	});