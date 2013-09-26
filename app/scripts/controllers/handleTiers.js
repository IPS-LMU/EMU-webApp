'use strict';

angular.module('emulvcApp')
	.controller('HandletiersCtrl', function($scope, $http, viewState) {
	
		$scope.viewState = viewState;
		$scope.testValue = '';
		$scope.message = '';

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
		
		$scope.$on('renameLabel', function(e) {
		    $scope.renameLabel("",viewState.getlastID(),$("."+viewState.getlasteditArea()).val());
		    viewState.deleteEditArea();
		});
		
	    $scope.renameLabel = function(tier,id,name) {
            console.log(tier);
            console.log(id);
            console.log(name);
        }		
		
		
});
