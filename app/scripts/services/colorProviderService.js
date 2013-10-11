'use strict';

angular.module('emulvcApp')
	.service('Colorproviderservice', function Colorproviderservice($http) {

		// shared service object
		var sServObj = {};
		sServObj.vals = {};

		sServObj.httpGetDrawingColorsConfig = function() {
			$http.get('configFiles/drawingColors.json').success(function(data) {
				sServObj.vals = data;
			});
		};


		return sServObj;

	});