'use strict';

angular.module('emuwebApp')
	.service('Ssffparserservice', function Ssffparserservice($q) {

		// shared service object
		var sServObj = {};

		var worker = new Worker('scripts/workers/ssffParserWorker.js');
		var defer;

		// add event listener to worker to respond to messages
		worker.addEventListener('message', function (e) {
			if (e.data.status.type === 'SUCCESS') {
				defer.resolve(e.data);
			} else {
				defer.reject(e.data);
			}
		}, false);


		/**
		 * parse array of ssff file using webworker
		 * @param array of ssff files encoded as base64 stings
		 * @returns promise
		 */
		sServObj.asyncParseSsffArr = function (ssffArray) {
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
			defer = $q.defer();
			worker.postMessage({
				'cmd': 'jso2ssff',
				'jso': JSON.stringify(jso)
			}); // Send data to our worker.
			return defer.promise;
		};


		return sServObj;

	});