'use strict';

angular.module('emulvcApp')
	.service('HistoryService', function HistoryService(Ssffdataservice, Levelservice, ConfigProviderService) {


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
				level: Levelservice.getData()
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
				Levelservice.setData(sServObj.myHistory[sServObj.myHistoryCounter - 2].level);
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

		// applyChanges should be called by undo redo functions
		function applyChange(changeObj, applyOldVal) {
			Object.keys(changeObj).forEach(function (key) {
				var cur = changeObj[key];
				if (cur.type === 'SSFF') {
					if (applyOldVal) {
						Ssffdataservice.data[cur.ssffIdx].Columns[cur.colIdx].values[cur.sampleBlockIdx][cur.sampleIdx] = cur.oldValue;
					} else {
						Ssffdataservice.data[cur.ssffIdx].Columns[cur.colIdx].values[cur.sampleBlockIdx][cur.sampleIdx] = cur.newValue;
					}
				} else if (cur.type === 'ESPS') {
					console.log('###UNDOING esps change');
					console.log(cur);
					switch (cur.action) {
					case 'moveBoundary':
						if (applyOldVal) {
						    var res = Levelservice.getLevelDetails(cur.levelName);	
						    Levelservice.moveBoundry(-cur.movedBy, res.level, cur.itemIdx);
						} else {
						    var res = Levelservice.getLevelDetails(cur.levelName);	
						    Levelservice.moveBoundry(cur.movedBy, res.level, cur.itemIdx);
						}
						break;
					case 'snapBoundary':
						if (applyOldVal) {
						    var res = Levelservice.getLevelDetails(cur.levelName);	
						    Levelservice.moveBoundry(-cur.movedBy, res.level, cur.itemIdx, cur.max);
						} else {
						    var res = Levelservice.getLevelDetails(cur.levelName);	
						    Levelservice.moveBoundry(cur.movedBy, res.level, cur.itemIdx, cur.max);
						}
						break;						
					case 'moveSegment':
						if (applyOldVal) {
						    var res = Levelservice.getLevelDetails(cur.levelName);	
						    Levelservice.moveSegment(-cur.movedBy, res.level, cur.itemIdx);
						} else {
						    var res = Levelservice.getLevelDetails(cur.levelName);	
						    Levelservice.moveSegment(cur.movedBy, res.level, cur.itemIdx);
						}
						break;
					case 'renameLabel':
						if (applyOldVal) {
							Levelservice.renameLabel(cur.levelName, cur.itemIdx, cur.oldValue);
						} else {
							Levelservice.renameLabel(cur.levelName, cur.itemIdx, cur.newValue);
						}
						break;
					case 'renameLevel':
						if (applyOldVal) {
						    Levelservice.renameLevel(cur.levelName, cur.oldName);	
						} else {
						    Levelservice.renameLevel(cur.oldName, cur.levelName);	
						}
						break;						
					case 'deleteLevel':
						if (applyOldVal) {
							Levelservice.data.levels.splice(cur.itemIdx, 0, cur.level);
						} else {
							Levelservice.data.levels.splice(cur.itemIdx, 1);
						}
						break;						
					case 'deleteBoundary':
						if (applyOldVal) {
							Levelservice.insertSegment(cur.seg.sampleStart, cur.seg.sampleStart ,cur.levelName, ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
						} else {
							Levelservice.deleteBoundary(cur.seg, cur.levelName, cur.levelType);
						}
						break;					
					case 'deleteSegments':
						if (applyOldVal) {
							Levelservice.deleteSegmentsInvers(cur.selected, cur.ids, cur.levelName);
						} else {
							Levelservice.deleteSegments(cur.selected, cur.ids, cur.levelName);
						}
						break;
					case 'insertSegments':
						if (applyOldVal) {
							Levelservice.insertSegmentInvers(cur.start, cur.end,cur.levelName, cur.segname);
						} else {
						    Levelservice.insertSegment(cur.start, cur.end,cur.levelName, cur.segname);
						}
						break;
					case 'insertPoint':
						if (applyOldVal) {
							Levelservice.insertPointInvers(cur.start, cur.levelName ,cur.pointName);
						} else {
							Levelservice.insertPoint(cur.start, cur.levelName, cur.pointName);
						}
						break;												
					case 'expandSegments':
						if (applyOldVal) {
							Levelservice.expandSegment(!cur.expand, cur.rightSide, cur.itemIdx, cur.levelName, cur.changeTime); 
						} else {
							Levelservice.expandSegment(cur.expand, cur.rightSide, cur.itemIdx, cur.levelName, cur.changeTime);
						}
						break;

					}
				}
			});
		}

		// public API
		sServObj.updateCurChangeObj = function (dataObj) {
			// console.log(dataObj);
			var dataKey;
			if (dataObj.type === 'SSFF') {
				dataKey = String(dataObj.type + '#' + dataObj.ssffIdx) + '#' + String(dataObj.colIdx) + '#' + String(dataObj.sampleBlockIdx) + '#' + String(dataObj.sampleIdx);
				// update curChangeObj
				if (!curChangeObj[dataKey]) {
					curChangeObj[dataKey] = dataObj;
				} else {
					console.log('here' + curChangeObj[dataKey].oldValue);
					// keep init old value
					dataObj.oldValue = curChangeObj[dataKey].oldValue;
					curChangeObj[dataKey] = dataObj;
				}
			} else if (dataObj.type === 'ESPS') {
				switch (dataObj.action) {
				case 'moveBoundary':
				case 'moveSegment':
					dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.levelName + '#' + dataObj.itemIdx);
					if (!curChangeObj[dataKey]) {
						curChangeObj[dataKey] = dataObj;
					} else {
						dataObj.movedBy += curChangeObj[dataKey].movedBy;
						curChangeObj[dataKey] = dataObj;
					}
					break;


				}
			}
			// console.log(curChangeObj);

		};

		// addCurChangeObjToUndoStack
		sServObj.addCurChangeObjToUndoStack = function () {
			// empty redo stack
			redoStack = [];
			// add to undoStack
			if (!$.isEmptyObject(curChangeObj)) {
				undoStack.push(curChangeObj);
			}
			// reset curChangeObj
			curChangeObj = {};

			// console.log(undoStack);

		};

		// addCurChangeObjToUndoStack
		sServObj.addObjToUndoStack = function (obj) {
			// empty redo stack
			redoStack = [];
			var tmpObj = {};
			tmpObj[String(obj.type) + '#' + String(obj.ssffIdx) + '#' + String(obj.itemIdx)] = obj;
			// add to undoStack
			if (!$.isEmptyObject(tmpObj)) {
				undoStack.push(tmpObj);
			}
			// reset curChangeObj
			curChangeObj = {};
			console.log(undoStack);

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