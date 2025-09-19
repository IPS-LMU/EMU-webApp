import * as angular from 'angular';

class ViewStateService{
	private $rootScope;
	private $timeout;
	private $window;
	private SoundHandlerService;
	private DataService;
	private StandardFuncsService;
	
	// window functions enum for spectro
	private myWindow;
	
	// communication modes enum
	private myMode;
	
	// time modes enum
	private myTimeMode;
	
	// signal types enum
	private mySignalType;
	
	// twoDim types enum
	private myTwoDimType;
	
	
	
	
	private timelineSize;
	private somethingInProgress;
	private somethingInProgressTxt
	private historyActionTxt
	private editing;
	private cursorInTextField;
	private saving;
	private bundleListSideBarOpen;
	private bundleListSideBarDisabled;
	private rightSubmenuOpen;
	private curClickItems
	private curMousePosSample;
	private curMouseX;
	private curMouseY;
	private curMouseTrackName;
	private curMouseLevelName;
	private curMouseLevelType;
	private curClickLevelName;
	private curClickLevelType;
	private lastPcm;
	private curPreselColumnSample;
	private curCorrectionToolNr;
	private curClickLevelIndex;
	private start;
	private TransitionTime;
	private showDropZone;
	private movingBoundary;
	private movingBoundarySample;
	private focusInTextField;
	private curTaskPercCompl;
	private curPerspectiveIdx;
	private mouseInEmuWebApp;
	private lastKeyCode;
	private lastUpdate;
	private url;
	private pageSize;
	private currentPage;
	private curTimeAnchorIdx;
	private largeTextFieldInputFieldVisable;
	private largeTextFieldInputFieldCurLabel;
	
	// possible general states of state machine
	private states;
	
	private prevState;
	private curState;
	
	private curMouseItem;
	private curMouseNeighbours;
	private curClickNeighbours;
	private curMouseisFirst;
	private curMouseisLast;
	
	// hold the current attribute definitions that are in view
	public curLevelAttrDefs;
	
	public curViewPort;
	
	public spectroSettings;
	
	public osciSettings;
	
	public playHeadAnimationInfos;
	
	public hierarchyState;
	
	
	constructor($rootScope, $timeout, $window, SoundHandlerService, DataService, StandardFuncsService){
		this.$rootScope = $rootScope;
		this.$timeout = $timeout;
		this.$window = $window;
		this.SoundHandlerService = SoundHandlerService;
		this.DataService = DataService;
		this.StandardFuncsService = StandardFuncsService;
		
		// window functions enum for spectro
		this.myWindow = {
			BARTLETT: 1,
			BARTLETTHANN: 2,
			BLACKMAN: 3,
			COSINE: 4,
			GAUSS: 5,
			HAMMING: 6,
			HANN: 7,
			LANCZOS: 8,
			RECTANGULAR: 9,
			TRIANGULAR: 10
		};
		
		// communication modes enum
		this.myMode = {
			DEMO: 1,
			WS: 2,
			EMBEDDED: 3
		};
		
		// time modes enum
		this.myTimeMode = {
			absolute: 1,
			relative: 2
		};
		
		// signal types enum
		this.mySignalType = {
			OSCI: 1,
			SPEC: 2
		};
		
		// twoDim types enum
		this.myTwoDimType = {
			DOTS: 1,
			EPG: 2
		};
		
		// hold the current attribute definitions that are in view
		this.curLevelAttrDefs = [];
		// initialize on init
		this.initialize();
	}
	
