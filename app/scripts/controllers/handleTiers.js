'use strict';

angular.module('emulvcApp')
	.controller('HandletiersCtrl', function($scope, $http, viewState) {
	
		$scope.viewState = viewState;
		$scope.testValue = '';
		$scope.lasteditArea = null;	

		$http.get('testData/PhoneticTier.json').success(function(data) {
			$scope.viewState.eS = data.events[data.events.length-1].startSample + data.events[data.events.length-1].sampleDur;
			$scope.viewState.bufferLength = $scope.viewState.eS;
			$scope.tierDetails = data;
		});
		
		$scope.updateAllLabels = function() {
		    if ($scope.testValue !== '') {
		        angular.forEach($scope.tierDetails.events, function(evt) {
		            evt.label = $scope.testValue;
		        });
		    }
		};
		
		$scope.$on('renameLabel', function(e, newName) {
		    alert($("."+$scope.getlasteditArea()).val());
		});
		
		$scope.setlasteditArea = function(name) {
		    $scope.lasteditArea = name;
		}
		
		$scope.getlasteditArea = function() {
		    return $scope.lasteditArea;
		}			
		
});
