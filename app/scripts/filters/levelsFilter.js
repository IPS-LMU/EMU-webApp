'use strict';

angular.module('emuwebApp')
	.filter('levelsFilter', function (ConfigProviderService, viewState) {
		return function (input) {
			if (input) {
				var patt1 = new RegExp('SEGMENT|EVENT');
				var out = [];
				var idx;
				for (var i = 0; i < input.length; i++) {
					if (patt1.test(input[i].type)) {
					    if(ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases!== undefined) {
	    					idx = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order.indexOf(input[i].name);
    						if (idx !== -1) {
							    out[idx] = input[i];
						    }					    
					    }
					}
				}
				return out;
			}
		};
	});