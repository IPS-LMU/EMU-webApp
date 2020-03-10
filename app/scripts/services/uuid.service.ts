import * as angular from 'angular';

class UuidService{
	constructor(){

	}
	private rand(s) {
		var p = (Math.random().toString(16) + '000000000').substr(2, 8);
		return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p;
	}

	//
	public new() {
		return this.rand(false) + this.rand(true) + this.rand(true) + this.rand(false);
	};

	public newHash() {
		return this.rand(false) + this.rand(true) + this.rand(true) + this.rand(false);
	};

	//
	public empty() {
		return '00000000-0000-0000-0000-000000000000';
	};
}

angular.module('emuwebApp')
	.service('UuidService', UuidService);