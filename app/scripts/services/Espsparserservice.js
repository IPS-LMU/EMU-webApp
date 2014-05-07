'use strict';

angular.module('emuwebApp')
	.service('Espsparserservice', function Espsparserservice($q, Levelservice, Soundhandlerservice) {
		// shared service object
		var sServObj = {};

		var worker = new Worker('scripts/workers/espsParserWorker.js');
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
		 * parse ESPS file using webworker
		 * @param esps
		 * @param annotates
		 * @param name
		 * @returns promise
		 */
		sServObj.asyncParseEsps = function (esps, annotates, name) {
			defer = $q.defer();
			worker.postMessage({
				'cmd': 'parseESPS',
				'textGrid': esps,
				'sampleRate': Soundhandlerservice.wavJSO.SampleRate,
				'annotates': annotates,
				'name': name
			}); // Send data to our worker.
			return defer.promise;
		};

		/**
		 * parse JSO data to ESPS file using webworker
		 * @param name
		 * @param sampleRate
		 * @returns promise
		 */
		sServObj.asyncParseJSO = function (name) {
			defer = $q.defer();
			worker.postMessage({
				'cmd': 'parseJSO',
				'level': Levelservice.getLevelDetails(name).level,
				'sampleRate': Soundhandlerservice.wavJSO.SampleRate
			}); // Send data to our worker.
			return defer.promise;
		};


		return sServObj;

	});