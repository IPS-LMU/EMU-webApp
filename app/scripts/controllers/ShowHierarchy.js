'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, dialogService) {
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];

		$scope.cancel = function () {
			dialogService.close();
		};
	});