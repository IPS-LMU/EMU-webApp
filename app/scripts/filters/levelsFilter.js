'use strict';

angular.module('emulvcApp')
	.filter('levelsFilter', function () {
		return function (input) {
			if (input) {
				var patt1 = new RegExp('SEGMENT');
				var patt2 = new RegExp('EVENT');
				var out = [];
				for (var i = 0; i < input.length; i++) {
					if (patt1.test(input[i].type) || patt2.test(input[i].type)) {
						out.push(input[i]);
					}
				}
				return out;
			}
		};
	});