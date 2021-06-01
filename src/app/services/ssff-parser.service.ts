import * as angular from 'angular';
import { SsffParserWorker } from '../workers/ssff-parser.worker.js';

class SsffParserService{
	private $q;
	private worker;
	private defer;
	
	constructor($q){
		this.$q = $q;
		this.worker = new SsffParserWorker();

		// add event listener to worker to respond to messages
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				this.defer.resolve(e);
			} else {
				this.defer.reject(e);
			}
		}, false);
		
	}
	
	/**
	* parse array of ssff file using webworker
	* @param array of ssff files encoded as base64 stings
	* @returns promise
	*/
	public asyncParseSsffArr(ssffArray) {
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'parseArr',
			'ssffArr': ssffArray
		}); // Send data to our worker.
		return this.defer.promise;
	};
	
	
	/**
	* convert jso to ssff binary file using webworker
	* @param java script object of ssff file (internal rep)
	* @returns promise
	*/
	public asyncJso2ssff(jso) {
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'jso2ssff',
			'jso': JSON.stringify(jso)
		}); // Send data to our worker.
		return this.defer.promise;
	};
	
}

angular.module('emuwebApp')
.service('SsffParserService', ['$q', SsffParserService]);