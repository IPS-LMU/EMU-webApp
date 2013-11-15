'use strict';

angular.module('emulvcApp')
	.service('Tierdataservice', function Tierdataservice() {
		// shared service object
		var sServObj = {};

		sServObj.data = {};

		return sServObj;

	});