'use strict';

angular.module('emuwebApp')
	.service('Wavparserservice', function Wavparserservice($q) {
		// shared service object
		var sServObj = {};

		var worker = new Worker('scripts/workers/wavParserWorker.js');
		var defer;

		// add event listener to worker to respond to messages
		worker.addEventListener('message', function (e) {
			// console.log('Worker said: ', e.data);
			if (e.data.status.type === 'SUCCESS') {
				defer.resolve(e.data.data);
			} else {
				defer.reject(e.data);
			}
		}, false);

		/**
		 * parse buffer containing wav file using webworker
		 * @param buf
		 * @returns promise
		 */
		sServObj.parseWavArrBuf = function (buf) {
			defer = $q.defer();
			worker.postMessage({
				'cmd': 'parseBuf',
				'buffer': buf
			}, [buf]); // Send data to our worker.
			return defer.promise;
		};

		return sServObj;

	});