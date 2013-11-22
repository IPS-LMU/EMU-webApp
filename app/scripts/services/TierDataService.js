'use strict';

angular.module('emulvcApp')
	.service('Tierdataservice', function Tierdataservice() {
		// shared service object
		var sServObj = {};

		sServObj.data = {};
		
		sServObj.jsonData = function() {
		    return jQuery.extend(true, {}, sServObj.data);
		};
				
		sServObj.restoreJsonData = function(data) {
		    sServObj.data = jQuery.extend(true, {}, data);
		};			

		return sServObj;

	});