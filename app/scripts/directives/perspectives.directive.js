'use strict';


angular.module('emuwebApp')
	.directive('perspectives', function () {
		return {
			templateUrl: 'views/perspectives.html',
			replace: true,
			restrict: 'E'
		};
	});
