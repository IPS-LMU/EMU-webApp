'use strict';

angular.module('emuwebApp')
	.controller('TabbedCtrl', function ($scope, ConfigProviderService, Iohandlerservice) {
		$scope.cps = ConfigProviderService;
		// all available tabs
		$scope.tree = [{
				title: 'Main',
				url: 'views/EMUwebAppConfig/main.html'
			}, {
				title: 'Spectrogram Settings',
				url: 'views/EMUwebAppConfig/spectro.html'
			}, {
				title: 'Perspectives',
				url: 'views/EMUwebAppConfig/perspectives.html'
			}, {
				title: 'Label Config',
				url: 'views/EMUwebAppConfig/label.html'
			}, {
				title: 'Restrictions',
				url: 'views/EMUwebAppConfig/restrictions.html'
		}];

		$scope.onClickTab = function (node) {
			if(node.expanded === undefined) {
				node.expanded = false;
			}
			node.expanded = !node.expanded;
			if(node.url !== false) {
				if(node.url.substr(node.url.lastIndexOf('.') + 1).toLowerCase() === 'md') {
					$scope.isMDFile = true;
					$scope.currentTabUrl = node.url;
				}
				else {
					$scope.isMDFile = false;
					$scope.currentTabUrl = node.url;
				}
			}
		};

		$scope.hasChildren = function (node) {
			if(node.nodes !== undefined) {
				if(node.nodes.length > 0) {
					return true;
				}
			}
			return false;
		};

		$scope.onClickTab($scope.tree[0]);
	});