	initialize() {
		this.curViewPort = {
			sS: 0,
			eS: 0,
			selectS: -1,
			selectE: -1,
			movingS: -1,
			movingE: -1,
			dragBarActive: false,
			dragBarHeight: -1,
			windowWidth: undefined
		};
		
		this.spectroSettings = {
			windowSizeInSecs: -1,
			rangeFrom: -1,
			rangeTo: -1,
			dynamicRange: -1,
			window: -1,
			drawHeatMapColors: -1,
			preEmphasisFilterFactor: -1
		};
		
		this.osciSettings = {
			curChannel: 0
		};
		
		this.playHeadAnimationInfos = {
			sS: -1,
			eS: -1,
			curS: null,
			endFreezeSample: -1,
			autoscroll: false
		};
		
		this.timelineSize = -1;
		this.somethingInProgress = false;
		this.somethingInProgressTxt = '';
		this.historyActionTxt = '';
		this.editing = false;
		this.cursorInTextField = false;
		this.saving = true;
		this.bundleListSideBarOpen = false;
		this.bundleListSideBarDisabled = false;
		this.rightSubmenuOpen = false;
		this.curClickItems = [];
		this.curMousePosSample = 0;
		this.curMouseX = 0;
		this.curMouseTrackName = undefined;
		this.curMouseLevelName = undefined;
		this.curMouseLevelType = undefined;
		this.curClickLevelName = undefined;
		this.curClickLevelType = undefined;
		this.lastPcm = undefined;
		this.curPreselColumnSample = 2;
		this.curCorrectionToolNr = undefined;
		this.curClickLevelIndex = undefined;
		this.start = null;
		this.TransitionTime = undefined;
		this.showDropZone = true;
		this.movingBoundary = false;
		this.movingBoundarySample = undefined;
		this.focusInTextField = false;
		this.curTaskPercCompl = 0;
		this.curPerspectiveIdx = -1;
		this.mouseInEmuWebApp = false;
		this.lastKeyCode = undefined;
		this.lastUpdate = undefined;
		this.url = undefined;
		this.pageSize = 500;
		this.currentPage = undefined;
		this.curTimeAnchorIdx = -1;
		this.largeTextFieldInputFieldVisable = false;
		this.largeTextFieldInputFieldCurLabel = '';
		
		// possible general states of state machine
		this.states = [];
		this.states.noDBorFilesloaded = {
			'permittedActions': ['connectBtnClick', 'openDemoBtnDBclick', 'aboutBtnClick']
		};
		this.states.loadingSaving = {
			'permittedActions': []
		};
		this.states.labeling = {
			'permittedActions': ['zoom', 'playaudio', 'spectSettingsChange', 'addLevelSegBtnClick', 'addLevelPointBtnClick', 'renameSelLevelBtnClick', 'downloadTextGridBtnClick', 'downloadAnnotationBtnClick', 'spectSettingsChange', 'clearBtnClick', 'labelAction', 'toggleSideBars', 'saveBndlBtnClick', 'showHierarchyBtnClick', 'editDBconfigBtnClick', 'aboutBtnClick', 'searchBtnClick']
		};
		this.states.modalShowing = this.states.loadingSaving;
		this.prevState = this.states.noDBorFilesloaded;
		this.curState = this.states.noDBorFilesloaded;
		
		this.curLevelAttrDefs = [];
		
		
		// HierarchyState object with all variables and functions
		this.hierarchyState = {
			hierarchyShown: false,
			
			// These variables will be set from within the emuhierarchy directive
			// The directive will not watch for outside changes
			selectedItemID: undefined,
			selectedLinkFromID: undefined,
			selectedLinkToID: undefined,
			editValue: undefined,
			inputFocus: false,
			collapseInfo: {},
			scaleFactor: 1,
			translate: [0, 0],
			
			// These can be set from within the emuhierarchy directive
			// But the directive will also watch for outside changes
			contextMenuID: undefined,
			newLinkFromID: undefined,
			
			// These will be set by outside components
			path: [],
			curPathIdx: 0,
			curNrOfPaths: 0,
			rotated: true,
			playing: 0, //this is only watched indirectly (the view injects this value into the directive)
			resize: 0,
			
			// member functions
			
			closeContextMenu: () => {
				this.hierarchyState.contextMenuID = undefined;
			},
			
			getContextMenuID: () => {
				return this.hierarchyState.contextMenuID;
			},
			
			getInputFocus: () => {
				return this.hierarchyState.inputFocus;
			},
			
			getEditValue: () => {
				return this.hierarchyState.editValue;
			},
			
			setEditValue: (e) => {
				this.hierarchyState.editValue = e;
			},
			
			reset: () => {
				this.hierarchyState.selectedItemID = undefined;
				this.hierarchyState.selectedLinkFromID = undefined;
				this.hierarchyState.selectedLinkToID = undefined;
				this.hierarchyState.editValue = undefined;
				this.hierarchyState.inputFocus = false;
				this.hierarchyState.collapseInfo = {};
				this.hierarchyState.scaleFactor = 1;
				this.hierarchyState.translate = [0, 0];
				this.hierarchyState.contextMenuID = undefined;
				this.hierarchyState.newLinkFromID = undefined;
			},
			
			/**
			*
			*/
			isRotated: () => {
				return this.hierarchyState.rotated;
			},
			
			/**
			*
			*/
			toggleRotation: () => {
				this.hierarchyState.rotated = !this.hierarchyState.rotated;
			},
			
			/**
			*
			*/
			toggleHierarchy: () => {
				this.hierarchyState.hierarchyShown = !this.hierarchyState.hierarchyShown;
				if (this.hierarchyState.hierarchyShown === false) {
					// Make sure no private attributes (such as do start with an underscore
					// are left in the data when the hierarchy modal is closed
					this.StandardFuncsService.traverseAndClean (this.DataService.getData());
				}
			},
			
			isShown: () => {
				return this.hierarchyState.hierarchyShown;
			},
			
			
			/**
			*
			*/
			getCollapsed: (id) => {
				if (typeof this.hierarchyState.collapseInfo[id] === 'undefined') {
					return false;
				} else {
					if (typeof this.hierarchyState.collapseInfo[id].collapsed === 'boolean') {
						return this.hierarchyState.collapseInfo[id].collapsed;
					} else {
						return false;
					}
				}
			},
			
			/**
			*
			*/
			getCollapsePosition: (id) => {
				if (typeof this.hierarchyState.collapseInfo[id] === 'undefined') {
					return undefined;
				} else {
					if (typeof this.hierarchyState.collapseInfo[id].collapsePosition === 'object') {
						return this.hierarchyState.collapseInfo[id].collapsePosition;
					} else {
						return undefined;
					}
				}
			},
			
			/**
			*
			*/
			getNumCollapsedParents: (id) => {
				if (typeof this.hierarchyState.collapseInfo[id] === 'undefined') {
					return 0;
				} else {
					if (typeof this.hierarchyState.collapseInfo[id].numCollapsedParents === 'number') {
						return this.hierarchyState.collapseInfo[id].numCollapsedParents;
					} else {
						return 0;
					}
				}
			},
			
			/**
			*
			*/
			setCollapsed: (id, newState) => {
				if (typeof this.hierarchyState.collapseInfo[id] === 'undefined') {
					this.hierarchyState.collapseInfo[id] = {};
				}
				
				this.hierarchyState.collapseInfo[id].collapsed = newState;
			},
			
			/**
			*
			*/
			setCollapsePosition: (id, newPosition) => {
				if (typeof this.hierarchyState.collapseInfo[id] === 'undefined') {
					this.hierarchyState.collapseInfo[id] = {};
				}
				
				this.hierarchyState.collapseInfo[id].collapsePosition = newPosition;
			},
			
			/**
			*
			*/
			setNumCollapsedParents: (id, newNum) => {
				if (typeof this.hierarchyState.collapseInfo[id] === 'undefined') {
					this.hierarchyState.collapseInfo[id] = {};
				}
				
				this.hierarchyState.collapseInfo[id].numCollapsedParents = newNum;
			}
		};
		
	};
	
