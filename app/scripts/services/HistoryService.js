'use strict';

angular.module('emulvcApp')
	.service('HistoryService', function HistoryService(Ssffdataservice, Tierdataservice) {
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

		sServObj.history = function() {
		    sServObj.myHistory[sServObj.myHistoryCounter] = new Array();
			sServObj.myHistory[sServObj.myHistoryCounter][0] = Ssffdataservice.jsonData();
			sServObj.myHistory[sServObj.myHistoryCounter][1] = Tierdataservice.jsonData();
		    ++sServObj.myHistoryCounter;			
		};

		sServObj.goBackHistory = function() {
			if (sServObj.myHistoryCounter >= 0) {
				--sServObj.myHistoryCounter;
				Ssffdataservice.restoreJsonData($scope.myHistory[sServObj.myHistoryCounter][0]);
				Tierdataservice.restoreJsonData($scope.myHistory[sServObj.myHistoryCounter][1]);
				
			} else {
				alert("no more history!");
			}
		};
						
		return sServObj;
	});