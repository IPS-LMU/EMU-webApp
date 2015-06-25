'use strict';

angular.module('emuwebApp')
	.controller('TabbedHelpCtrl', function ($scope, ConfigProviderService, Iohandlerservice) {
		$scope.cps = ConfigProviderService;
		$scope.tree = [];
		Iohandlerservice.httpGetPath('manual/manual.json').then(function (resp) {
			$scope.tree = resp.data;
			console.log($scope.tree);
			// current open tab
			$scope.currentTabUrl = $scope.tree[0].url;

		});

		$scope.onClickTab = function (node) {
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
		}
	});
