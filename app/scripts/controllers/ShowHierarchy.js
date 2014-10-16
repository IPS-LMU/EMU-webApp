'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, viewState, dialogService, ConfigProviderService, LevelService, HierarchyLayoutService) {
	
		// Scope data
		
		var playing = 0;

		$scope.paths = {
			possible: [],
			possibleAsStr: [],
			selected: ''
		};

		// Find non-ITEM levels to start calculating possible paths through the hierarchy of levels
		angular.forEach(ConfigProviderService.curDbConfig.levelDefinitions, function (l) {
			if (l.type !== 'ITEM') {
				$scope.paths.possible = $scope.paths.possible.concat(HierarchyLayoutService.findPaths(l.name));
			}
		});

		// convert array paths to strings
		angular.forEach($scope.paths.possible, function (arr, arrIdx) {
			if (arrIdx === 0) {
				// select first possible path on load
				$scope.paths.selected = arr.join(' ← ');
			}
			$scope.paths.possibleAsStr.push(arr.join(' ← '));
		});

		//////////////
		// watches

		
		//
		//////////////

		/**
		 * Returns index of the currently selected path (within the $scope.paths.possible array)
		 */
		$scope.getSelIdx = function () {
			var selIdx = $scope.paths.possibleAsStr.indexOf($scope.paths.selected);
			return (selIdx);
		};

		$scope.rotateHierarchy = function () {
			viewState.rotateHierarchy();
		};
		
		$scope.getRotation = function () {
			return viewState.isHierarchyRotated();
		};

		$scope.playSelection = function () {
			++playing;
		};

		$scope.getPlaying = function () {
			return playing;
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
			viewState.showHierarchy();
		};
	});
