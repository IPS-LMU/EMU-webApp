import * as angular from 'angular';
import { TextGridParserWorker } from '../workers/textgrid-parser.worker.js';

class Textgridparserservice{
	private $q;
	private DataService;
	private viewState;
	private Soundhandlerservice;
	
	private worker;
	private defer;	
	
	constructor($q, DataService, viewState, Soundhandlerservice){
		this.$q = $q;
		this.DataService = DataService;
		this.viewState = viewState;
		this.Soundhandlerservice = Soundhandlerservice;
		
		this.worker = new TextGridParserWorker();
		
		// add event listener to worker to respond to messages
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				this.defer.resolve(e.data);
			} else {
				this.defer.reject(e);
			}
		}, false);
	}
	
	/**
	* parse level data to Textgrid File
	* @param level data
	* @returns promise
	*/
	public asyncToTextGrid() {
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'toTextGrid',
			'levels': this.DataService.getData().levels,
			'sampleRate': this.Soundhandlerservice.audioBuffer.sampleRate,
			'buffLength': this.Soundhandlerservice.audioBuffer.length
		});
		return this.defer.promise;
	};
	
	
	/**
	* parse array of ssff file using webworker
	* @param array of ssff files encoded as base64 stings
	* @returns promise
	*/
	public asyncParseTextGrid(textGrid, annotates, name) {
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'parseTG',
			'textGrid': textGrid,
			'sampleRate': this.Soundhandlerservice.audioBuffer.sampleRate,
			'annotates': annotates,
			'name': name
		});
		return this.defer.promise;
	};
}

angular.module('emuwebApp')
.service('Textgridparserservice', Textgridparserservice);