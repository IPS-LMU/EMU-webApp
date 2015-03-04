'use strict';


angular.module('emuwebApp')
	.directive('bundleListSideBar', function () {
		return {
			templateUrl: 'views/bundleListSideBar.html',
			restrict: 'E',
			replace: true,
			scope: {},
			link: function postLink(scope, element, attr) {

			}
		};
	});