'use strict';

angular.module('emuwebApp')
	.controller('TabbedCtrl', function ($scope, ConfigProviderService, Validationservice) {

		$scope.cps = ConfigProviderService;
		$scope.valid = Validationservice;
		
		$scope.tabs = [{
				title: 'Level Definitions',
				url: 'views/tabbed/levelDefinition.html'
			}, {
				title: 'Link Definitions',
				url: 'views/tabbed/linkDefinition.html'
			}, {
				title: 'ssff Track Definitions',
				url: 'views/tabbed/ssffDefinition.html'
			}, {
				title: 'EMU-webApp',
				url: 'views/tabbed/emuDefinition.html'
			},{
				title: 'global DB',
				url: 'views/tabbed/globalDefinition.html'
		}];
		$scope.currentTab = 'views/tabbed/levelDefinition.html';

		$scope.possibleConfigValues = {
			levelType: ['ITEM','SEGMENT', 'EVENT'],
			attributeDefinitions: ['STRING']
		};
		
		$scope.levelTypes = [
		    { label: 'ITEM', value: 1 },
		    { label: 'SEGMENT', value: 2 },
		    { label: 'EVENT', value: 3 }
		];
		
		console.log($scope.valid.getSchema('DBconfigFileSchema'));


    $scope.onClickTab = function (tab) {
        $scope.currentTab = tab.url;
    }
    
    $scope.isActiveTab = function(tabUrl) {
        if(tabUrl == $scope.currentTab) {
            return {
                'background-color': '#FFF',
                'color': '#000'
            }
        }
        return {};
    }
});