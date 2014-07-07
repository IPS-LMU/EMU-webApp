'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, dialogService, ConfigProviderService, Levelservice, HierarchyService) {
		// Scope data
		$scope.paths = { possible: [], selected: [] };

		$scope.cancel = function () {
			dialogService.close();
		};
		
		// Find non-ITEM levels to start calculating possible paths through the hierarchy of levels
		angular.forEach (ConfigProviderService.curDbConfig.levelDefinitions, function (l) {
			if (l.type !== 'ITEM') {
				$scope.paths.possible = $scope.paths.possible.concat(HierarchyService.findPaths(l.name));
			}
		});
		
		
		//
		// FIXME All of the following is hacky and must be angularised but I have yet to find out how
		//

		// FIXME Why do I need to pass a value from $scope to this function?
		//
		// When calling redraw() without arguments from ng-change, I cannot access the current value of
		// $scope.selectedPath (which is changed by an HTML select.
		//
		// I can seemingly only work around this by writing ng-change="redraw(selectedPath);" in the view
		//
		$scope.redraw = function () {
			HierarchyService.setPath($scope.paths.selected);
			HierarchyService.drawHierarchy();
		};
	});
