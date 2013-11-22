'use strict';

angular.module('emulvcApp')
	.service('HistoryService', function HistoryService(Ssffdataservice, Tierdataservice) {
		// shared service object
		var sServObj = {};
		
		sServObj.myHistory = undefined;
		sServObj.myHistoryCounter = undefined;
		sServObj.session = undefined;
		
		
		sServObj.init = function() {
			sServObj.myHistoryCounter = 0;
			sServObj.myHistory = new Array();
		};		


		sServObj.history = function() {
			sServObj.myHistory[sServObj.myHistoryCounter] = angular.copy({ ssff: Ssffdataservice.getData(), tier: Tierdataservice.getData() });
			++sServObj.myHistoryCounter;
			console.log(sServObj.myHistory);
		};

		sServObj.goBackHistory = function() {
			if (sServObj.myHistoryCounter > 0) {
				Ssffdataservice.setData(sServObj.myHistory[sServObj.myHistoryCounter-1].ssff);
				Tierdataservice.setData(sServObj.myHistory[sServObj.myHistoryCounter-1].tier);
				--sServObj.myHistoryCounter;
				
			} else {
				alert("no more history!");
			}
		};
						
		return sServObj;
	});