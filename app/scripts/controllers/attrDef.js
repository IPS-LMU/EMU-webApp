'use strict';

angular.module('emuwebApp')
	.controller('AttrdefCtrl', function ($scope) {
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];

		$scope.changeAttrDef = function () {
			alert('sdf');
		};
	});