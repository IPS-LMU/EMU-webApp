'use strict';

angular.module('emuwebApp')
	.service('HistoryService', function HistoryService($log, Ssffdataservice, Levelservice, ConfigProviderService, viewState, Soundhandlerservice) {

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
							Levelservice.moveBoundry(cur.name, cur.id, -cur.movedBy, cur.position);
						} else {
							Levelservice.moveBoundry(cur.name, cur.id, cur.movedBy, cur.position);
						}
						break;
					case 'moveSegment':
						if (applyOldVal) {
							Levelservice.moveSegment(cur.name, cur.id, cur.length, -cur.movedBy);
						} else {
							Levelservice.moveSegment(cur.name, cur.id, cur.length, cur.movedBy);
						}
						break;
					case 'movePoint':
						if (applyOldVal) {
							Levelservice.movePoint(cur.name, cur.id, -cur.movedBy);
						} else {
							Levelservice.movePoint(cur.name, cur.id, cur.movedBy);
						}
						break;
					case 'renameLabel':
						if (applyOldVal) {
							Levelservice.renameLabel(cur.name, cur.id, cur.oldValue);
						} else {
							Levelservice.renameLabel(cur.name, cur.id, cur.newValue);
						}
						break;
					case 'renameLevel':
						if (applyOldVal) {
							Levelservice.renameLevel(cur.newname, cur.name, cur.curPerspectiveIdx);
						} else {
							Levelservice.renameLevel(cur.name, cur.newname, cur.curPerspectiveIdx);
						}
						break;
					case 'deleteLevel':
						if (applyOldVal) {
							Levelservice.addLevel(cur.level, cur.id, cur.curPerspectiveIdx);
						} else {
							Levelservice.deleteLevel(cur.id, cur.curPerspectiveIdx);
						}
						break;
					case 'addLevel':
						if (applyOldVal) {
							Levelservice.deleteLevel(cur.id, cur.curPerspectiveIdx);
						} else {
							Levelservice.addLevel(cur.level, cur.id, cur.curPerspectiveIdx);
						}
						break;
					case 'deleteBoundary':
						if (applyOldVal) {
							Levelservice.deleteBoundaryInvers(cur.name, cur.id, cur.deletedSegment);
						} else {
							Levelservice.deleteBoundary(cur.name, cur.id);
						}
						break;
					case 'deleteSegments':
						if (applyOldVal) {
							Levelservice.deleteSegmentsInvers(cur.name, cur.id, cur.length, cur.deletedSegment);
						} else {
							Levelservice.deleteSegments(cur.name, cur.id, cur.length);
						}
						break;
					case 'insertSegments':
						if (applyOldVal) {
							Levelservice.insertSegmentInvers(cur.name, cur.start, cur.end, cur.segName);
						} else {
							Levelservice.insertSegment(cur.name, cur.start, cur.end, cur.segName);
						}
						break;
					case 'insertPoint':
						if (applyOldVal) {
							Levelservice.insertPointInvers(cur.name, cur.start, cur.pointName);
						} else {
							Levelservice.insertPoint(cur.name, cur.start, cur.pointName);
						}
						break;
					case 'expandSegments':
						if (applyOldVal) {
							Levelservice.expandSegment(cur.rightSide, cur.item, cur.levelName, -cur.changeTime);
						} else {
							Levelservice.expandSegment(cur.rightSide, cur.item, cur.levelName, cur.changeTime);
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
			var dataKey = String(obj.type + '#' + obj.action + '#' + obj.name + '#' + obj.id);
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