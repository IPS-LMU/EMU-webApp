'use strict';

angular.module('emuwebApp')
	.controller('HandleLevelsCtrl', function ($scope, $http, $injector, viewState, HistoryService, Soundhandlerservice, Levelservice, fontScaleService, Drawhelperservice, dialogService) {

		$scope.vs = viewState;
		$scope.hists = HistoryService;
		$scope.fontImage = fontScaleService;
		$scope.shs = Soundhandlerservice;
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
		// $scope.$on('newlyLoadedLabelJson', function (evt, data) {
			// if ($.isEmptyObject($scope.levelDetails.data)) {
				// $scope.levelDetails.data = data;
			// } else {
				// data.levels.forEach(function (level) {
				// 	if (level.type === 'EVENT' || level.type === 'SEGMENT') {
				// 		$scope.levelDetails.data.levels.push(level);
				// 	}
				// });
				// data.fileInfos.forEach(function (fInf) {
				// 	$scope.levelDetails.data.fileInfos.push(fInf);
				// });
				// console.log(JSON.stringify($scope.levelDetails, undefined, 2));
			// }
			// $scope.sortLevels();
		// });

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

	});