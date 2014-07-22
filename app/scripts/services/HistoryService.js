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
					case 'moveBoundary':
						if (applyOldVal) {
							LevelService.moveBoundary(cur.name, cur.id, -cur.movedBy, cur.position);
						} else {
							LevelService.moveBoundary(cur.name, cur.id, cur.movedBy, cur.position);
						}
						break;
					case 'moveSegment':
						if (applyOldVal) {
							LevelService.moveSegment(cur.name, cur.id, cur.length, -cur.movedBy);
						} else {
							LevelService.moveSegment(cur.name, cur.id, cur.length, cur.movedBy);
						}
						break;
					case 'movePoint':
						if (applyOldVal) {
							LevelService.movePoint(cur.name, cur.id, -cur.movedBy);
						} else {
							LevelService.movePoint(cur.name, cur.id, cur.movedBy);
						}
						break;
					case 'renameLabel':
						if (applyOldVal) {
							LevelService.renameLabel(cur.name, cur.id, cur.oldValue);
						} else {
							LevelService.renameLabel(cur.name, cur.id, cur.newValue);
						}
						break;
					case 'renameLevel':
						if (applyOldVal) {
							LevelService.renameLevel(cur.newname, cur.name, cur.curPerspectiveIdx);
						} else {
							LevelService.renameLevel(cur.name, cur.newname, cur.curPerspectiveIdx);
						}
						break;
					case 'deleteLevel':
						if (applyOldVal) {
							LevelService.addLevel(cur.level, cur.id, cur.curPerspectiveIdx);
						} else {
							LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
						}
						break;
					case 'addLevel':
						if (applyOldVal) {
							LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
						} else {
							LevelService.addLevel(cur.level, cur.id, cur.curPerspectiveIdx);
						}
						break;
					case 'deleteBoundary':
						if (applyOldVal) {
							LevelService.deleteBoundaryInvers(cur.name, cur.id, cur.deletedSegment);
						} else {
							LevelService.deleteBoundary(cur.name, cur.id);
						}
						break;
					case 'deleteSegments':
						if (applyOldVal) {
							LevelService.deleteSegmentsInvers(cur.name, cur.id, cur.length, cur.deletedSegment);
						} else {
							LevelService.deleteSegments(cur.name, cur.id, cur.length);
						}
						break;
					case 'insertSegments':
						if (applyOldVal) {
							LevelService.insertSegmentInvers(cur.name, cur.start, cur.end, cur.segName);
						} else {
							LevelService.insertSegment(cur.name, cur.start, cur.end, cur.segName, cur.ids);
						}
						break;
					case 'insertPoint':
						if (applyOldVal) {
							LevelService.insertPointInvers(cur.name, cur.start, cur.pointName);
						} else {
							LevelService.insertPoint(cur.name, cur.start, cur.pointName, cur.id);
						}
						break;
					case 'expandSegments':
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
				case 'moveBoundary':
				case 'movePoint':
				case 'moveSegment':
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
			var dataKey = String(obj.type + '#' + obj.action + '#' + obj.name + '#' + obj.id + '#' + obj.order);
			tmpObj[dataKey] = angular.copy(obj);
			// add to undoStack
			if (!$.isEmptyObject(tmpObj)) {
				undoStack.push(tmpObj);
				sServObj.movesAwayFromLastSave += 1;
			}
			// reset curChangeObj
			curChangeObj = {};
			// console.log(undoStack);

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
				sServObj.movesAwayFromLastSave -= 1;
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