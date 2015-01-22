'use strict';

angular.module('emuwebApp')
	.controller('ShowhierarchyCtrl', function ($scope, DataService, viewState, modalService, ConfigProviderService, LevelService, HierarchyLayoutService) {
	
		// Scope data
		
		var playing = 0;

		$scope.paths = {
			possible: [],
			possibleAsStr: [],
			selected: ''
		};

		////////////
		// Helper functions

		// Return a reversed copy of an array
		$scope.reverseCopy = function (a) {
			var r = angular.copy(a);
			r.reverse();
			return r;
		};

		//
		////////////

		// Find non-ITEM levels to start calculating possible paths through the hierarchy of levels
		angular.forEach(ConfigProviderService.curDbConfig.levelDefinitions, function (l) {
			if (l.type !== 'ITEM') {
				$scope.paths.possible = $scope.paths.possible.concat(HierarchyLayoutService.findPaths(l.name));
			}
		});

		// convert array paths to strings
		angular.forEach($scope.paths.possible, function (arr, arrIdx) {
			var revArr = $scope.reverseCopy(arr);
			
			if (arrIdx === 0) {
				// select first possible path on load
				$scope.paths.selected = revArr.join(' → ');
			}
			$scope.paths.possibleAsStr.push(revArr.join(' → '));
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
			viewState.toggleHierarchyRotation();
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
			var traverse = function (o) 
			{
				for (var i in o) {
					if ( i.substr(0,1) === '_') {
						delete o[i];
					}
	
					if (o[i] !== null && typeof(o[i])==='object') {
						//going one step down in the object tree
						traverse(o[i]);
					}
				}
			};

			traverse (DataService.getData());

			modalService.close();
			viewState.showHierarchy();
		};
	});
