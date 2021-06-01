import * as angular from 'angular';
import * as showdown from 'showdown';
import { version } from "../../../package.json";

angular.module('emuwebApp')
.controller('TabbedHelpCtrl', ['$scope', '$sce', 'ConfigProviderService', 'IoHandlerService',
	function ($scope, $sce, ConfigProviderService, IoHandlerService) {
	$scope.cps = ConfigProviderService;
	$scope.tree = [];
	$scope.converter = new showdown.Converter();
	IoHandlerService.httpGetPath('manual/index.json', undefined, true).then((resp) => {
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
			IoHandlerService.httpGetPath(node.url, undefined, true).then((resp) => {
				if (node.url.substr(node.url.lastIndexOf('.') + 1).toLowerCase() === 'md') {
					resp.data = resp.data.replace("@@versionnr", version);
					$scope.htmlStr = $sce.trustAsHtml($scope.converter.makeHtml(resp.data));
				} else {
					$scope.htmlStr = $sce.trustAsHtml(resp.data);
				}
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
	}]);
