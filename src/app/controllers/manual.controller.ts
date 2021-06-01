import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';


/**
 * @ngdoc function
 * @name emuwebApp.controller:ManualctrlCtrl
 * @description
 * # ManualctrlCtrl
 * Controller of the emuwebApp
 */
angular.module('emuwebApp')
	.controller('ManualCtrl', ['$scope', 'ConfigProviderService', 
	function ($scope, ConfigProviderService) {
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
			// console.log(tabUrl);
			// console.log($scope.curMdFile.url);
			if (tabUrl === $scope.curMdFile.url) {
				return {
					'background-color': styles.colorWhite,
					'color': styles.colorBlack,
					'font-weight': '500'
				};
			}
			return {
				'background-color': styles.colorBlue,
				'color': styles.colorWhite,
				'font-weight': '400'
			};
		};

	}]);