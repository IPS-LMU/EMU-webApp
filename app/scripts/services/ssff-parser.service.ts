import * as angular from 'angular';
import * as SsffParserWorker from '../workers/ssff-parser.worker.js';

angular.module('emuwebApp')
	.service('Ssffparserservice', function Ssffparserservice($q) {

		// shared service object
		var sServObj = {} as any;

		var worker = new SsffParserWorker();
		var defer;

		// add event listener to worker to respond to messages
		worker.says(function (e) {
			if (e.status.type === 'SUCCESS') {
				defer.resolve(e);
			} else {
				defer.reject(e);
			}
		}, false);


		/**
		 * parse array of ssff file using webworker
		 * @param array of ssff files encoded as base64 stings
		 * @returns promise
		 */
		sServObj.asyncParseSsffArr = function (ssffArray) {
			defer = $q.defer();
			worker.tell({
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
			worker.tell({
				'cmd': 'jso2ssff',
				'jso': JSON.stringify(jso)
			}); // Send data to our worker.
			return defer.promise;
		};


		return sServObj;

	});