	/**
	* function to ask permission in current labeler state
	*/
	public getPermission(actionName) {
		return (this.curState.permittedActions.indexOf(actionName) > -1);
	};
	
	/**
	*
	*/
	public setWindowWidth(b) {
		this.curViewPort.windowWidth = b;
	};
	
	/**
	* set state
	*/
	public setState(nameOrObj) {
		this.prevState = this.curState;
		if (typeof nameOrObj === 'string') {
			this.curState = this.states[nameOrObj];
		} else {
			this.curState = nameOrObj;
		}
	};
	
	/**
	*
	*/
	public updatePlayHead(timestamp) {
		// at first push animation !!!
		if (this.SoundHandlerService.isPlaying) {
			this.$window.requestAnimationFrame(this.updatePlayHead.bind(this));
		}
		
		// do work in this animation round now
		if (this.start === null) {
			this.start = timestamp;
		}
		
		var samplesPassed = (Math.floor(timestamp - this.start) / 1000) * this.SoundHandlerService.audioBuffer.sampleRate;
		this.playHeadAnimationInfos.curS = Math.floor(this.playHeadAnimationInfos.sS + samplesPassed);
		
		if (this.SoundHandlerService.isPlaying && this.playHeadAnimationInfos.curS <= this.playHeadAnimationInfos.eS) {
			if (this.playHeadAnimationInfos.curS !== -1) {
				this.curMousePosSample = this.playHeadAnimationInfos.curS;
			}
			if (this.playHeadAnimationInfos.autoscroll && this.playHeadAnimationInfos.curS >= this.curViewPort.eS) {
				this.setViewPort(this.curViewPort.eS, this.curViewPort.eS + (this.curViewPort.eS - this.curViewPort.sS));
			}
		} else {
			this.curMousePosSample = this.playHeadAnimationInfos.endFreezeSample;
			this.playHeadAnimationInfos.sS = -1;
			this.playHeadAnimationInfos.eS = -1;
			this.playHeadAnimationInfos.curS = 0;
			this.start = null;
		}
		
		this.$rootScope.$apply();
	};
	
	/**
	*
	*/
	public animatePlayHead(startS, endS, autoscroll) {
		this.playHeadAnimationInfos.sS = startS;
		this.playHeadAnimationInfos.eS = endS;
		this.playHeadAnimationInfos.endFreezeSample = endS;
		this.playHeadAnimationInfos.curS = startS;
		if(autoscroll !== undefined){
			this.playHeadAnimationInfos.autoscroll = autoscroll;
		}
		this.$window.requestAnimationFrame(this.updatePlayHead.bind(this));
	};
	
	
	/**
	* set selected Area
	* @param start of selected Area
	* @param end of selected Area
	*/
	public select(start, end) {
		this.curViewPort.selectS = start;
		this.curViewPort.selectE = end;
		//$rootScope.$digest();
	};
	
	
	/**
	* reset selected Area to default
	*/
	public resetSelect() {
		this.curViewPort.selectS = -1;
		this.curViewPort.selectE = -1;
	};
	
	/**
	* gets the current Viewport
	*/
	public getViewPort() {
		return this.curViewPort;
	};
	
	/**
	* setspectroSettings
	*/
	public setspectroSettings(len, rfrom, rto, dyn, win, hm, preEmph, hmColorAnchors, invert) {
		this.spectroSettings.windowSizeInSecs = len;
		this.spectroSettings.rangeFrom = parseInt(rfrom, 10);
		this.spectroSettings.rangeTo = parseInt(rto, 10);
		this.spectroSettings.dynamicRange = parseInt(dyn, 10);
		this.setWindowFunction(win);
		this.spectroSettings.drawHeatMapColors = hm;
		this.spectroSettings.preEmphasisFilterFactor = preEmph;
		this.spectroSettings.heatMapColorAnchors = hmColorAnchors;
		this.spectroSettings.invert = invert;
	};
	
