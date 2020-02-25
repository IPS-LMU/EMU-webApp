'use strict';

angular.module('emuwebApp')
	.factory('uuid', function () {
		// shared service object
		var sServObj = {};

		function rand(s) {
			var p = (Math.random().toString(16) + '000000000').substr(2, 8);
			return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p;
		}

		//
		sServObj.new = function () {
			return rand() + rand(true) + rand(true) + rand();
		};

		sServObj.newHash = function () {
			return rand() + rand(true) + rand(true) + rand();
		};

		//
		sServObj.empty = function () {
			return '00000000-0000-0000-0000-000000000000';
		};


		return sServObj;
	});