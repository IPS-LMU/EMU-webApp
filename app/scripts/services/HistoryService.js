'use strict';

angular.module('emulvcApp')
	.service('HistoryService', function HistoryService(Ssffdataservice, Tierservice, ConfigProviderService) {


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
				tier: Tierservice.getData()
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
				Tierservice.setData(sServObj.myHistory[sServObj.myHistoryCounter - 2].tier);
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
						    var res = Tierservice.getTierDetails(cur.tierName);	
						    Tierservice.moveBoundry(-cur.movedBy, res.tier, cur.itemIdx);
						} else {
						    var res = Tierservice.getTierDetails(cur.tierName);	
						    Tierservice.moveBoundry(cur.movedBy, res.tier, cur.itemIdx);
						}
						break;
					case 'snapBoundary':
						if (applyOldVal) {
						    
						    var res = Tierservice.getTierDetails(cur.tierName);	
						    Tierservice.moveBoundry(-cur.movedBy, res.tier, cur.itemIdx);
						} else {
						    var res = Tierservice.getTierDetails(cur.tierName);	
						    Tierservice.moveBoundry(cur.movedBy, res.tier, cur.itemIdx);
						}
						break;						
					case 'moveSegment':
						if (applyOldVal) {
						    var res = Tierservice.getTierDetails(cur.tierName);	
						    Tierservice.moveSegment(-cur.movedBy, res.tier, cur.itemIdx);
						} else {
						    var res = Tierservice.getTierDetails(cur.tierName);	
						    Tierservice.moveSegment(cur.movedBy, res.tier, cur.itemIdx);
						}
						break;
					case 'renameLabel':
						if (applyOldVal) {
							Tierservice.renameLabel(cur.tierName, cur.itemIdx, cur.oldValue);
						} else {
							Tierservice.renameLabel(cur.tierName, cur.itemIdx, cur.newValue);
						}
						break;
					case 'renameTier':
						if (applyOldVal) {
						    Tierservice.renameTier(cur.tierName, cur.oldName);	
						} else {
						    Tierservice.renameTier(cur.oldName, cur.tierName);	
						}
						break;						
					case 'deleteTier':
						if (applyOldVal) {
							Tierservice.data.tiers.splice(cur.itemIdx, 0, cur.tier);
						} else {
							Tierservice.data.tiers.splice(cur.itemIdx, 1);
						}
						break;						
					case 'deleteBoundary':
						if (applyOldVal) {
							Tierservice.insertSegment(cur.seg.startSample, cur.seg.startSample ,cur.tierName, ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
						} else {
							Tierservice.deleteBoundary(cur.seg, cur.tierName, cur.tierType);
						}
						break;					
					case 'deleteSegments':
						if (applyOldVal) {
							Tierservice.deleteSegmentsInvers(cur.selected, cur.ids, cur.tierName);
						} else {
							Tierservice.deleteSegments(cur.selected, cur.ids, cur.tierName);
						}
						break;
					case 'insertSegments':
						if (applyOldVal) {
							Tierservice.insertSegmentInvers(cur.start, cur.end,cur.tierName, cur.segname);
						} else {
						    Tierservice.insertSegment(cur.start, cur.end,cur.tierName, cur.segname);
						}
						break;
					case 'insertPoint':
						if (applyOldVal) {
							Tierservice.insertPointInvers(cur.start, cur.tierName ,cur.pointName);
						} else {
							Tierservice.insertPoint(cur.start, cur.tierName, cur.pointName);
						}
						break;												
					case 'expandSegments':
						if (applyOldVal) {
							Tierservice.expandSegment(!cur.expand, cur.rightSide, cur.itemIdx, cur.tierName, cur.changeTime); 
						} else {
							Tierservice.expandSegment(cur.expand, cur.rightSide, cur.itemIdx, cur.tierName, cur.changeTime);
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
					dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.tierName + '#' + dataObj.itemIdx);
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