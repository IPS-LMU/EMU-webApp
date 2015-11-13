'use strict';

angular.module('emuwebApp')
	.service('HistoryService', function HistoryService($log, $compile, Ssffdataservice, LevelService, LinkService, ConfigProviderService, viewState, Soundhandlerservice) {

		// shared service object
		var sServObj = {};
		sServObj.movesAwayFromLastSave = 0;

		//////////////////////////////////////////
		// new dual stack implementation

		// private
		var undoStack = [];
		var redoStack = [];
		var curChangeObj = {};

		// applyChanges should be called by undo redo functions
		function applyChange(changeObj, applyOldVal) {
			Object.keys(changeObj).forEach(function (key) {
				var cur = changeObj[key];
				if (cur.type === 'SSFF') {
					if (applyOldVal) {
						sServObj.setHistoryActionText(true, 'SSFF manipulation');
						var tr = ConfigProviderService.getSsffTrackConfig(cur.trackName);
						var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
						col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.oldValue;
					} else {
						sServObj.setHistoryActionText(false, 'SSFF manipulation');
						var tr = ConfigProviderService.getSsffTrackConfig(cur.trackName);
						var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
						col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.newValue;
					}
				} else if (cur.type === 'ANNOT') {
					var action = false;
					switch (cur.action) {
						case 'MOVEBOUNDARY':
							if (applyOldVal) {
								action = true;
								LevelService.moveBoundary(cur.name, cur.id, -cur.movedBy, cur.isFirst, cur.isLast);
							} else {
								LevelService.moveBoundary(cur.name, cur.id, cur.movedBy, cur.isFirst, cur.isLast);
							}
							break;
						case 'MOVESEGMENT':
							if (applyOldVal) {
								action = true;
								LevelService.moveSegment(cur.name, cur.id, cur.length, -cur.movedBy);
							} else {
								LevelService.moveSegment(cur.name, cur.id, cur.length, cur.movedBy);
							}
							break;
						case 'MOVEEVENT':
							if (applyOldVal) {
								action = true;
								LevelService.moveEvent(cur.name, cur.id, -cur.movedBy);
							} else {
								LevelService.moveEvent(cur.name, cur.id, cur.movedBy);
							}
							break;
						case 'RENAMELABEL':
							if (applyOldVal) {
								action = true;
								LevelService.renameLabel(cur.name, cur.id, cur.attrIndex, cur.oldValue);
							} else {
								LevelService.renameLabel(cur.name, cur.id, cur.attrIndex, cur.newValue);
							}
							break;
						case 'RENAMELEVEL':
							if (applyOldVal) {
								action = true;
								LevelService.renameLevel(cur.newname, cur.name, cur.curPerspectiveIdx);
							} else {
								LevelService.renameLevel(cur.name, cur.newname, cur.curPerspectiveIdx);
							}
							break;
						case 'DELETELEVEL':
							if (applyOldVal) {
								action = true;
								LevelService.insertLevel(cur.level, cur.id, cur.curPerspectiveIdx);
							} else {
								LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
							}
							break;
						case 'DELETEBOUNDARY':
							if (applyOldVal) {
								action = true;
								LevelService.deleteBoundaryInvers(cur.name, cur.id, cur.isFirst, cur.isLast, cur.deletedSegment);
							} else {
								LevelService.deleteBoundary(cur.name, cur.id, cur.isFirst, cur.isLast);
							}
							break;
						case 'DELETESEGMENTS':
							if (applyOldVal) {
								action = true;
								LevelService.deleteSegmentsInvers(cur.name, cur.id, cur.length, cur.deletedSegment);
							} else {
								LevelService.deleteSegments(cur.name, cur.id, cur.length);
							}
							break;
						case 'DELETEEVENT':
							if (applyOldVal) {
								action = true;
								LevelService.insertEvent(cur.name, cur.start, cur.pointName, cur.id);
							} else {
								LevelService.deleteEvent(cur.name, cur.id);
							}
							break;
						case 'DELETELINKSTO':
							if (applyOldVal) {
								action = true;
								LinkService.insertLinksTo(cur.deletedLinks);
							} else {
								LinkService.deleteLinksTo(cur.id);
							}
							break;
						case 'DELETELINKBOUNDARY':
							if (applyOldVal) {
								action = true;
								LinkService.deleteLinkBoundaryInvers(cur.deletedLinks);
							} else {
								LinkService.deleteLinkBoundary(cur.id, cur.neighbourId);
							}
							break;
						case 'DELETELINKSEGMENT':
							if (applyOldVal) {
								action = true;
								LinkService.deleteLinkSegmentInvers(cur.deletedLinks);
							} else {
								LinkService.deleteLinkSegment(cur.segments);
							}
							break;
						case 'INSERTLEVEL':
							if (applyOldVal) {
								action = true;
								LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
							} else {
								LevelService.insertLevel(cur.level, cur.id, cur.curPerspectiveIdx);
							}
							break;
						case 'INSERTSEGMENTS':
							if (applyOldVal) {
								action = true;
								LevelService.insertSegmentInvers(cur.name, cur.start, cur.end, cur.segName);
							} else {
								LevelService.insertSegment(cur.name, cur.start, cur.end, cur.segName, cur.ids);
							}
							break;
						case 'INSERTEVENT':
							if (applyOldVal) {
								action = true;
								LevelService.deleteEvent(cur.name, cur.id);
							} else {
								LevelService.insertEvent(cur.name, cur.start, cur.pointName, cur.id);
							}
							break;
						case 'INSERTLINKSTO':
							if (applyOldVal) {
								action = true;
								LinkService.deleteLinksTo(cur.parentID, cur.childIDs);
							} else {
								LinkService.insertLinksTo(cur.parentID, cur.childIDs);
							}
							break;
						case 'EXPANDSEGMENTS':
							if (applyOldVal) {
								action = true;
								LevelService.expandSegment(cur.rightSide, cur.item, cur.name, -cur.changeTime);
							} else {
								LevelService.expandSegment(cur.rightSide, cur.item, cur.name, cur.changeTime);
							}
							break;
					}
					sServObj.setHistoryActionText(action, cur.action);
				} else if (cur.type === 'HIERARCHY') {
					var action = false;
					switch (cur.action) {
						case 'DELETELINK':
							// The order of links is not preserved on undo
							if (applyOldVal) {
								action = true;
								LinkService.insertLinkAt(cur.fromID, cur.toID, cur.position);
							} else {
								LinkService.deleteLink(cur.fromID, cur.toID);
							}
							break;

						case 'DELETEITEM':
							if (applyOldVal) {
								action = true;
								LevelService.deleteItemWithLinksInvers(cur.item, cur.levelName, cur.position, cur.deletedLinks);
							} else {
								LevelService.deleteItemWithLinks(cur.item.id);
							}
							break;

						case 'ADDITEM':
							if (applyOldVal) {
								action = true;
								LevelService.addItemInvers(cur.newID);
							} else {
								LevelService.addItem(cur.neighborID, cur.before, cur.newID);
							}
							break;

						case 'ADDLINK':
							if (applyOldVal) {
								action = true;
								LinkService.deleteLink(cur.link.fromID, cur.link.toID);
							} else {
								LinkService.insertLink(cur.link.fromID, cur.link.toID);
							}
							break;

						case 'PUSHITEM':
							if (applyOldVal) {
								action = true;
								LevelService.addItemInvers(cur.newID);
							} else {
								LevelService.pushNewItem(cur.level, cur.newID);
							}
							break;
					}
					sServObj.setHistoryActionText(action, cur.action);
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
					case 'INSERTEVENT':
					case 'DELETEEVENT':
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

		// set the displayed text of the historyActionPopup
		sServObj.setHistoryActionText = function (isUndo, text) {
			var front = '<i>UNDO</i> &#8594; ';
			if(!isUndo) {
				front = '<i>REDO</i> &#8592; ';
			}
			viewState.historyActionTxt = front + text;
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