	/**
	* setOsciSettings
	*/
	public setOsciSettings(curCh) {
		this.osciSettings.curChannel = curCh;
	};
	
	public setHierarchySettings(curPath) {
		this.hierarchyState.path = curPath;
	}
	
	/**
	* returns current selection as array
	*/
	public getSelect() {
		return [this.curViewPort.selectS, this.curViewPort.selectE];
	};
	
	/**
	* set selected Area if new
	* start value is smaler than actual and
	* end value is greater than actual
	* @param start of selected Area
	* @param end of seleected Area
	*/
	public selectDependent(start, end) {
		if (start < this.curViewPort.selectS) {
			this.curViewPort.selectS = start;
		}
		if (end > this.curViewPort.selectE) {
			this.curViewPort.selectE = end;
		}
	};
	
	/**
	*
	*/
	public selectLevel(next, order, Levelserv) {
		var curLev;
		var now = this.getcurClickLevelName();
		if (now === undefined) {
			if (!next) {
				// select first if none prev. defined (up)
				// viewState.setcurClickLevel(levelID, levelType, scope.$index, scope.this.level.items.length);
				curLev = Levelserv.getLevelDetails(order[0]);
				if(curLev !== null) {
					this.setcurClickLevel(curLev.name, curLev.type, 0);
				}
				return;
			}
			else {
				// select last if none prev. defined (down)
				curLev = Levelserv.getLevelDetails(order[order.length - 1]);
				this.setcurClickLevel(curLev.name, curLev.type, order.length - 1);
				return;
			}
		}
		var idxOfNow = -1;
		order.forEach((name, idx) => {
			if (name === now) {
				idxOfNow = idx;
			}
		});
		if (idxOfNow === undefined) {
			curLev = Levelserv.getLevelDetails(order[0]);
			this.setcurClickLevel(curLev.name, curLev.type, 0);
			this.curClickItems = [];
			this.selectBoundary();
		}
		else {
			if (next) {
				if (idxOfNow + 1 < order.length) {
					curLev = Levelserv.getLevelDetails(order[idxOfNow + 1]);
					// this.setcurClickLevelName(order[idxOfNow + 1]);
					this.setcurClickLevel(curLev.name, curLev.type, order.idxOfNow + 1);
					this.curClickItems = [];
					this.selectBoundary();
					//this.resetSelect();
				}
			} else {
				if (idxOfNow - 1 >= 0) {
					curLev = Levelserv.getLevelDetails(order[idxOfNow - 1]);
					// this.setcurClickLevelName(order[idxOfNow - 1]);
					this.setcurClickLevel(curLev.name, curLev.type, order.idxOfNow - 1);
					this.curClickItems = [];
					this.selectBoundary();
					//this.resetSelect();
				}
			}
		}
	};
	
	
	/**
	* set the window Function for the Spectrogram
	* @param name of Window Function
	*/
	public setWindowFunction(name) {
		switch (name) {
			case 'BARTLETT':
			this.spectroSettings.window = this.myWindow.BARTLETT;
			break;
			case 'BARTLETTHANN':
			this.spectroSettings.window = this.myWindow.BARTLETTHANN;
			break;
			case 'BLACKMAN':
			this.spectroSettings.window = this.myWindow.BLACKMAN;
			break;
			case 'COSINE':
			this.spectroSettings.window = this.myWindow.COSINE;
			break;
			case 'GAUSS':
			this.spectroSettings.window = this.myWindow.GAUSS;
			break;
			case 'HAMMING':
			this.spectroSettings.window = this.myWindow.HAMMING;
			break;
			case 'HANN':
			this.spectroSettings.window = this.myWindow.HANN;
			break;
			case 'LANCZOS':
			this.spectroSettings.window = this.myWindow.LANCZOS;
			break;
			case 'RECTANGULAR':
			this.spectroSettings.window = this.myWindow.RECTANGULAR;
			break;
			case 'TRIANGULAR':
			this.spectroSettings.window = this.myWindow.TRIANGULAR;
			break;
			default:
			this.spectroSettings.window = this.myWindow.BARTLETTHANN;
			break;
		}
	};
	
	/**
	* @returns myWindow object
	*/
	public getWindowFunctions() {
		return this.myWindow;
	};
	
	/**
	* @returns myWindow object
	*/
	public getCommunicationModes() {
		return this.myMode;
	};
	
	/**
	* @returns myWindow object
	*/
	public getTimeModes() {
		return this.myTimeMode;
	};
	
	/**
	* @returns myWindow object
	*/
	public getSignalTypes() {
		return this.mySignalType;
	};
	
	/**
	* @returns myWindow object
	*/
	public getTwoDimTypes() {
		return this.myTwoDimType;
	};
	
	/**
	* set if user is dragging dragbar
	*/
	public getdragBarActive() {
		return this.curViewPort.dragBarActive;
	};
	
	
	/**
	* set if user is dragging dragbar
	*/
	public setdragBarActive(b) {
		this.curViewPort.dragBarActive = b;
	};
	
