'use strict';

angular.module('emuwebApp')
	.controller('TabbedHelpCtrl', function ($scope) {

		// all available tabs
		$scope.tabs = [{
			title: 'about',
			url: 'views/helpTabs/about.html'
		}, {
			title: 'manual',
			url: 'views/helpTabs/manual.html'
		}, {
			title: 'FAQ',
			url: 'views/helpTabs/FAQs.html'
		}];

		// current open tab
		$scope.currentTabUrl = $scope.tabs[0].url;
		
		$scope.onClickTab = function (tab) {
			$scope.currentTabUrl = tab.url;
		};

		$scope.isActiveTab = function (tabUrl) {
			if (tabUrl === $scope.currentTabUrl) {
				return {
					'background-color': '#FFF',
					'color': '#000'
				};
			}
			return {};
		};


	});