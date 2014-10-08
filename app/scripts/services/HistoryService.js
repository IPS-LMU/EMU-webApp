'use strict';

angular.module('emuwebApp')
	.service('HistoryService', function HistoryService($log, Ssffdataservice, LevelService, ConfigProviderService, viewState, Soundhandlerservice) {

		// shared service object
		var sServObj = {};
		sServObj.movesAwayFromLastSave = 0;

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
						var tr = ConfigProviderService.getSsffTrackConfig(cur.trackName);
						var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
						col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.oldValue;
					} else {
						var tr = ConfigProviderService.getSsffTrackConfig(cur.trackName);
						var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
						col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.newValue;
					}
				} else if (cur.type === 'ESPS') {
					switch (cur.action) {
					case 'MOVEBOUNDARY':
						if (applyOldVal) {
							LevelService.moveBoundary(cur.name, cur.id, -cur.movedBy, cur.isFirst, cur.isLast);
						} else {
							LevelService.moveBoundary(cur.name, cur.id, cur.movedBy, cur.isFirst, cur.isLast);
						}
						break;
					case 'MOVESEGMENT':
						if (applyOldVal) {
							LevelService.moveSegment(cur.name, cur.id, cur.length, -cur.movedBy);
						} else {
							LevelService.moveSegment(cur.name, cur.id, cur.length, cur.movedBy);
						}
						break;
					case 'MOVEPOINT':
						if (applyOldVal) {
							LevelService.movePoint(cur.name, cur.id, -cur.movedBy);
						} else {
							LevelService.movePoint(cur.name, cur.id, cur.movedBy);
						}
						break;
					case 'RENAMELABEL':
						if (applyOldVal) {
							LevelService.renameLabel(cur.name, cur.id, cur.attrIndex, cur.oldValue);
						} else {
							LevelService.renameLabel(cur.name, cur.id, cur.attrIndex, cur.newValue);
						}
						break;
					case 'RENAMELEVEL':
						if (applyOldVal) {
							LevelService.renameLevel(cur.newname, cur.name, cur.curPerspectiveIdx);
						} else {
							LevelService.renameLevel(cur.name, cur.newname, cur.curPerspectiveIdx);
						}
						break;
					case 'DELETELEVEL':
						if (applyOldVal) {
							LevelService.addLevel(cur.level, cur.id, cur.curPerspectiveIdx);
						} else {
							LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
						}
						break;
					case 'ADDLEVEL':
						if (applyOldVal) {
							LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
						} else {
							LevelService.addLevel(cur.level, cur.id, cur.curPerspectiveIdx);
						}
						break;
					case 'DELETEBOUNDARY':
						if (applyOldVal) {
							LevelService.deleteBoundaryInvers(cur.name, cur.id, cur.isFirst, cur.isLast, cur.deletedSegment);
						} else {
							LevelService.deleteBoundary(cur.name, cur.id, cur.isFirst, cur.isLast);
						}
						break;
					case 'DELETESEGMENTS':
						if (applyOldVal) {
							LevelService.deleteSegmentsInvers(cur.name, cur.id, cur.length, cur.deletedSegment);
						} else {
							LevelService.deleteSegments(cur.name, cur.id, cur.length);
						}
						break;
					case 'INSERTSEGMENTS':
						if (applyOldVal) {
							LevelService.insertSegmentInvers(cur.name, cur.start, cur.end, cur.segName);
						} else {
							LevelService.insertSegment(cur.name, cur.start, cur.end, cur.segName, cur.ids);
						}
						break;
					case 'INSERTPOINT':
						if (applyOldVal) {
							LevelService.deletePoint(cur.name, cur.id);
						} else {
							LevelService.insertPoint(cur.name, cur.start, cur.pointName, cur.id);
						}
						break;
					case 'DELETEPOINT':
						if (applyOldVal) {
							LevelService.insertPoint(cur.name, cur.start, cur.pointName, cur.id);
						} else {
							LevelService.deletePoint(cur.name, cur.id);
						}
						break;						
					case 'EXPANDSEGMENTS':
						if (applyOldVal) {
							LevelService.expandSegment(cur.rightSide, cur.item, cur.levelName, -cur.changeTime);
						} else {
							LevelService.expandSegment(cur.rightSide, cur.item, cur.levelName, cur.changeTime);
						}
						break;

					}
				}
			});
		}
		
		/////////////////////////////////////
		// public API

		/**
		 *
		 */
		sServObj.updateCurChangeObj = function (dataObj) {
			// console.log(dataObj);
			var dataKey;
			if (dataObj.type === 'SSFF') {
				dataKey = String(dataObj.type + '#' + dataObj.trackName) + '#' + String(dataObj.sampleBlockIdx) + '#' + String(dataObj.sampleIdx);
				console.log(dataKey);
				// update curChangeObj
				if (!curChangeObj[dataKey]) {
					curChangeObj[dataKey] = dataObj;
				} else {
					// console.log('here' + curChangeObj[dataKey].oldValue);
					// keep init old value
					dataObj.oldValue = curChangeObj[dataKey].oldValue;
					curChangeObj[dataKey] = dataObj;
				}
			} else if (dataObj.type === 'ESPS') {
				switch (dataObj.action) {
				case 'MOVEBOUNDARY':
				case 'MOVEPOINT':
				case 'MOVESEGMENT':
				case 'INSERTPOINT':
					dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.name + '#' + dataObj.id);
					if (!curChangeObj[dataKey]) {
						curChangeObj[dataKey] = dataObj;
					} else {
						dataObj.movedBy += curChangeObj[dataKey].movedBy;
						curChangeObj[dataKey] = dataObj;
					}
					break;
				}
			}
			return (curChangeObj);

		};

		// addCurChangeObjToUndoStack
		sServObj.addCurChangeObjToUndoStack = function () {
			// empty redo stack
			redoStack = [];
			// add to undoStack
			if (!$.isEmptyObject(curChangeObj)) {
				undoStack.push(curChangeObj);
				sServObj.movesAwayFromLastSave += 1;
			}
			$log.info(curChangeObj);
			// reset curChangeObj
			curChangeObj = {};



		};

		// addCurChangeObjToUndoStack
		sServObj.addObjToUndoStack = function (obj) {
			// empty redo stack
			redoStack = [];
			var tmpObj = {};
			var dataKey = String(obj.type + '#' + obj.action + '#' + obj.name + '#' + obj.id);
			tmpObj[dataKey] = angular.copy(obj);
			// add to undoStack
			if (!$.isEmptyObject(tmpObj)) {
				undoStack.push(tmpObj);
				sServObj.movesAwayFromLastSave += 1;
			}
			// reset curChangeObj
			curChangeObj = {};

		};

		// undo
		sServObj.undo = function () {
			if (undoStack.length > 0) {
				// add to redo stack
				var oldChangeObj = angular.copy(undoStack[undoStack.length - 1]);
				redoStack.push(oldChangeObj);
				applyChange(oldChangeObj, true);
				// remove old 
				undoStack.pop();
				sServObj.movesAwayFromLastSave -= 1;
			}

		};

		// redo
		sServObj.redo = function () {
			if (redoStack.length > 0) {
				var oldChangeObj = angular.copy(redoStack[redoStack.length - 1]);
				undoStack.push(oldChangeObj);
				applyChange(oldChangeObj, false);
				redoStack.pop();
				sServObj.movesAwayFromLastSave += 1;
			}
		};

		// getNrOfPossibleUndos
		sServObj.getNrOfPossibleUndos = function () {
			return undoStack.length;
		};


		// return current History Stack
		sServObj.getCurrentStack = function () {
			return {'undo': undoStack, 'redo': redoStack};
		};

		// resetToInitState
		sServObj.resetToInitState = function () {
			undoStack = [];
			redoStack = [];
			curChangeObj = {};
			sServObj.movesAwayFromLastSave = 0;
		};

		return sServObj;
	});