'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, dialogService, ConfigProviderService, Levelservice, HierarchyService) {
		$scope.possiblePaths = [];

		$scope.levels = ConfigProviderService.curDbConfig.levelDefinitions;

		$scope.cancel = function () {
			dialogService.close();
		};

		// Find non-ITEM levels to start calculating possible paths through the level hierarchy
		
		angular.forEach ($scope.levels, function (l) {
			if (l.type !== 'ITEM') {
				$scope.possiblePaths = $scope.possiblePaths.concat(HierarchyService.findPaths(l.name));
			}
		});
	});
