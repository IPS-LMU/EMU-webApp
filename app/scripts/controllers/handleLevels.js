'use strict';

angular.module('emulvcApp')
	.controller('HandleLevelsCtrl', function ($scope, $http, $injector, viewState, HistoryService, ConfigProviderService, Soundhandlerservice, Levelservice, fontScaleService, Drawhelperservice, dialogService) {

		$scope.vs = viewState;
		$scope.hists = HistoryService;
		$scope.fontImage = fontScaleService;
		$scope.shs = Soundhandlerservice;
		$scope.config = ConfigProviderService;
		$scope.dhs = Drawhelperservice;
		$scope.dials = dialogService;
		$scope.testValue = '';
		$scope.message = '';
		$scope.levelDetails = Levelservice;


		$scope.sortableOptions = {
			update: function (e, ui) {
				if (!ConfigProviderService.vals.restrictions.sortLabels) {
					// ui.item.parent().sortable('cancel');
				}
			},
			start: function () {
				$scope.deleteEditArea();
			},
			create: function (e, ui) {
				//ui.item.sortable('enable');
			},
			axis: 'y',
			placeholder: 'levelPlaceholder'
		};

		/**
		 * listen for newlyLoadedLabelJson broadcast
		 * update levelDetails if heard
		 */
		$scope.$on('newlyLoadedLabelJson', function (evt, data) {
			if ($.isEmptyObject($scope.levelDetails.data)) {
				$scope.levelDetails.data = data;
			} else {
				// data.levels.forEach(function (level) {
				// 	if (level.type === 'EVENT' || level.type === 'SEGMENT') {
				// 		$scope.levelDetails.data.levels.push(level);
				// 	}
				// });
				// data.fileInfos.forEach(function (fInf) {
				// 	$scope.levelDetails.data.fileInfos.push(fInf);
				// });
				// console.log(JSON.stringify($scope.levelDetails, undefined, 2));
			}
			// $scope.sortLevels();
		});

		/**
		 * clear levelDetails when new utt is loaded
		 */
		$scope.$on('loadingNewUtt', function () {
			$scope.levelDetails.data = {};
		});


		$scope.$on('errorMessage', function (evt, data) {
			dialogService.open('views/error.html', 'ModalCtrl', data);
		});



		// //
		// $scope.sortLevels = function () {
		// 	var sortedLevels = [];
		// 	var sortedFileInfos = [];
		// 	var searchOrd;

		// 	// ConfigProviderService.vals
		// 	ConfigProviderService.vals.labelCanvasConfig.order.forEach(function (curOrd) {
		// 		// console.log(curOrdIdx)
		// 		searchOrd = curOrd.split('.')[1];
		// 		$scope.levelDetails.data.levels.forEach(function (t, tIdx) {
		// 			if (t.LevelName.split('_')[1] === searchOrd) {
		// 				sortedLevels.push(t);
		// 				sortedFileInfos.push($scope.levelDetails.data.fileInfos[tIdx]);
		// 			}
		// 		});
		// 	});
		// 	$scope.levelDetails.data.levels = sortedLevels;
		// 	$scope.levelDetails.data.fileInfos = sortedFileInfos;
		// };


		$scope.cursorInTextField = function () {
			viewState.focusInTextField = true;
		};

		$scope.cursorOutOfTextField = function () {
			viewState.focusInTextField = false;
		};


		$scope.getLevelLength = function () {
			return $scope.levelDetails.data.levels.length;
		};

		$scope.getLevel = function (id) {
			var t;
			angular.forEach($scope.levelDetails.data.levels, function (level) {
				if (level.LevelName === id) {
					t = level;
				}
			});
			return t;
		};


		$scope.renameLevel = function (newName) {
			// var x = 0;
			var found = false;
			angular.forEach($scope.levelDetails.data.levels, function (t) {
				if (t.LevelName === newName) {
					found = true;
				}
			});
			if (!found) {
				angular.forEach($scope.levelDetails.data.levels, function (t) {
					if (t.LevelName === viewState.getcurClickLevelName()) {
						t.LevelName = newName;
					}
				});
			} else {
				dialogService.open('views/error.html', 'ModalCtrl', 'Rename Error : This Level name already exists ! Please choose another name !');
			}
		};


		$scope.getNearest = function (x, level) {
			var pcm = parseFloat($scope.vs.curViewPort.sS) + x;
			var id = 0;
			var ret = 0;
			if (level.type === "seg") {
				angular.forEach(level.elements, function (evt) {
					if (pcm >= evt.sampleStart && pcm <= (evt.sampleStart + evt.sampleDur)) {
						if (pcm - evt.sampleStart >= evt.sampleDur / 2) {
							ret = id + 1;
						} else {
							ret = id;
						}
					}
					++id;
				});
			} else {
				var spaceLower = 0;
				var spaceHigher = 0;
				angular.forEach(level.elements, function (evt, key) {
					if (key < level.elements.length - 1) {
						spaceHigher = evt.sampleStart + (level.elements[key + 1].sampleStart - level.elements[key].sampleStart) / 2;
					} else {
						spaceHigher = $scope.vs.curViewPort.bufferLength;
					}

					if (key > 0) {
						spaceLower = evt.sampleStart - (level.elements[key].sampleStart - level.elements[key - 1].sampleStart) / 2;
					}

					if (pcm <= spaceHigher && pcm >= spaceLower) {
						ret = id;
					}
					++id;
				});
			}
			return ret;
		};


	});