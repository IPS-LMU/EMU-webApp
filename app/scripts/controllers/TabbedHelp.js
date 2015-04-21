'use strict';

angular.module('emuwebApp')
	.controller('TabbedHelpCtrl', function ($scope, ConfigProviderService) {

		// all available tabs
		$scope.tabs = [{
			title: 'About',
			url: 'views/helpTabs/about.html'
		}, {
			title: 'Manual',
			url: 'views/helpTabs/manual.html'
		}, {
			title: 'FAQ',
			url: 'views/helpTabs/FAQs.html'
		}];
		
		$scope.cps = ConfigProviderService;

		// current open tab
		$scope.currentTabUrl = $scope.tabs[0].url;
		
		$scope.onClickTab = function (tab) {
			$scope.currentTabUrl = tab.url;
		};

		$scope.isActiveTab = function (tabUrl) {
			if (tabUrl === $scope.currentTabUrl) {
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