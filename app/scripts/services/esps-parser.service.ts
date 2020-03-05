import * as angular from 'angular';
import { EspsParserWorker } from '../workers/esps-parser.worker.js';

angular.module('emuwebApp')
	.service('Espsparserservice', function Espsparserservice($q, LevelService, Soundhandlerservice) {

		var worker = new EspsParserWorker();
		var defer;

		// add event listener to worker to respond to messages
		worker.says(function (e) {
			if (e.status.type === 'SUCCESS') {
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
		this.asyncParseEsps = function (esps, annotates, name) {
			defer = $q.defer();
			worker.tell({
				'cmd': 'parseESPS',
				'esps': esps,
				'sampleRate': Soundhandlerservice.audioBuffer.sampleRate,
				'annotates': annotates,
				'name': name
			});
			return defer.promise;
		};

		/**
		 * parse JSO data to ESPS file using webworker
		 * @param name
		 * @param sampleRate
		 * @returns promise
		 */
		this.asyncParseJSO = function (name) {
			defer = $q.defer();
			worker.tell({
				'cmd': 'parseJSO',
				'level': LevelService.getLevelDetails(name),
				'sampleRate': Soundhandlerservice.audioBuffer.sampleRate
			});
			return defer.promise;
		};

	});
