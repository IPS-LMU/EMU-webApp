'use strict';

angular.module('emulvcApp')
	.service('Tierdataservice', function Tierdataservice() {
		// shared service object
		var sServObj = {};

		sServObj.data = {};
		
		sServObj.getData = function() {
		    return sServObj.data;
		};				
		
		sServObj.setData = function(data) {
		    angular.copy(data,sServObj.data);
		};	
		
		return sServObj;

	});