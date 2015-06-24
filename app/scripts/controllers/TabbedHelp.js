'use strict';

angular.module('emuwebApp')
	.controller('TabbedHelpCtrl', function ($scope, ConfigProviderService) {

		// all available tabs
		$scope.tree = [{
			title: 'EMU-webApp',
			url: 'views/helpTabs/intro.html',
			expanded: true,
			nodes: [{
					title: 'What\'s new',
					url: 'views/helpTabs/news.html',
					expanded: false,
				},{
					title: 'Getting Help',
					url: false,
					expanded: false,
					nodes: [{
						title: 'Manual',
						url: 'views/helpTabs/manual.html',
						expanded: false,
					}, {
						title: 'FAQ',
						url: 'views/helpTabs/FAQs.html',
						expanded: false,
					}]
				}]
		}];

		$scope.cps = ConfigProviderService;

		// current open tab
		$scope.currentTabUrl = $scope.tree[0].url;

		console.log($scope.currentTabUrl);

		$scope.onClickTab = function (node) {
			node.expanded = !node.expanded;
			if(node.url !== false) {
				$scope.currentTabUrl = node.url;
			}
		};

		$scope.hasChildren = function (node) {
			if(node.nodes !== undefined) {
				if(node.nodes.length > 0) {
					return true;
				}
			}
			return false;
		}
	});