	/**
	* set if user is dragging dragbar
	*/
	public getdragBarHeight() {
		return this.curViewPort.dragBarHeight;
	};
	
	
	/**
	* set if user is dragging dragbar
	*/
	public setdragBarHeight(b) {
		this.curViewPort.dragBarHeight = b;
	};
	
	
	/**
	* get pixel position in current viewport given the canvas width
	* @param w is width of canvas
	* @param s is current sample to convert to pixel value
	*/
	public getPos(w, s) {
		return (w * (s - this.curViewPort.sS) / (this.curViewPort.eS - this.curViewPort.sS + 1)); // + 1 because of view (displays all samples in view)
	};
	
	/**
	* calculate the pixel distance between two samples
	* @param w is width of canvas
	*/
	public getSampleDist(w) {
		return this.getPos(w, this.curViewPort.sS + 1) - this.getPos(w, this.curViewPort.sS);
	};
	
	
	/**
	* toggle boolean if left submenu is open
	*/
	public toggleBundleListSideBar(time) {
        if (this.bundleListSideBarDisabled) return;
		this.bundleListSideBarOpen = !this.bundleListSideBarOpen;
		// hack to call $apply post animation
		this.$timeout(() => {
			var d = new Date();
			this.lastUpdate = d.getTime();
		}, time);
	};
	
	/**
	* get boolean if left submenu is open
	*/
	public getBundleListSideBarOpen() {
		return this.bundleListSideBarOpen;
	};
	
	/**
	* set boolean if left submenu is open
	*/
	public setBundleListSideBarOpen(s) {
        if (this.bundleListSideBarDisabled) return;
		this.bundleListSideBarOpen = s;
	};
	
	
	/**
	* get the height of the osci
	*/
	public getTransitionTime() {
		return this.TransitionTime;
	};
	
	/**
	* get the height of the osci
	*/
	public setTransitionTime(s) {
		this.TransitionTime = s;
	};
	
	/**
	* get the height of the osci
	*/
	public getPerspectivesSideBarOpen() {
		return this.rightSubmenuOpen;
	};
	
	
	/**
	* get the height of the osci
	*/
	public setPerspectivesSideBarOpen(s) {
		this.rightSubmenuOpen = s;
	};
	
	/**
	*
	*/
	public setcurClickLevel(levelID, levelType, levelIndex) {
		this.setcurClickLevelName(levelID, levelIndex);
		this.setcurClickLevelType(levelType);
	};
	
	
	/**
	* sets the current (clicked) Level Name
	* @param name is name of level
	*/
	public setcurClickLevelType(name) {
		this.curClickLevelType = name;
	};
	
	/**
	* gets the current (clicked) Level Name
	*/
	public getcurClickLevelType() {
		return this.curClickLevelType;
	};
	
	
	/**
	* sets the current (clicked) Level Name
	* @param name is name of level
	* @param index index of level
	*/
	public setcurClickLevelName(name, index) {
		this.curClickLevelName = name;
		this.curClickLevelIndex = index;
	};
	
	/**
	* gets the current (clicked) Level Name
	*/
	public getcurClickLevelName() {
		return this.curClickLevelName;
	};
	
	/**
	* gets the current (clicked) Level Name
	*/
	public getcurClickLevelIndex() {
		return this.curClickLevelIndex;
	};
	
	
	/**
	* gets the current (clicked) Level Name
	*/
	public getcurClickNeighbours() {
		return this.curClickNeighbours;
	};
	
	
	/**
	* sets the current (mousemove) Level Name
	* @param name is name of level
	*/
	public setcurMouseLevelName(name) {
		this.curMouseLevelName = name;
	};
	
	/**
	* gets the current (mousemove) Level Name
	*/
	public getcurMouseLevelName() {
		return this.curMouseLevelName;
	};
	
	
	/**
	* sets the current (mousemove) Level Name
	* @param name is name of level
	*/
	public setcurMouseLevelType(name) {
		this.curMouseLevelType = name;
	};
	
	/**
	* gets the current (mousemove) Level Name
	*/
	public getcurMouseLevelType() {
		return this.curMouseLevelType;
	};
	
	/**
	* sets the current (mousemove) Item
	* @param item Object representing the current mouse item
	* @param neighbour Objects of left and right neighbours of the current mouse item
	* @param x current horizontal mouse pointer position
	* @param isFirst true if item is the first item on current level
	* @param isLast true if item is last item on current level
	*/
	public setcurMouseItem(item, neighbour, x, isFirst, isLast) {
		this.curMouseItem = item;
		this.curMouseX = x;
		this.curMouseNeighbours = neighbour;
		this.curMouseisFirst = isFirst;
		this.curMouseisLast = isLast;
	};
	
	/**
	* Getter for current Mouse Item
	* @return Object representing the current mouse item
	*/
	public getcurMouseItem() {
		return this.curMouseItem;
	};
	
	/**
	* Getter for isFirst
	* @return true if item is first item on level
	*/
	public getcurMouseisFirst() {
		return this.curMouseisFirst;
	};
	
	/**
	* Getter for isLast
	* @return true if item is last item on level
	*/
	public getcurMouseisLast() {
		return this.curMouseisLast;
	};
	
	/**
	* Getter for current Mouse Item Neighbours (left and right)
	* @return Object representing the current mouse item neighbours
	*/
	public getcurMouseNeighbours() {
		return this.curMouseNeighbours;
	};
	
