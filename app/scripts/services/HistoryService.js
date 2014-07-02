'use strict';

angular.module('emuwebApp')
	.service('HistoryService', function HistoryService(Ssffdataservice, Levelservice, ConfigProviderService, viewState, Soundhandlerservice) {

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
							Levelservice.moveBoundry(-cur.movedBy, cur.levelName, cur.segID, cur.neighbours);
						} else {
							Levelservice.moveBoundry(cur.movedBy, cur.levelName, cur.segID, cur.neighbours);
						}
						break;
					case 'moveSegment':
						if (applyOldVal) {
							Levelservice.moveSegment(-cur.movedBy, cur.levelName, cur.item, cur.neighbours);
						} else {
							Levelservice.moveSegment(cur.movedBy, cur.levelName, cur.item, cur.neighbours);
						}
						break;
					case 'movePoint':
						if (applyOldVal) {
							Levelservice.movePoint(-cur.movedBy, cur.levelName, cur.segID);
						} else {
							Levelservice.movePoint(cur.movedBy, cur.levelName, cur.segID);
						}
						break;
					case 'renameLabel':
						if (applyOldVal) {
							Levelservice.renameLabel(cur.levelName, cur.item, cur.oldValue);
						} else {
							Levelservice.renameLabel(cur.levelName, cur.item, cur.newValue);
						}
						break;
					case 'renameLevel':
						if (applyOldVal) {
							Levelservice.renameLevel(cur.levelName, cur.oldName, cur.curPerspectiveIdx);
						} else {
							Levelservice.renameLevel(cur.oldName, cur.levelName, cur.curPerspectiveIdx);
						}
						break;
					case 'deleteLevel':
						if (applyOldVal) {
							Levelservice.addLevel(cur.level, cur.level.name, cur.idx, cur.curPerspectiveIdx);
						} else {
							Levelservice.deleteLevel(cur.level.name, cur.idx, cur.curPerspectiveIdx);
						}
						break;
					case 'addLevel':
						if (applyOldVal) {
							Levelservice.deleteLevel(cur.name, cur.idx, cur.curPerspectiveIdx);
						} else {
							Levelservice.addLevel(cur.level, cur.name, cur.idx, cur.curPerspectiveIdx);
						}
						break;
					case 'deleteBoundary':
						if (applyOldVal) {
							Levelservice.deleteBoundaryInvers(cur.seg, cur.levelName, cur.order);
						} else {
							Levelservice.deleteBoundary(cur.seg, cur.levelName);
						}
						break;
					case 'deleteSegments':
						if (applyOldVal) {
							Levelservice.deleteSegmentsInvers(cur.levelName, cur.selected, cur.neighbours);
						} else {
							Levelservice.deleteSegments(cur.levelName, cur.selected, cur.neighbours);
						}
						break;
					case 'insertSegments':
						if (applyOldVal) {
							Levelservice.insertSegmentInvers(cur.start, cur.end, cur.levelName, cur.segname);
						} else {
							Levelservice.insertSegment(cur.start, cur.end, cur.levelName, cur.segname);
						}
						break;
					case 'insertPoint':
						if (applyOldVal) {
							Levelservice.insertPointInvers(cur.start, cur.levelName, cur.pointName);
						} else {
							Levelservice.insertPoint(cur.start, cur.levelName, cur.pointName);
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
		
		sServObj.setLastNeighbours = function (pcm, levelname) {
		    var lastEventMove = Levelservice.getEvent(pcm, levelname, Soundhandlerservice.wavJSO.Data.length);
            var lastNeighboursMove = Levelservice.getElementNeighbourDetails(levelname, lastEventMove.nearest.id, lastEventMove.nearest.id);
            viewState.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove);
		};
		
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
					dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.levelName + '#' + dataObj.segID);
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
			// reset curChangeObj
			curChangeObj = {};



		};

		// addCurChangeObjToUndoStack
		sServObj.addObjToUndoStack = function (obj) {
			// empty redo stack
			redoStack = [];
			var tmpObj = {};
			var dataKey = String(obj.type + '#' + obj.action + '#' + obj.name + '#' + obj.idx);
			tmpObj[dataKey] = obj;
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