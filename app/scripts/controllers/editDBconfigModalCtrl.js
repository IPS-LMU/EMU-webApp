'use strict';

angular.module('emuwebApp')
	.controller('editDBconfigModalCtrl', function ($scope, modalService, ConfigProviderService) {

		$scope.cps = ConfigProviderService;

		//maybe keep these in ConfigProviderService or even better query the schema... hard coded for now 
		$scope.possibleConfigValues = {
			levelType: ['ITEM','SEGMENT', 'EVENT'],
			attributeDefinitions: ['STRING']
		};

		/**
		 *
		 */
		$scope.reset = function () {
			modalService.close();
		};
		

	});