	/**
	* get all items of current level which are inside the selected viewport
	*/
	public getItemsInSelection(levelData) {
		var itemsInRange = [];
		var rangeStart = this.curViewPort.selectS;
		var rangeEnd = this.curViewPort.selectE;
		levelData.forEach((t) => {
			if (t.name === this.getcurClickLevelName()) {
				t.items.forEach((item) => {
					if (item.sampleStart >= rangeStart && (item.sampleStart + item.sampleDur) <= rangeEnd) {
						itemsInRange.push(item);
					}
					if (item.samplePoint >= rangeStart && item.samplePoint <= rangeEnd) {
						itemsInRange.push(item);
					}
				});
			}
		});
		return itemsInRange.sort(this.sortbystart);
	};
	
	
	/**
	* Setter for the current (click) Item
	* @param item Object representing the currently clicked item
	*/
	public setcurClickItem(item) {
		if (item !== null && item !== undefined) {
			this.curClickItems = [];
			this.curClickItems.push(item);
			this.selectBoundary();
		} else {
			this.curClickItems = [];
		}
	};
	
	
	/**
	* Selects the current Boundary
	*/
	public selectBoundary() {
		if (this.curClickItems.length > 0) {
			var left, right;
			if(typeof this.curClickItems[0].samplePoint === 'undefined'){
				left = this.curClickItems[0].sampleStart;
			}else{
				left = this.curClickItems[0].samplePoint;
			}
			
			if(typeof this.curClickItems[0].samplePoint === 'undefined'){
				right = this.curClickItems[this.curClickItems.length - 1].sampleStart + this.curClickItems[this.curClickItems.length - 1].sampleDur;
			}else{
				right = this.curClickItems[0].samplePoint;
			}
			
			this.curClickItems.forEach((entry) => {
				if (entry.sampleStart <= left) {
					left = entry.sampleStart;
				}
				if (entry.sampleStart + entry.sampleDur >= right) {
					right = entry.sampleStart + entry.sampleDur;
				}
			});
			this.select(left, right + 1);
		}
	};
	
	/**
	* adds an item to the currently selected items if the left or right one of current selected items
	* @param item representing the Object to be added to selection
	* @param neighbour left or right neighbor to add to selection
	*/
	public setcurClickItemMultiple(item, neighbour) {
		
		// if nothing is in curClickItems
		if (this.curClickItems.length === 0 || this.curClickItems === undefined || this.curClickItems === null) {
			this.curClickItems = [];
			this.curClickItems.push(item);
		}
		// if there is something in curClickItems
		else {
			// if item is not yet in curClickItems
			if (this.curClickItems.indexOf(item) === -1) {
				if ( this.curClickItems.indexOf(neighbour) < 0 ) {
					this.curClickItems = [];
				}
				this.curClickItems.push(item);
				this.curClickItems.sort(this.sortbystart);						
			}
			// if item is in curClickItems reset and add
			else {
				this.curClickItems = [];
				this.curClickItems.push(item);
			}
		}
	};
	
	
	/**
	*
	*/
	public sortbystart(a, b) {
		//Compare "a" and "b" in some fashion, and return -1, 0, or 1
		if (a.sampleStart > b.sampleStart || a.samplePoint > b.samplePoint) {
			return 1;
		}
		if (a.sampleStart < b.sampleStart || a.samplePoint < b.samplePoint) {
			return -1;
		}
		return 0;
	};
	
	/**
	* Getter for the current selected range in samples
	* if nothing is selected returns -1
	* @return Object with Start and End values in samples
	*/
	public getselectedRange() {
		if (this.curClickItems.length > 1) {
			return {
				start: this.curClickItems[0].sampleStart,
				end: (this.curClickItems[this.curClickItems.length - 1].sampleStart + this.curClickItems[this.curClickItems.length - 1].sampleDur)
			};
		} else if (this.curClickItems.length === 1) {
			if (this.curClickItems[0].sampleStart !== undefined) {
				return {
					start: this.curClickItems[0].sampleStart,
					end: (this.curClickItems[0].sampleStart + this.curClickItems[0].sampleDur)
				};
			} else {
				return {
					start: this.curClickItems[0].samplePoint,
					end: this.curClickItems[0].samplePoint
				};
			}
			
		} else {
			return {
				start: -1,
				end: -1
			};
		}
	};
	
	/**
	* Getter for the currently (clicked) items
	*/
	public getcurClickItems() {
		return this.curClickItems;
	};
	
	
	/**
	*
	*/
	public getselected() {
		return this.curClickItems;
	};
	
	/**
	*
	*/
	public isEditing() {
		return this.editing;
	};
	
	/**
	*
	*/
	public setEditing(n) {
		this.editing = n;
	};
	
	/**
	*
	*/
	public getLasPcm() {
		return this.lastPcm;
	};
	
	/**
	*
	*/
	public setLastPcm(n) {
		this.lastPcm = n;
	};
	
	
	/**
	*
	*/
	public getcursorInTextField() {
		return this.cursorInTextField;
	};
	
	/**
	*
	*/
	public setcursorInTextField(n) {
		this.cursorInTextField = n;
	};
	
