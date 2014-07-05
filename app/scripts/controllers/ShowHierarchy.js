'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, dialogService, ConfigProviderService, Levelservice, HierarchyService) {
		// Scope data
		$scope.possiblePaths = [];

		$scope.cancel = function () {
			dialogService.close();
		};

		// Find non-ITEM levels to start calculating possible paths through the level hierarchy
		angular.forEach (ConfigProviderService.curDbConfig.levelDefinitions, function (l) {
			if (l.type !== 'ITEM') {
				$scope.possiblePaths = $scope.possiblePaths.concat(HierarchyService.findPaths(l.name));
			}
		});

		// This must be angularised but I have yet to find out how
		HierarchyService.setPath($scope.possiblePaths[0]);
		setTimeout( HierarchyService.drawHierarchy, 1000);

	});
