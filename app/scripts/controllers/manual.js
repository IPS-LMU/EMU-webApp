'use strict';

/**
 * @ngdoc function
 * @name emuwebApp.controller:ManualctrlCtrl
 * @description
 * # ManualctrlCtrl
 * Controller of the emuwebApp
 */
angular.module('emuwebApp')
	.controller('ManualCtrl', function ($scope) {
		$scope.listOfMarkdownFiles = [{
			title: 'Introduction',
			url: 'manual/Introduction.md'
		}, {
			title: 'EMU-webApp-websocket-protocol',
			url: 'manual/EMU-webApp-websocket-protocol.md'
		}, {
			title: 'Labeling articulatory data',
			url: 'manual/Labeling-articulatory-data.md'
		}];

		$scope.curMdFile = $scope.listOfMarkdownFiles[1];

		$scope.setCurrentMdFile = function (mdFile) {
			$scope.curMdFile = mdFile;
		};


		$scope.getManualLinkColor = function (ml) {
			var curColor;
			if (ml.title === $scope.curMdFile.title) {
				curColor = {
					'color': 'grey'
				};
			} else {
				curColor = {
					'color': 'blue'
				};
			}

			return curColor;

		};

	});