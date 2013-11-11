'use strict';

angular.module('emulvcApp')
	.service('Ssffdataservice', function Ssffdataservice() {
		// shared service object
		var sServObj = {};

		sServObj.data = [];

		return sServObj;
	});