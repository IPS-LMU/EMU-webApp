'use strict';

angular.module('emuwebApp')
	.controller('TabbedHelpCtrl', function ($scope, $sce, ConfigProviderService, Iohandlerservice) {
		$scope.cps = ConfigProviderService;
		$scope.tree = [];
		$scope.converter = new showdown.Converter();
		Iohandlerservice.httpGetPath('manual/index.json').then(function (resp) {
			$scope.tree = resp.data;
			// console.log($scope.tree);
			// load root element
			$scope.onClickTab($scope.tree[0]);
			// expand root element
			$scope.tree[0].expanded = true;

		});

		$scope.onClickTab = function (node) {
			node.expanded = !node.expanded;
			if (node.url !== false) {
				Iohandlerservice.httpGetPath(node.url).then(function (resp) {
					if (node.url.substr(node.url.lastIndexOf('.') + 1).toLowerCase() === 'md') {
						$scope.htmlStr = $sce.trustAsHtml($scope.converter.makeHtml(resp.data));
					} else {
						$scope.htmlStr = $sce.trustAsHtml(resp.data);
					}
					console.log($scope.htmlStr);
				});
			}
		};

		$scope.hasChildren = function (node) {
			if (node.nodes !== undefined) {
				if (node.nodes.length > 0) {
					return true;
				}
			}
			return false;
		};
	});
