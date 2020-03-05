import * as angular from 'angular';

angular.module('emuwebApp')
	.service('uuid', function () {

		function rand(s) {
			var p = (Math.random().toString(16) + '000000000').substr(2, 8);
			return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p;
		}

		//
		this.new = function () {
			return rand(false) + rand(true) + rand(true) + rand(false);
		};

		this.newHash = function () {
			return rand(false) + rand(true) + rand(true) + rand(false);
		};

		//
		this.empty = function () {
			return '00000000-0000-0000-0000-000000000000';
		};

	});