	/**
	*
	*/
	public isSavingAllowed() {
		return this.saving;
	};
	
	/**
	*
	*/
	public setSavingAllowed(n) {
		this.saving = n;
	};
	
	/**
	*
	*/
	public countSelected() {
		return this.curClickItems.length;
	};
	
	/**
	*
	*/
	public getCurrentSample(perc) {
		return this.curViewPort.sS + (this.curViewPort.eS - this.curViewPort.sS) * perc;
	};
	
	/**
	*
	*/
	public getCurrentPercent(sample) {
		return (sample * (100 / (this.curViewPort.eS - this.curViewPort.sS) / 100));
	};
	
	/**
	*
	*/
	public getSamplesPerPixelVal(event) {
		var start = parseFloat(this.curViewPort.sS);
		var end = parseFloat(this.curViewPort.eS);
		return (end - start) / event.originalEvent.target.width;
	};
	
	
	/**
	* calcs and returns start in secs
	*/
	public getViewPortStartTime() {
		return (this.curViewPort.sS / this.SoundHandlerService.audioBuffer.sampleRate) - 0.5 / this.SoundHandlerService.audioBuffer.sampleRate;
	};
	
	/**
	* calcs and returns end time in secs
	*/
	public getViewPortEndTime() {
		return (this.curViewPort.eS / this.SoundHandlerService.audioBuffer.sampleRate) + 0.5 / this.SoundHandlerService.audioBuffer.sampleRate;
	};
	
	/**
	* calcs and returns start in secs
	*/
	public getSelectedStartTime() {
		return (this.curViewPort.selectS / this.SoundHandlerService.audioBuffer.sampleRate) - 0.5 / this.SoundHandlerService.audioBuffer.sampleRate;
	};
	
	/**
	* calcs and returns end time in secs
	*/
	public getSelectedEndTime() {
		return (this.curViewPort.selectE / this.SoundHandlerService.audioBuffer.sampleRate) + 0.5 / this.SoundHandlerService.audioBuffer.sampleRate;
	};
	
	/**
	* calcs sample time in seconds
	*/
	public calcSampleTime(sample) {
		return (sample / this.SoundHandlerService.audioBuffer.sampleRate) + 0.5 / this.SoundHandlerService.audioBuffer.sampleRate;
	};
	
	
	/**
	* set view port to start and end sample
	* (with several out-of-bounds like checks)
	*
	* @param sSample start sample of view
	* @param eSample end sample of view
	*/
	public setViewPort(sSample, eSample) {
		var oldStart = this.curViewPort.sS;
		var oldEnd = this.curViewPort.eS;
		if (sSample !== undefined) {
			this.curViewPort.sS = Math.round(sSample);
		}
		if (eSample !== undefined) {
			this.curViewPort.eS = Math.round(eSample);
		}
		
		// check if moving left or right is not out of bounds -> prevent zooming on edge when moving left/right
		if (oldStart > this.curViewPort.sS && oldEnd > this.curViewPort.eS) {
			//moved left
			if (this.curViewPort.sS < 0) {
				this.curViewPort.sS = 0;
				this.curViewPort.eS = oldEnd + Math.abs(this.curViewPort.sS);
			}
		}
		if (oldStart < this.curViewPort.sS && oldEnd < this.curViewPort.eS) {
			//moved right
			if (this.curViewPort.eS > this.SoundHandlerService.audioBuffer.length) {
				this.curViewPort.sS = oldStart;
				this.curViewPort.eS = this.SoundHandlerService.audioBuffer.length;
			}
		}
		
		// check if in range
		if (this.curViewPort.sS < 0) {
			this.curViewPort.sS = 0;
		}
		if (this.curViewPort.eS > this.SoundHandlerService.audioBuffer.length) {
			this.curViewPort.eS = this.SoundHandlerService.audioBuffer.length;
		}
		// check if at least 4 samples are showing (fixed max zoom size)
		if (this.curViewPort.eS - this.curViewPort.sS < 4) {
			this.curViewPort.sS = oldStart;
			this.curViewPort.eS = oldEnd;
		}
		
	};
	
	
	/**
	* set view port to start and end sample
	* (with several out-of-bounds like checks)
	*
	* @param zoomIn bool to specify zooming direction
	* if set to true -> zoom in
	* if set to false -> zoom out
	* @param LevelService pass in LevelService to avoid circular dependencies
	*/
	public zoomViewPort(zoomIn, LevelService) {
		var newStartS, newEndS, curMouseMoveItemStart;
		var seg = this.getcurMouseItem();
		var d = this.curViewPort.eS - this.curViewPort.sS;
		
		var isLastSeg = false;
		
		if (seg !== undefined) {
			if (this.getcurMouseisFirst()) { // before first element
				seg = LevelService.getItemDetails(this.getcurMouseLevelName(), 0);
			} else if (this.getcurMouseisLast()) {
				seg = LevelService.getLastItem(this.getcurMouseLevelName());
				isLastSeg = true;
			}
			if (this.getcurMouseLevelType() === 'SEGMENT') {
				if (isLastSeg) {
					curMouseMoveItemStart = seg.sampleStart + seg.sampleDur;
				} else {
					curMouseMoveItemStart = seg.sampleStart;
				}
			} else {
				curMouseMoveItemStart = seg.samplePoint;
			}
			var d1 = curMouseMoveItemStart - this.curViewPort.sS;
			var d2 = this.curViewPort.eS - curMouseMoveItemStart;
			
			if (zoomIn) {
				newStartS = this.curViewPort.sS + d1 * 0.5;
				newEndS = this.curViewPort.eS - d2 * 0.5;
			} else {
				newStartS = this.curViewPort.sS - d1 * 0.5;
				newEndS = this.curViewPort.eS + d2 * 0.5;
			}
		} else {
			if (zoomIn) {
				newStartS = this.curViewPort.sS + ~~(d / 4);
				newEndS = this.curViewPort.eS - ~~(d / 4);
			} else {
				newStartS = this.curViewPort.sS - ~~(d / 4);
				newEndS = this.curViewPort.eS + ~~(d / 4);
				
			}
			
		}
		this.setViewPort(newStartS, newEndS);
	};
	
