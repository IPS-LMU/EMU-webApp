'use strict';

angular.module('emuwebApp')
	.service('Textgridparserservice', function Textgridparserservice($q, Soundhandlerservice) {
		// shared service object
		var sServObj = {};

		var worker = new Worker('scripts/workers/textGridParserWorker.js');
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
		sServObj.asyncParseTextGrid = function (textGrid, annotates, name) {
			defer = $q.defer();
			worker.postMessage({
				'cmd': 'parseTG',
				'textGrid': textGrid,
				'sampleRate': Soundhandlerservice.wavJSO.SampleRate,
				'annotates': annotates,
				'name': name
			}); // Send data to our worker.
			return defer.promise;
		};


		return sServObj;
		
	});