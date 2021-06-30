import * as angular from 'angular';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', [
		'$scope',
		'ViewStateService',
		'HistoryService',
		'ModalService',
		'ConfigProviderService',
		'LevelService',
		'HierarchyLayoutService',
		'StandardFuncsService',
		function (
			$scope,
			ViewStateService,
			HistoryService, 
			ModalService, 
			ConfigProviderService, 
			LevelService, 
			HierarchyLayoutService, 
			StandardFuncsService
			) {

		// Scope data

		$scope.paths = {
			possible: [],
			possibleAsStr: [],
			selected: ''
		};

		$scope.vs = ViewStateService;
		$scope.HistoryService = HistoryService;
		$scope.standardFuncServ = StandardFuncsService;

		var pathInfo = HierarchyLayoutService.findAllNonPartialPaths();
		$scope.paths.possible = pathInfo.possible;
		$scope.paths.possibleAsStr = pathInfo.possibleAsStr;

		// select first possible path on load
		$scope.paths.selected = $scope.paths.possibleAsStr[ViewStateService.hierarchyState.curPathIdx];

		$scope.vs.hierarchyState.curNrOfPaths = $scope.paths.possibleAsStr.length;

		// counter to get update for EmuHierarchyComponent
		$scope.attributeDefinitionClickCounter = 0;

		//////////////
		// watches

		$scope.$watch ('paths.selected', function () {
			ViewStateService.hierarchyState.path = $scope.paths.possible[$scope.getSelIdx()];
			ViewStateService.hierarchyState.curPathIdx = $scope.getSelIdx();
		}, false);

        $scope.$watch ('vs.hierarchyState.curPathIdx', function () {
            //console.log('watch on ViewStateService working!');
            ViewStateService.hierarchyState.path = $scope.paths.possible[$scope.vs.hierarchyState.curPathIdx];
            $scope.paths.selected = $scope.paths.possibleAsStr[ViewStateService.hierarchyState.curPathIdx];
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
			ViewStateService.hierarchyState.toggleRotation();
		};

		$scope.getRotation = function () {
			return ViewStateService.hierarchyState.isRotated();
		};

		$scope.playSelection = function () {
			++ViewStateService.hierarchyState.playing;
		};

		$scope.getPlaying = function () {
			return ViewStateService.hierarchyState.playing;
		};

		/**
		 *
		 */
		$scope.isCurrentAttrDef = function (levelName, attrDef) {
			if (ViewStateService.getCurAttrDef(levelName) === attrDef) {
				return true;
			} else {
				return false;
			}
		};

		/**
		 * set current attribute definition
		 * just delegates same fuction call to ViewStateService
		 *
		 * @param levelName name of level
		 * @param attrDef name of attribute definition
		 */
		$scope.setCurrentAttrDef = function (levelName, attrDefName, attrDefIndex) {
			$scope.attributeDefinitionClickCounter = $scope.attributeDefinitionClickCounter + 1;
			ViewStateService.setCurAttrDef(levelName, attrDefName, attrDefIndex);
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
			ModalService.close();
		};
	}]);
