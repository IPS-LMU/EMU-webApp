'use strict';

angular.module('emulvcApp')
	.service('Ssffdataservice', function Ssffdataservice() {
		// shared service object
		var sServObj = {};

		sServObj.data = [];

		sServObj.getData = function () {
			return sServObj.data;
		};

		sServObj.setData = function (data) {
			angular.copy(data, sServObj.data);
		};

		sServObj.getDataOfFile = function (fName) {
			var splArr, curName, sName, resIdx;
			splArr = fName.split('/');
			sName = splArr[splArr.length - 1];
			sServObj.data.forEach(function (ssffObj, idx) {
				splArr = ssffObj.fileURL.split('/');
				curName = splArr[splArr.length - 1];
				if(curName === sName){
					resIdx = idx;
				}
			});
			return sServObj.data[resIdx];
		};

		return sServObj;
	});