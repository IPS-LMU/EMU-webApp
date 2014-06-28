'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, dialogService, ConfigProviderService, Levelservice) {
		$scope.possiblePaths = [];
		$scope.selectedPath = -1;

		$scope.levels = ConfigProviderService.curDbConfig.levelDefinitions;
		$scope.links = ConfigProviderService.curDbConfig.linkDefinitions;

		// Recursively find all paths through the level hierarchy
		// This is done bottom-up because there is no explicit root element in the levelDefinitions
		$scope.findPaths = function (startNode, path) {
			console.debug ('Looking for paths from', startNode);
			if (typeof path === 'undefined') {
				var path = [startNode];
			} else {
				path = path.concat([startNode]);
			}

			// Find all parents
			var parents = [];
			for (var i = 0; i<$scope.links.length; ++i) {
				if ($scope.links[i].sublevelName === startNode) {
					parents.push ($scope.links[i].superlevelName);
				}
			}

			// If we have no more parents, we're at the end of the
			// path and thus returning it
			if (parents.length === 0) {
				return [path];
			}
			
			// Find all paths
			var paths = [];
			for (var i = 0; i<parents.length; ++i) {
				paths = paths.concat($scope.findPaths(parents[i], path));
			}

			return paths;
		};

		$scope.cancel = function () {
			dialogService.close();
		};

		// Find non-ITEM levels to start calculating possible paths through the level hierarchy
		
		angular.forEach ($scope.levels, function (l) {
			if (l.type !== 'ITEM') {
				$scope.possiblePaths = $scope.possiblePaths.concat($scope.findPaths(l.name));
			}
		});
	});
