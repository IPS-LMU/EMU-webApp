import * as angular from 'angular';
import { EspsParserWorker } from '../workers/esps-parser.worker.js';

class EspsParserService{
	
	private $q;
	private LevelService;
	private SoundHandlerService;
	
	private worker;
	private defer;
	
	constructor($q, LevelService, SoundHandlerService){
		this.$q = $q;
		this.LevelService = LevelService;
		this.SoundHandlerService = SoundHandlerService;
		
		this.worker = new EspsParserWorker();
		// add event listener to worker to respond to messages
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				this.defer.resolve(e.data);
			} else {
				this.defer.reject(e.data);
			}
		}, false);

	}

		/**
	* parse ESPS file using webworker
	* @param esps
	* @param annotates
	* @param name
	* @returns promise
	*/
	public asyncParseEsps(esps, annotates, name) {
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'parseESPS',
			'esps': esps,
			'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate,
			'annotates': annotates,
			'name': name
		});
		return this.defer.promise;
	};
	
	/**
	* parse JSO data to ESPS file using webworker
	* @param name
	* @param sampleRate
	* @returns promise
	*/
	public asyncParseJSO(name) {
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'parseJSO',
			'level': this.LevelService.getLevelDetails(name),
			'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate
		});
		return this.defer.promise;
	};

}


angular.module('emuwebApp')
.service('EspsParserService', ['$q', 'LevelService', 'SoundHandlerService', EspsParserService]);