	/**
	* moves view port to the right or to the left
	* without changing the zoom
	*
	* @param shiftRight bool to specify direction
	* if set to true -> shift right
	* if set to false -> shift left
	*/
	public shiftViewPort(shiftRight) {
		// my.removeLabelDoubleClick();
		var newStartS, newEndS;
		if (shiftRight) {
			newStartS = this.curViewPort.sS + ~~((this.curViewPort.eS - this.curViewPort.sS) / 4);
			newEndS = this.curViewPort.eS + ~~((this.curViewPort.eS - this.curViewPort.sS) / 4);
		} else {
			newStartS = this.curViewPort.sS - ~~((this.curViewPort.eS - this.curViewPort.sS) / 4);
			newEndS = this.curViewPort.eS - ~~((this.curViewPort.eS - this.curViewPort.sS) / 4);
		}
		
		this.setViewPort(newStartS, newEndS);
	};
	
	
	/**
	* sets all the curLevelAttrDefs array
	* to hold the default attr. definitions
	* which are the same as the level names
	*
	* @param levelDefs level definitions from the DBconfig
	*/
	public setCurLevelAttrDefs(levelDefs) {
		levelDefs.forEach((ld) => {
			this.curLevelAttrDefs.push({
				'levelName': ld.name,
				'curAttrDefName': ld.name
			});
		});
	};
	
	/**
	* set the current attribute definition name of the
	* given levelName
	*
	* @param levelName name of level
	* @param newAttrDefName
	* @param index index of attribute
	*/
	public setCurAttrDef(levelName, newAttrDefName, index) {
		this.curLevelAttrDefs.forEach((ad) => {
			if (ad.levelName === levelName) {
				ad.curAttrDefName = newAttrDefName;
				ad.curAttrDefIndex = index;
			}
		});
	};
	
	/**
	* get the current attribute definition name of the
	* given levelName
	*
	* @param levelName name of level
	* @returns attrDefName
	*/
	public getCurAttrDef(levelName) {
		var curAttrDef;
		this.curLevelAttrDefs.forEach((ad) => {
			if (ad.levelName === levelName) {
				curAttrDef = ad.curAttrDefName;
			}
		});
		return curAttrDef;
	};
	
	/**
	* get the current attribute definition index of the
	* given levelName
	*
	* @param levelName name of level
	* @returns attrDefName
	*/
	public getCurAttrIndex(levelName) {
		var curAttrDef;
		this.curLevelAttrDefs.forEach((ad) => {
			if (ad.levelName === levelName) {
				if (ad.curAttrDefIndex === undefined) {
					curAttrDef = 0;
				} else {
					curAttrDef = ad.curAttrDefIndex;
				}
			}
		});
		return curAttrDef;
	};
	
	public setlastKeyCode(e) {
		this.lastKeyCode = e;
	};
	
	/**
	*
	*/
	public getX(e) {
		return (e.offsetX || e.originalEvent.layerX) * (e.originalEvent.target.width / e.originalEvent.target.clientWidth);
	};
	
	/**
	*
	*/
	public getY(e) {
		return (e.offsetY || e.originalEvent.layerY) * (e.originalEvent.target.height / e.originalEvent.target.clientHeight);
	};
	
	/**
	*
	*/
	public resetToInitState() {
		this.initialize();
	};
	
	/**
	*
	*/
	public getColorOfAnchor(val, anchorNr) {
		var curStyle = {
			'background-color': 'rgb(' + val[anchorNr][0] + ',' + val[anchorNr][1] + ',' + val[anchorNr][2] + ')',
			'width': '10px',
			'height': '10px'
		};
		return (curStyle);
	};
	
	public numberOfPages(sessionLength) {
		return Math.ceil(sessionLength / this.pageSize);
	};
	
	public switchPerspective(index, allPerspectives) {
		// @ todo check permission/state machine
		if (allPerspectives.length > index) {
			this.curPerspectiveIdx = index;
		}
	};
	
}

angular.module('emuwebApp')
.service('ViewStateService', ['$rootScope', '$timeout', '$window', 'SoundHandlerService', 'DataService', 'StandardFuncsService', ViewStateService]);
