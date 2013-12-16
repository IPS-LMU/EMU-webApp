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

		//////////////////////////////////////////
		// new dual stack implementation

		//private
		var undoStack = [];
		var redoStack = [];
		var curChangeObj = {};

		function applyChange(changeObj, applyOldVal) {

			Object.keys(changeObj).forEach(function (key) {
				// console.log(key)
				var cur = changeObj[key];
				// console.log(Ssffdataservice.data[cur.ssffIdx].Columns[cur.colIdx].values[cur.sampleBlockIdx][cur.sampleIdx]);
				// console.log(cur);
				// console.log(cur.oldValue);
				if (applyOldVal) {
					Ssffdataservice.data[cur.ssffIdx].Columns[cur.colIdx].values[cur.sampleBlockIdx][cur.sampleIdx] = cur.oldValue;
				} else {
					Ssffdataservice.data[cur.ssffIdx].Columns[cur.colIdx].values[cur.sampleBlockIdx][cur.sampleIdx] = cur.newValue;
				}
			});
		}

		// public API
		sServObj.updateCurChangeObj = function (dataObj) {
			var dataKey = String('SSFF' + '#' + dataObj.ssffIdx) + '#' + String(dataObj.colIdx) + '#' + String(dataObj.sampleBlockIdx) + '#' + String(dataObj.sampleIdx);
			if (!curChangeObj[dataKey]) {
				curChangeObj[dataKey] = dataObj;
			} else {
				// keep init old value
				dataObj.oldValue = curChangeObj[dataKey].oldValue;
				curChangeObj[dataKey] = dataObj;
			}

		};


		sServObj.addCurChangeObjToUndoStack = function () {
			// empty redo stack
			redoStack = [];
			// add to undoStack
			if (!$.isEmptyObject(curChangeObj)) {
				undoStack.push(curChangeObj);
			}
			// reset curChangeObj
			curChangeObj = {};

			// console.log(undoStack[undoStack.length - 1]);

		};

		// undo
		sServObj.undo = function () {
			if (undoStack.length > 0) {
				// console.log('##########UNDO');
				// add to redo stack
				var oldChangeObj = angular.copy(undoStack[undoStack.length - 1]);
				redoStack.push(oldChangeObj);
				applyChange(oldChangeObj, true);
				// remove old 
				undoStack.pop();
			}

		};

		// redo
		sServObj.redo = function () {
			// console.log('##########REDO');
			if (redoStack.length > 0) {
				var oldChangeObj = angular.copy(redoStack[redoStack.length - 1]);
				undoStack.push(oldChangeObj);
				applyChange(oldChangeObj, false);
				redoStack.pop();
			}
		};

		// getNrOfPossibleUndos
		sServObj.getNrOfPosibleUndos = function () {
			return undoStack.length;
		};




		return sServObj;
	});