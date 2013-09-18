'use strict';

angular.module('emulvcApp')
	.controller('HandletiersCtrl', function($scope, $http, viewState) {
		$scope.viewState = viewState;

		$scope.testValue = '';


		$http.get('testData/PhoneticTier.json').success(function(data) {
			$scope.tierDetails = data;
		});

		$scope.updateAllLabels = function() {
			if ($scope.testValue !== '') {
				angular.forEach($scope.tierDetails.events, function(evt) {
					evt.label = $scope.testValue;
				});
			}
		};
	});