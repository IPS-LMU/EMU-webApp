import * as angular from 'angular';

export class HistoryService {
	
	
	//////////////////////////////////////////
	// new dual stack implementation
	// private dep. injected vars
	private $log; 
	private $compile;
	private $sce;
	private SsffDataService;
	private LevelService;
	private LinkService;
	private ConfigProviderService ;
	private ViewStateService;
	private SoundHandlerService;
	private LoadedMetaDataService;
	
	// private misc vars
	private undoStack = [];
	private redoStack = [];
	private curChangeObj = {};
	// public vars
	public movesAwayFromLastSave = 0;

	constructor($log, $compile, $sce, SsffDataService, LevelService, LinkService, ConfigProviderService, ViewStateService, SoundHandlerService, LoadedMetaDataService){
		this.$log = $log; 
		this.$compile = $compile;
		this.$sce = $sce;
		this.SsffDataService = SsffDataService;
		this.LevelService = LevelService;
		this.LinkService = LinkService;
		this.ConfigProviderService = ConfigProviderService; 
		this.ViewStateService = ViewStateService;
		this.SoundHandlerService = SoundHandlerService;
		this.LoadedMetaDataService = LoadedMetaDataService;
	}
	
	// applyChanges should be called by undo redo functions
	private applyChange(changeObj, applyOldVal) {
		Object.keys(changeObj).forEach(key => {
			var tr, col, action;
			var cur = changeObj[key];
			if (cur.type === 'SSFF') {
				if (applyOldVal) {
					this.setHistoryActionText(true, 'SSFF manipulation');
					tr = this.ConfigProviderService.getSsffTrackConfig(cur.trackName);
					col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
					col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.oldValue;
				} else {
					this.setHistoryActionText(false, 'SSFF manipulation');
					tr = this.ConfigProviderService.getSsffTrackConfig(cur.trackName);
					col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
					col.values[cur.sampleBlockIdx][cur.sampleIdx] = cur.newValue;
				}
			} else if (cur.type === 'WEBAPP') {
				action = false;
				switch (cur.action) {
					case 'COMMENT':
					// The order of links is not preserved on undo
					if (applyOldVal) {
						action = true;
						this.LoadedMetaDataService.setBndlComment(cur.initial, cur.key, cur.index);
					} else {
						this.LoadedMetaDataService.setBndlComment(cur.comment, cur.key, cur.index);
					}
					break;
					case 'FINISHED':
					if (applyOldVal) {
						action = true;
						this.LoadedMetaDataService.setBndlFinished(!cur.finished, cur.key, cur.index);
					} else {
						this.LoadedMetaDataService.setBndlFinished(cur.finished, cur.key, cur.index);
					}
					break;
				}
				this.setHistoryActionText(action, cur.action);
			} else if (cur.type === 'ANNOT') {
				action = false;
				switch (cur.action) {
					case 'MOVEBOUNDARY':
					if (applyOldVal) {
						action = true;
						this.LevelService.moveBoundary(cur.name, cur.id, -cur.movedBy, cur.isFirst, cur.isLast);
					} else {
						this.LevelService.moveBoundary(cur.name, cur.id, cur.movedBy, cur.isFirst, cur.isLast);
					}
					break;
					case 'MOVESEGMENT':
					if (applyOldVal) {
						action = true;
						this.LevelService.moveSegment(cur.name, cur.id, cur.length, -cur.movedBy);
					} else {
						this.LevelService.moveSegment(cur.name, cur.id, cur.length, cur.movedBy);
					}
					break;
					case 'MOVEEVENT':
					if (applyOldVal) {
						action = true;
						this.LevelService.moveEvent(cur.name, cur.id, -cur.movedBy);
					} else {
						this.LevelService.moveEvent(cur.name, cur.id, cur.movedBy);
					}
					break;
					case 'RENAMELABEL':
					if (applyOldVal) {
						action = true;
						this.LevelService.renameLabel(cur.name, cur.id, cur.attrIndex, cur.oldValue);
					} else {
						this.LevelService.renameLabel(cur.name, cur.id, cur.attrIndex, cur.newValue);
					}
					break;
					case 'RENAMELEVEL':
					if (applyOldVal) {
						action = true;
						this.LevelService.renameLevel(cur.newname, cur.name, cur.curPerspectiveIdx);
					} else {
						this.LevelService.renameLevel(cur.name, cur.newname, cur.curPerspectiveIdx);
					}
					break;
					case 'DELETELEVEL':
					if (applyOldVal) {
						action = true;
						this.LevelService.insertLevel(cur.level, cur.id, cur.curPerspectiveIdx);
					} else {
						this.LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
					}
					break;
					case 'DELETEBOUNDARY':
					if (applyOldVal) {
						action = true;
						this.LevelService.deleteBoundaryInvers(cur.name, cur.id, cur.isFirst, cur.isLast, cur.deletedSegment);
					} else {
						this.LevelService.deleteBoundary(cur.name, cur.id, cur.isFirst, cur.isLast);
					}
					break;
					case 'DELETESEGMENTS':
					if (applyOldVal) {
						action = true;
						this.LevelService.deleteSegmentsInvers(cur.name, cur.id, cur.length, cur.deletedSegment);
					} else {
						this.LevelService.deleteSegments(cur.name, cur.id, cur.length);
					}
					break;
					case 'DELETEEVENT':
					if (applyOldVal) {
						action = true;
						this.LevelService.insertEvent(cur.name, cur.start, cur.pointName, cur.id);
					} else {
						this.LevelService.deleteEvent(cur.name, cur.id);
					}
					break;
					case 'DELETELINKSTO':
					if (applyOldVal) {
						action = true;
						this.LinkService.insertLinksTo(cur.deletedLinks);
					} else {
						this.LinkService.deleteLinksTo(cur.id);
					}
					break;
					case 'DELETELINKBOUNDARY':
					if (applyOldVal) {
						action = true;
						this.LinkService.deleteLinkBoundaryInvers(cur.deletedLinks);
					} else {
						this.LinkService.deleteLinkBoundary(cur.id, cur.neighbourId, this.LevelService);
					}
					break;
					case 'DELETELINKSEGMENT':
					if (applyOldVal) {
						action = true;
						this.LinkService.deleteLinkSegmentInvers(cur.deletedLinks);
					} else {
						this.LinkService.deleteLinkSegment(cur.segments);
					}
					break;
					case 'INSERTLEVEL':
					if (applyOldVal) {
						action = true;
						this.LevelService.deleteLevel(cur.id, cur.curPerspectiveIdx);
					} else {
						this.LevelService.insertLevel(cur.level, cur.id, cur.curPerspectiveIdx);
					}
					break;
					case 'INSERTSEGMENTS':
					if (applyOldVal) {
						action = true;
						this.LevelService.insertSegmentInvers(cur.name, cur.start, cur.end, cur.segName);
					} else {
						this.LevelService.insertSegment(cur.name, cur.start, cur.end, cur.segName, cur.ids);
					}
					break;
					case 'INSERTEVENT':
					if (applyOldVal) {
						action = true;
						this.LevelService.deleteEvent(cur.name, cur.id);
					} else {
						this.LevelService.insertEvent(cur.name, cur.start, cur.pointName, cur.id);
					}
					break;
					case 'INSERTLINKSTO':
					if (applyOldVal) {
						action = true;
						this.LinkService.deleteLinksTo(cur.parentID, cur.childIDs);
					} else {
						this.LinkService.insertLinksTo(cur.parentID, cur.childIDs);
					}
					break;
					case 'EXPANDSEGMENTS':
					if (applyOldVal) {
						action = true;
						this.LevelService.expandSegment(cur.rightSide, cur.item, cur.name, -cur.changeTime);
					} else {
						this.LevelService.expandSegment(cur.rightSide, cur.item, cur.name, cur.changeTime);
					}
					break;
				}
				this.setHistoryActionText(action, cur.action);
			} else if (cur.type === 'HIERARCHY') {
				action = false;
				switch (cur.action) {
					case 'DELETELINK':
					// The order of links is not preserved on undo
					if (applyOldVal) {
						action = true;
						this.LinkService.insertLinkAt(cur.fromID, cur.toID, cur.position);
					} else {
						this.LinkService.deleteLink(cur.fromID, cur.toID);
					}
					break;
					
					case 'DELETEITEM':
					if (applyOldVal) {
						action = true;
						this.LevelService.deleteItemWithLinksInvers(cur.item, cur.levelName, cur.position, cur.deletedLinks);
					} else {
						this.LevelService.deleteItemWithLinks(cur.item.id);
					}
					break;
					
					case 'ADDITEM':
					if (applyOldVal) {
						action = true;
						this.LevelService.addItemInvers(cur.newID);
					} else {
						this.LevelService.addItem(cur.neighborID, cur.before, cur.newID);
					}
					break;
					
					case 'ADDLINK':
					if (applyOldVal) {
						action = true;
						this.LinkService.deleteLink(cur.link.fromID, cur.link.toID);
					} else {
						this.LinkService.insertLink(cur.link.fromID, cur.link.toID);
					}
					break;
					
					case 'PUSHITEM':
					if (applyOldVal) {
						action = true;
						this.LevelService.addItemInvers(cur.newID);
					} else {
						this.LevelService.pushNewItem(cur.level, cur.newID);
					}
					break;
				}
				this.setHistoryActionText(action, cur.action);
			}
		});
	}
	
