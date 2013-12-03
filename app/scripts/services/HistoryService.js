'use strict';

angular.module('emulvcApp')
	.service('HistoryService', function HistoryService(Ssffdataservice, Tierdataservice) {
		// shared service object
		var sServObj = {};

		sServObj.myHistory = [];
		sServObj.myHistoryCounter = 0;
		sServObj.session = undefined;


		sServObj.init = function () {
			sServObj.history();
		};

		sServObj.history = function () {
			var newClone = angular.copy({
				ssff: Ssffdataservice.getData(),
				tier: Tierdataservice.getData()
			});
			if (sServObj.myHistoryCounter > 0) {
				var oldClone = angular.copy(sServObj.myHistory[sServObj.myHistoryCounter - 1]);
				if (angular.equals(newClone, oldClone) === false) {
					sServObj.myHistory[sServObj.myHistoryCounter] = newClone;
					++sServObj.myHistoryCounter;
				}
			} else {
				sServObj.myHistory[sServObj.myHistoryCounter] = newClone;
				++sServObj.myHistoryCounter;
			}

		};

		sServObj.goBackHistory = function () {
			if (sServObj.myHistoryCounter > 1) {
				Ssffdataservice.setData(sServObj.myHistory[sServObj.myHistoryCounter - 2].ssff);
				Tierdataservice.setData(sServObj.myHistory[sServObj.myHistoryCounter - 2].tier);
				--sServObj.myHistoryCounter;
				return true;
			} else {
				return false;
			}
		};

		return sServObj;
	});