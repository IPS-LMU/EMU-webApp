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
		    if(viewState.isEditing()) {
		        $scope.renameLabel(viewState.getcurClickTierName(),viewState.getlastID(),$("."+viewState.getlasteditArea()).val());
		        viewState.deleteEditArea();
		    }
		});
		
		$scope.$on('deleteEditArea', function(e) {
		    viewState.deleteEditArea();
		});	
		
		$scope.$on('tab-next', function(e) {
		    var now = parseInt(viewState.getcurClickSegment()[0],10);
		    if(now<$scope.tierDetails.events.length-1) ++now;
		    else now = 0;
		    viewState.setcurClickSegment(viewState.getcurClickTierName(),now);
		});				

		$scope.$on('tab-prev', function(e) {
		    var now = parseInt(viewState.getcurClickSegment()[0],10);
		    if(now>0) --now;
		    else now = $scope.tierDetails.events.length-1;
		    viewState.setcurClickSegment(viewState.getcurClickTierName(),now);
		});				

		
	    $scope.renameLabel = function(tier,id,name) {
	        var i = 0;
            angular.forEach($scope.tierDetails.events, function(evt) {
                if(id==i) {
		            evt.label = name;
		        }
		        ++i;
		    });      
        };
        
        $scope.getPCMpp = function(event) {
            var start = parseInt($scope.viewState.sS,10);
            var end = parseInt($scope.viewState.eS,10);
            return (end-start)/event.originalEvent.srcElement.width;      
        }
        
        $scope.getEventId = function(x,event) {
            var pcm = parseInt($scope.viewState.sS,10)+x; 
            var id = 0;
            var ret = 0;
            angular.forEach($scope.tierDetails.events, function(evt) {
                if(pcm>=evt.startSample && pcm <= (evt.startSample+evt.sampleDur)) {
		            ret=id;
		        }
		        ++id;
		    });      
		    return ret;
        }
        
        
        $scope.getEvent = function(x) {
            var pcm = parseInt($scope.viewState.sS,10)+x; 
            var evtr = null;
		    angular.forEach($scope.tierDetails.events, function(evt) {
		        if(pcm>=evt.startSample && pcm <= (evt.startSample+evt.sampleDur)) {
		            evtr=evt;
		        }
		    });      
            return evtr;
        }        	
		
		
});
