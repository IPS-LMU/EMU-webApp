'use strict';

angular.module('emulvcApp')
	.controller('HandletiersCtrl', function($scope, $http, viewState) {
		$scope.viewState = viewState;
		$http.get('testData/PhoneticTier.json').success(function(data) {
			$scope.viewState.eS = data.events[data.events.length-1].startSample + data.events[data.events.length-1].sampleDur;
			$scope.viewState.bufferLength = $scope.viewState.eS;
			$scope.tierDetails = data;
		});

	});