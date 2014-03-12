'use strict';

angular.module('emuwebApp')
	.filter('levelsFilter', function (ConfigProviderService, viewState) {
		return function (input) {
			if (input) {
				var patt1 = new RegExp('SEGMENT');
				var patt2 = new RegExp('EVENT');
				var out = [];
				var idx;
				for (var i = 0; i < input.length; i++) {
					if (patt1.test(input[i].type) || patt2.test(input[i].type)) {
						idx = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].levelCanvases.order.indexOf(input[i].name);
						if (idx !== -1) {
							out[idx] = input[i];
						}
					}
				}
				// console.log(out)
				return out;
			}
		};
	});