	/////////////////////////////////////
	// public API
	
	/**
	*
	*/
	public updateCurChangeObj(dataObj) {
		// console.log(dataObj);
		var dataKey;
		if (dataObj.type === 'SSFF') {
			dataKey = String(dataObj.type + '#' + dataObj.trackName) + '#' + String(dataObj.sampleBlockIdx) + '#' + String(dataObj.sampleIdx);
			// update this.curChangeObj
			if (!this.curChangeObj[dataKey]) {
				this.curChangeObj[dataKey] = dataObj;
			} else {
				dataObj.oldValue = this.curChangeObj[dataKey].oldValue;
				this.curChangeObj[dataKey] = dataObj;
			}
		} else if (dataObj.type === 'WEBAPP') {
			dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.key + '#' + dataObj.index);
			// update this.curChangeObj
			if (!this.curChangeObj[dataKey]) {
				this.curChangeObj[dataKey] = dataObj;
			} else {
				dataObj.comment = this.curChangeObj[dataKey].comment;
				this.curChangeObj[dataKey] = dataObj;
			}
		} else if (dataObj.type === 'ANNOT') {
			switch (dataObj.action) {
				case 'MOVEBOUNDARY':
				case 'MOVEEVENT':
				case 'MOVESEGMENT':
				case 'INSERTEVENT':
				case 'DELETEEVENT':
				dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.name + '#' + dataObj.id);
				if (!this.curChangeObj[dataKey]) {
					this.curChangeObj[dataKey] = dataObj;
				} else {
					dataObj.movedBy += this.curChangeObj[dataKey].movedBy;
					this.curChangeObj[dataKey] = dataObj;
				}
				break;
				case 'INSERTLINKSTO':
				case 'DELETELINKSTO':
				case 'DELETELINKBOUNDARY':
				case 'DELETELINKSEGMENT':
				case 'DELETEBOUNDARY':
				case 'DELETESEGMENTS':
				dataKey = String(dataObj.type + '#' + dataObj.action + '#' + dataObj.name);
				if (!this.curChangeObj[dataKey]) {
					this.curChangeObj[dataKey] = dataObj;
				} else {
					dataObj.oldValue = this.curChangeObj[dataKey].oldValue;
					this.curChangeObj[dataKey] = dataObj;
				}
				
				break;
			}
			
		}
		return (this.curChangeObj);
		
	}
	
	// addCurChangeObjToUndoStack
	public addCurChangeObjToUndoStack() {
		// empty redo stack
		this.redoStack = [];
		// add to undoStack
		if (!$.isEmptyObject(this.curChangeObj)) {
			this.undoStack.push(this.curChangeObj);
			this.movesAwayFromLastSave += 1;
		}
		this.$log.info(this.curChangeObj);
		// reset this.curChangeObj
		this.curChangeObj = {};
		
	}
	
	// addthis.CurChangeObjToUndoStack
	public addObjToUndoStack(obj) {
		// empty redo stack
		this.redoStack = [];
		var tmpObj = {};
		var dataKey = String(obj.type + '#' + obj.action + '#' + obj.name + '#' + obj.id);
		tmpObj[dataKey] = angular.copy(obj);
		// add to undoStack
		if (!$.isEmptyObject(tmpObj)) {
			this.undoStack.push(tmpObj);
			this.movesAwayFromLastSave += 1;
		}
		// reset this.curChangeObj
		this.curChangeObj = {};
	}
	
	// undo
	public undo() {
		if (this.undoStack.length > 0) {
			// add to redo stack
			var oldChangeObj = angular.copy(this.undoStack[this.undoStack.length - 1]);
			
			this.redoStack.push(oldChangeObj);
			this.applyChange(oldChangeObj, true);
			// remove old
			this.undoStack.pop();
			this.movesAwayFromLastSave -= 1;
		}
		
	}
	
	// redo
	public redo() {
		if (this.redoStack.length > 0) {
			var oldChangeObj = angular.copy(this.redoStack[this.redoStack.length - 1]);
			this.undoStack.push(oldChangeObj);
			this.applyChange(oldChangeObj, false);
			this.redoStack.pop();
			this.movesAwayFromLastSave += 1;
		}
	}
	
	// getNrOfPossibleUndos
	public getNrOfPossibleUndos() {
		return this.undoStack.length;
	}
	
	// return current History Stack
	public getCurrentStack () {
		return {
			'undo': this.undoStack,
			'redo': this.redoStack
		};
	}
	
	// set the displayed text of the historyActionPopup
	public setHistoryActionText(isUndo, text) {
		var front = '<i>UNDO</i> &#8594; ';
		if (!isUndo) {
			front = '<i>REDO</i> &#8592; ';
		}
		this.ViewStateService.historyActionTxt = this.$sce.trustAsHtml(front + text);
	}
	
	// resetToInitState
	public resetToInitState() {
		this.undoStack = [];
		this.redoStack = [];
		this.curChangeObj = {};
		this.movesAwayFromLastSave = 0;
	}
	
}

angular.module('emuwebApp')
.service('HistoryService', ['$log', '$compile', '$sce', 'SsffDataService', 'LevelService', 'LinkService', 'ConfigProviderService', 'ViewStateService', 'SoundHandlerService', 'LoadedMetaDataService', HistoryService])
