'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, viewState, dialogService, ConfigProviderService, LevelService, HierarchyService) {
	
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
				$scope.pathChange();
			}
		}, true);
		
		//
		//////////////

		/**
		 * When the user (or the browser) selects a new path, this has
		 * to be propagated to the service and the directive (the
		 * latter is done in the view).
		 *
		 * Can either be called by a watcher or by ng-change, but
		 * ng-change doesn't seem to see the initial value.
		 */
		$scope.pathChange = function () {
			var selIdx = $scope.getSelIdx();
			HierarchyService.setPath($scope.paths.possible[selIdx]);
		};

		/**
		 *
		 */
		$scope.getSelIdx = function () {
			var selIdx = $scope.paths.possibleAsStr.indexOf($scope.paths.selected);
			return (selIdx);
		};

		/**
		 * rotate hierarchy
		 */
		$scope.rotateHierarchy = function () {
			HierarchyService.rotateBy90();
		};

		/**
		 *
		 */
		$scope.isCurrentAttrDef = function (levelName, attrDef) {
			if (viewState.getCurAttrDef(levelName) === attrDef) {
				return true;
			} else {
				return false;
			}
		};

		/**
		 * set current attribute definition
		 * just delegates same fuction call to viewState
		 *
		 * @param levelName name of level
		 * @param attrDef name of attribute definition
		 */
		$scope.setCurrentAttrDef = function (levelName, attrDef) {
			viewState.setCurAttrDef(levelName, attrDef);
		};

		/**
		 *
		 */
		$scope.getAllAttrDefs = function (levelName) {
			var levDef = ConfigProviderService.getLevelDefinition(levelName);
			return levDef.attributeDefinitions;
		};

		/**
		 * cancel dialog i.e. close
		 */
		$scope.cancel = function () {
			dialogService.close();
		};
	});
