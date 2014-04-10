'use strict';


angular.module('emuwebApp')
.directive('myDropZone', function ($animate) {
	return {
		templateUrl: 'views/myDropZone.html',
		restrict: 'E',
		link: function postLink(scope, element, attr) {
		
		}
	};
});
