'use strict';

/**
 * @ngdoc function
 * @name emuwebApp.controller:ManualctrlCtrl
 * @description
 * # ManualctrlCtrl
 * Controller of the emuwebApp
 */
angular.module('emuwebApp')
	.controller('ManualCtrl', function ($scope, ConfigProviderService) {
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

		$scope.curMdFile = $scope.listOfMarkdownFiles[0];

		$scope.setCurrentMdFile = function (mdFile) {
			$scope.curMdFile = mdFile;
		};
		
		$scope.isCurrentMdFile = function (tabUrl) {
		    console.log(tabUrl);
		    console.log($scope.curMdFile.url);
			if (tabUrl === $scope.curMdFile.url) {
				return {
					'background-color': ConfigProviderService.design.color.white,
					'color': ConfigProviderService.design.color.black,
					'font-weight': '500'
				};
			}
			return {
					'background-color': ConfigProviderService.design.color.blue,
					'color': ConfigProviderService.design.color.white,
					'font-weight': '400'
				};
		};		

	});