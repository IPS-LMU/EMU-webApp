'use strict';

angular.module('emulvcApp')
	.service('HistoryService', function HistoryService() {
		// shared service object
		var sServObj = {};
		
		sServObj.myHistory = undefined;
		sServObj.myHistoryCounter = undefined;
		sServObj.jsonTier = undefined;
		sServObj.jsonSSFF = undefined;
		
		
		sServObj.init = function() {
			//sServObj.myHistory[sServObj.myHistoryCounter] = jQuery.extend(true, {}, $scope.tierDetails.data);
			sServObj.myHistoryCounter = 0;
			sServObj.myHistory = new Array();
		};		

		sServObj.history = function(tierData,ssffData) {
		    sServObj.myHistory[sServObj.myHistoryCounter] = new Array();
			sServObj.myHistory[sServObj.myHistoryCounter][0] = jQuery.extend(true, {}, tierData);
			sServObj.myHistory[sServObj.myHistoryCounter][1] = jQuery.extend(true, {}, ssffData);
		    ++sServObj.myHistoryCounter;			
		};

		sServObj.goBackHistory = function() {
			if (sServObj.myHistoryCounter >= 0) {
				--sServObj.myHistoryCounter;
				sServObj.jsonTier = jQuery.extend(true, {}, $scope.myHistory[sServObj.myHistoryCounter][0]);
				sServObj.jsonSSFF = jQuery.extend(true, {}, $scope.myHistory[sServObj.myHistoryCounter][1]);
				
			} else {
				alert("no more history!");
			}
		};
						
		return sServObj;
	});