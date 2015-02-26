'use strict';

angular.module('emuwebApp')
	.service('Wavparserservice', function Wavparserservice($q) {
		// shared service object
		var sServObj = {};

		var worker = new wavParserWorker();
		var defer;
		
		// add event listener to worker to respond to messages
		worker.says(function(e) {
			if (e.status.type === 'SUCCESS') {
				defer.resolve(e.data);
			} else {
				defer.reject(e);
			}
		});

		/**
		 * parse buffer containing wav file using webworker
		 * @param buf
		 * @returns promise
		 */
		sServObj.parseWavArrBuf = function (buf) {
			defer = $q.defer();
			worker.tell({
				'cmd': 'parseBuf',
				'buffer': buf
			});
			return defer.promise;
		};

		return sServObj;

	});