'use strict';

angular.module('emuwebApp')
	.service('HistoryService', function HistoryService($log, Ssffdataservice, LevelService, LinkService, ConfigProviderService, viewState, Soundhandlerservice) {

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
						viewState.historyActionTxt = 'UNDO: SSFF manipulation';
						var tr = ConfigProviderService.getSsffTrackConfig(cur.trackName);
						var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
						col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.oldValue;
					} else {
						viewState.historyActionTxt = 'REDO: SSFF manipulation';
						var tr = ConfigProviderService.getSsffTrackConfig(cur.trackName);
						var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
						col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.newValue;
					}
				} else if (cur.type === 'ANNOT') {
					switch (cur.action) {
					case 'MOVEBOUNDARY':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: MOVEBOUNDARY';
							LevelService.moveBoundary(cur.name, cur.id, -cur.movedBy, cur.isFirst, cur.isLast);
						} else {
							viewState.historyActionTxt = 'REDO: MOVEBOUNDARY';
							LevelService.moveBoundary(cur.name, cur.id, cur.movedBy, cur.isFirst, cur.isLast);
						}
						break;
					case 'MOVESEGMENT':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: MOVESEGMENT';
							LevelService.moveSegment(cur.name, cur.id, cur.length, -cur.movedBy);
						} else {
							viewState.historyActionTxt = 'REDO: MOVESEGMENT';
							LevelService.moveSegment(cur.name, cur.id, cur.length, cur.movedBy);
						}
						break;
					case 'MOVEEVENT':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: MOVEEVENT';
							LevelService.moveEvent(cur.name, cur.id, -cur.movedBy);
						} else {
							viewState.historyActionTxt = 'REDO: MOVEEVENT';
							LevelService.moveEvent(cur.name, cur.id, cur.movedBy);
						}
						break;
					case 'RENAMELABEL':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: RENAMELABEL';
							LevelService.renameLabel(cur.name, cur.id, cur.attrIndex, cur.oldValue);
						} else {
							viewState.historyActionTxt = 'REDO: RENAMELABEL';
							LevelService.renameLabel(cur.name, cur.id, cur.attrIndex, cur.newValue);
						}
						break;
					case 'RENAMELEVEL':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: RENAMELEVEL';
							LevelService.renameLevel(cur.newname, cur.name, cur.curPerspectiveIdx);
						} else {
							viewState.historyActionTxt = 'REDO: RENAMELEVEL';
							LevelService.renameLevel(cur.name, cur.newname, cur.curPerspectiveIdx);
						}
						break;
					case 'DELETELEVEL':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: DELETELEVEL';
							LevelService.insertLevel(cur.level, cur.id, cur.curPerspectiveIdx);
						} else {
							viewState.historyActionTxt = 'REDO: DELETELEVEL';
							LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
						}
						break;
					case 'DELETEBOUNDARY':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: DELETEBOUNDARY';
							LevelService.deleteBoundaryInvers(cur.name, cur.id, cur.isFirst, cur.isLast, cur.deletedSegment);
						} else {
							viewState.historyActionTxt = 'REDO: DELETEBOUNDARY';
							LevelService.deleteBoundary(cur.name, cur.id, cur.isFirst, cur.isLast);
						}
						break;
					case 'DELETESEGMENTS':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: DELETESEGMENTS';
							LevelService.deleteSegmentsInvers(cur.name, cur.id, cur.length, cur.deletedSegment);
						} else {
							viewState.historyActionTxt = 'REDO: DELETESEGMENTS';
							LevelService.deleteSegments(cur.name, cur.id, cur.length);
						}
						break;
					case 'DELETEEVENT':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: DELETEEVENT';
							LevelService.insertEvent(cur.name, cur.start, cur.pointName, cur.id);
						} else {
							viewState.historyActionTxt = 'REDO: DELETEEVENT';
							LevelService.deleteEvent(cur.name, cur.id);
						}
						break;
					case 'DELETELINKSTO':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: DELETELINKSTO';
							LinkService.insertLinksTo(cur.deletedLinks);
						} else {
							viewState.historyActionTxt = 'REDO: DELETELINKSTO';
							LinkService.deleteLinksTo(cur.id);
						}
						break;
					case 'DELETELINKBOUNDARY':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: DELETELINKBOUNDARY';
							LinkService.deleteLinkBoundaryInvers(cur.deletedLinks);
						} else {
							viewState.historyActionTxt = 'REDO: DELETELINKBOUNDARY';
							LinkService.deleteLinkBoundary(cur.id, cur.neighbourId);
						}
						break;		
					case 'DELETELINKSEGMENT':
						if (applyOldVal) {
							LinkService.deleteLinkSegmentInvers(cur.deletedLinks);
						} else {
							LinkService.deleteLinkSegment(cur.segments);
						}
						break;									
					case 'INSERTLEVEL':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: INSERTLEVEL';
							LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
						} else {
							viewState.historyActionTxt = 'REDO: INSERTLEVEL';
							LevelService.insertLevel(cur.level, cur.id, cur.curPerspectiveIdx);
						}
						break;
					case 'INSERTSEGMENTS':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: INSERTSEGMENTS';
							LevelService.insertSegmentInvers(cur.name, cur.start, cur.end, cur.segName);
						} else {
							viewState.historyActionTxt = 'REDO: INSERTSEGMENTS';
							LevelService.insertSegment(cur.name, cur.start, cur.end, cur.segName, cur.ids);
						}
						break;
					case 'INSERTEVENT':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: INSERTEVENT';
							LevelService.deleteEvent(cur.name, cur.id);
						} else {
							viewState.historyActionTxt = 'REDO: INSERTEVENT';
							LevelService.insertEvent(cur.name, cur.start, cur.pointName, cur.id);
						}
						break;
					case 'INSERTLINKSTO':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: INSERTLINKSTO';
							LinkService.deleteLinksTo(cur.parentID, cur.childIDs);
						} else {
							viewState.historyActionTxt = 'REDO: INSERTLINKSTO';
							LinkService.insertLinksTo(cur.parentID, cur.childIDs);
						}
						break;
					case 'EXPANDSEGMENTS':
						if (applyOldVal) {
							viewState.historyActionTxt = 'UNDO: EXPANDSEGMENTS';
							LevelService.expandSegment(cur.rightSide, cur.item, cur.levelName, -cur.changeTime);
						} else {
							viewState.historyActionTxt = 'REDO: EXPANDSEGMENTS';
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
				// update curChangeObj
				if (!curChangeObj[dataKey]) {
					curChangeObj[dataKey] = dataObj;
				} else {
					dataObj.oldValue = curChangeObj[dataKey].oldValue;
					curChangeObj[dataKey] = dataObj;
				}
			} else if (dataObj.type === 'ANNOT') {
				switch (dataObj.action) {
				case 'MOVEBOUNDARY':
				case 'MOVEEVENT':
				case 'MOVESEGMENT':
					dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.name + '#' + dataObj.id);
					if (!curChangeObj[dataKey]) {
						curChangeObj[dataKey] = dataObj;
					} else {
						dataObj.movedBy += curChangeObj[dataKey].movedBy;
						curChangeObj[dataKey] = dataObj;
					}
					break;
				case 'INSERTLINKSTO':
				case 'DELETELINKSTO':
				case 'DELETELINKBOUNDARY':
				case 'DELETELINKSEGMENT':
				case 'DELETEBOUNDARY':
				case 'DELETESEGMENTS':
				case 'DELETEEVENT':
					dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.name);
					if (!curChangeObj[dataKey]) {
						curChangeObj[dataKey] = dataObj;
					} else {
						dataObj.oldValue = curChangeObj[dataKey].oldValue;
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
			return {
				'undo': undoStack,
				'redo': redoStack
			};
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