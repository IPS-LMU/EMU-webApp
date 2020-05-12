import * as angular from 'angular';

angular.module('emuwebApp')
	.filter('regex', function () {
		return (input, regex) => {
			var patt = new RegExp(regex.toLowerCase());
			var out = [];
			for (var i = 0; i < input.length; i++) {
				if (patt.test(input[i].name.toLowerCase())) {
					out.push(input[i]);
				}
			}
			return out;
		};
	});