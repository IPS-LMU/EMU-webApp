import * as angular from 'angular';

angular.module('emuwebApp')
	.controller('searchAnnotCtrl', function ($scope, ModalService, ViewStateService, HierarchyLayoutService, LevelService, LoadedMetaDataService, ConfigProviderService, StandardFuncsService, DataService) {

		$scope.vs = ViewStateService;

		$scope.hierPaths = HierarchyLayoutService.findAllNonPartialPaths();

		$scope.curHierPathIdx = 0;

		$scope.curLevels = $scope.hierPaths.possible[$scope.curHierPathIdx];

		$scope.curLevel = $scope.curLevels[$scope.curHierPathIdx];

		$scope.curAttrIdx = 0;

		$scope.curAttrDefs = ConfigProviderService.getAttrDefsNames($scope.curLevel);

		$scope.curAttrDef = $scope.curAttrDefs[0];


		$scope.searchString = '';

		$scope.useRegExSearch = false;

		$scope.resultTimeAnchors = [];



		/**
		 *
		 */
		$scope.changedHierPath = function () {
			$scope.curLevels = $scope.hierPaths.possible[$scope.curHierPathIdx];
			$scope.curLevel = $scope.curLevels[0];

			$scope.curAttrDefs = ConfigProviderService.getAttrDefsNames($scope.curLevel);
			$scope.curAttrDef = $scope.curAttrDefs[0];
		};


		/**
		 *
		 */
		$scope.changedLevel = function () {
			$scope.curAttrDefs = ConfigProviderService.getAttrDefsNames($scope.curLevel);
			$scope.curAttrDef = $scope.curAttrDefs[0];
			$scope.curAttrIdx = $scope.curAttrDefs.indexOf($scope.curAttrDef);
		};

		/**
		 *
		 */
		$scope.changedAttrDef = function () {
			$scope.curAttrIdx = $scope.curAttrDefs.indexOf($scope.curAttrDef);
		};


		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			ViewStateService.setEditing(true);
			ViewStateService.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			ViewStateService.setEditing(false);
			ViewStateService.setcursorInTextField(false);
		};

		/**
		 *
		 */
		$scope.search = function () {
			HierarchyLayoutService.findParents($scope.hierPaths.possible[$scope.curHierPathIdx]);

			var curLevelDetails = LevelService.getLevelDetails($scope.curLevel);
			$scope.resultTimeAnchors = [];
			for(var itemIdx = 0; itemIdx < curLevelDetails.items.length; itemIdx++){
				if(!$scope.useRegExSearch){
					if(curLevelDetails.items[itemIdx].labels[$scope.curAttrIdx].value === $scope.searchString){
						$scope.resultTimeAnchors.push(
							{
								'label': curLevelDetails.items[itemIdx].labels[$scope.curAttrIdx].value,
								'sample_start': curLevelDetails.items[itemIdx]._derivedSampleStart,
								'sample_end': curLevelDetails.items[itemIdx]._derivedSampleEnd
							}
						);
					}
				}else{
					if(curLevelDetails.items[itemIdx].labels[$scope.curAttrIdx].value.match($scope.searchString)){
						$scope.resultTimeAnchors.push(
							{	
								'label': curLevelDetails.items[itemIdx].labels[$scope.curAttrIdx].value,
								'sample_start': curLevelDetails.items[itemIdx]._derivedSampleStart,
								'sample_end': curLevelDetails.items[itemIdx]._derivedSampleEnd
							}
						);
					}
				}
			}

		};


		/**
		 *
		 */
		$scope.saveTimeAnchors = function () {
			LoadedMetaDataService.setTimeAnchors($scope.resultTimeAnchors);
			StandardFuncsService.traverseAndClean(DataService.getData());
			ModalService.close();
		};

	});