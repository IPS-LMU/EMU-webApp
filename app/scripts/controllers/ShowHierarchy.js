'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, dialogService, ConfigProviderService, LevelService, HierarchyService) {
		// Scope data

		$scope.paths = {
			possible: [],
			possibleAsStr: [],
			selected: ''
		};


		// Find non-ITEM levels to start calculating possible paths through the hierarchy of levels
		angular.forEach(ConfigProviderService.curDbConfig.levelDefinitions, function (l) {
			if (l.type !== 'ITEM') {
				$scope.paths.possible = $scope.paths.possible.concat(HierarchyService.findPaths(l.name));
			}
		});

		// convert array paths to strings
		angular.forEach($scope.paths.possible, function (arr, arrIdx) {
			if (arrIdx === 0) {
				// select first possible path on load
				$scope.paths.selected = arr.join('<-');
			}
			$scope.paths.possibleAsStr.push(arr.join('<-'));
		});

		//////////////
		// watches

		// watch selected path to redraw on startup and change of value
		$scope.$watch('paths.selected', function (val) {
			if (val !== undefined) {
				$scope.redraw();
			}

		}, true);

		//
		//////////////

		/**
		 * redraw on selected path change (is called if $scope.paths.selected is changed)
		 */
		$scope.redraw = function () {
			var selIdx = $scope.paths.possibleAsStr.indexOf($scope.paths.selected);
			HierarchyService.setPath($scope.paths.possible[selIdx]);
			HierarchyService.drawHierarchy();
		};

		/**
		 * rotate hierarchy
		 */
		$scope.rotateHierarchy = function () {
			HierarchyService.rotateBy90();
		};


		/**
		 * cancel dialog i.e. close
		 */
		$scope.cancel = function () {
			dialogService.close();
		};
	});