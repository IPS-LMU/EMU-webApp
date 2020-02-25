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

		var pathInfo = HierarchyLayoutService.findAllNonPartialPaths();
		$scope.paths.possible = pathInfo.possible;
		$scope.paths.possibleAsStr = pathInfo.possibleAsStr;

		// select first possible path on load
		$scope.paths.selected = $scope.paths.possibleAsStr[viewState.hierarchyState.curPathIdx];

		$scope.vs.hierarchyState.curNrOfPaths = $scope.paths.possibleAsStr.length;

		//////////////
		// watches

		$scope.$watch ('paths.selected', function () {
			viewState.hierarchyState.path = $scope.paths.possible[$scope.getSelIdx()];
			viewState.hierarchyState.curPathIdx = $scope.getSelIdx();
		}, false);

        $scope.$watch ('vs.hierarchyState.curPathIdx', function () {
            //console.log('watch on viewstate working!');
            viewState.hierarchyState.path = $scope.paths.possible[$scope.vs.hierarchyState.curPathIdx];
            $scope.paths.selected = $scope.paths.possibleAsStr[viewState.hierarchyState.curPathIdx];
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
