'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, viewState, modalService, ConfigProviderService, LevelService, HierarchyLayoutService, StandardFuncsService) {

		// Scope data

		$scope.paths = {
			possible: [],
			possibleAsStr: [],
			selected: ''
		};

		$scope.vs = viewState;
		$scope.standardFuncServ = StandardFuncsService;

		// SIC: this init code should use findAllNonPartialPaths of HierarchyLayoutService instead!

		// Find all levels to start calculating possible paths through the hierarchy of levels
		angular.forEach(ConfigProviderService.curDbConfig.levelDefinitions, function (l) {
			$scope.paths.possible = $scope.paths.possible.concat(HierarchyLayoutService.findPaths(l.name));
		});

		// convert array paths to strings
		angular.forEach($scope.paths.possible, function (arr) {
			
			var revArr = StandardFuncsService.reverseCopy(arr);

			var curPathStr = revArr.join(' → ');

			$scope.paths.possibleAsStr.push(curPathStr);
		});

		// remove partial paths
		var partialPathsIdx = [];

		angular.forEach($scope.paths.possibleAsStr, function(p1, idx1){
			angular.forEach($scope.paths.possibleAsStr, function(p2){
				if(p1 !== p2 && p2.startsWith(p1) && partialPathsIdx.indexOf(idx1) === -1){
					partialPathsIdx.push(idx1);
				}
			});
		});

		angular.forEach(partialPathsIdx.reverse(), function(idx){
			$scope.paths.possibleAsStr.splice(idx, 1);
			$scope.paths.possible.splice(idx, 1);
		});


		// select first possible path on load
		$scope.paths.selected = $scope.paths.possibleAsStr[0];
		
		//////////////
		// watches

		$scope.$watch ('paths.selected', function () {
			viewState.hierarchyState.path = $scope.paths.possible[$scope.getSelIdx()];
		}, false);

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
			viewState.hierarchyState.toggleRotation();
		};

		$scope.getRotation = function () {
			return viewState.hierarchyState.isRotated();
		};

		$scope.playSelection = function () {
			++viewState.hierarchyState.playing;
		};

		$scope.getPlaying = function () {
			return viewState.hierarchyState.playing;
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
		$scope.setCurrentAttrDef = function (levelName, attrDefName, attrDefIndex) {
			viewState.setCurAttrDef(levelName, attrDefName, attrDefIndex);
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
			modalService.close();
		};
	});
