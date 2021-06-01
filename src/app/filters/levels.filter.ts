import * as angular from 'angular';

angular.module('emuwebApp')
	.filter('levelsFilter', ['ConfigProviderService', 'ViewStateService',
		function (ConfigProviderService, ViewStateService) {
		return function (input) {
			if (input) {
				var patt1 = new RegExp('SEGMENT|EVENT');
				var out = [];
				var idx;
				for (var i = 0; i < input.length; i++) {
					if (patt1.test(input[i].type)) {
						if (ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].levelCanvases !== undefined) {
							idx = ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].levelCanvases.order.indexOf(input[i].name);
							if (idx !== -1) {
								out.push(input[i]);
							}
						}
					}
				}
				return out;
			}
		};
	}]);