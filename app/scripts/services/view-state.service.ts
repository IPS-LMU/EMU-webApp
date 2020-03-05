import * as angular from 'angular';

angular.module('emuwebApp')
	.service('viewState', function ($rootScope, $timeout, $window, Soundhandlerservice, DataService, StandardFuncsService) {

		// window functions enum for spectro
		var myWindow = {
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
		var myMode = {
			DEMO: 1,
			WS: 2,
			EMBEDDED: 3
		};

		// time modes enum
		var myTimeMode = {
			absolute: 1,
			relative: 2
		};

		// signal types enum
		var mySignalType = {
			OSCI: 1,
			SPEC: 2
		};

		// twoDim types enum
		var myTwoDimType = {
			DOTS: 1,
			EPG: 2
		};

		// hold the current attribute definitions that are in view
		this.curLevelAttrDefs = [];

		/**
		 * initialize all needed vars in viewState
		 */
		this.initialize = function () {
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
				rotated: false,
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
						StandardFuncsService.traverseAndClean (DataService.getData());
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

			this.timelineSize = -1;
			this.somethingInProgress = false;
			this.somethingInProgressTxt = '';
			this.historyActionTxt = '';
			this.editing = false;
			this.cursorInTextField = false;
			this.saving = true;
			this.bundleListSideBarOpen = false;
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
			this.focusOnEmuWebApp = true;
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
		};

		// initialize on init
		this.initialize();

		/**
		 * function to ask permission in current labeler state
		 */
		this.getPermission = function (actionName) {
			return (this.curState.permittedActions.indexOf(actionName) > -1);
		};

		/**
		 *
		 */
		this.setWindowWidth = function (b) {
			this.curViewPort.windowWidth = b;
		};

		/**
		 * set state
		 */
		this.setState = function (nameOrObj) {
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
		this.updatePlayHead = function (timestamp) {
			// at first push animation !!!
			if (Soundhandlerservice.isPlaying) {
				$window.requestAnimationFrame(this.updatePlayHead);
			}

			// do work in this animation round now
			if (this.start === null) {
				this.start = timestamp;
			}

			var samplesPassed = (Math.floor(timestamp - this.start) / 1000) * Soundhandlerservice.audioBuffer.sampleRate;
			this.playHeadAnimationInfos.curS = Math.floor(this.playHeadAnimationInfos.sS + samplesPassed);

			if (Soundhandlerservice.isPlaying && this.playHeadAnimationInfos.curS <= this.playHeadAnimationInfos.eS) {
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
			
			$rootScope.$apply();
		};

		/**
		 *
		 */
		this.animatePlayHead = function (startS, endS, autoscroll) {
			this.playHeadAnimationInfos.sS = startS;
			this.playHeadAnimationInfos.eS = endS;
			this.playHeadAnimationInfos.endFreezeSample = endS;
			this.playHeadAnimationInfos.curS = startS;
            if(autoscroll !== undefined){
                this.playHeadAnimationInfos.autoscroll = autoscroll;
            }
            $window.requestAnimationFrame(this.updatePlayHead);
		};


		/**
		 * set selected Area
		 * @param start of selected Area
		 * @param end of selected Area
		 */
		this.select = function (start, end) {
			this.curViewPort.selectS = start;
			this.curViewPort.selectE = end;
			//$rootScope.$digest();
		};


		/**
		 * reset selected Area to default
		 */
		this.resetSelect = function () {
			this.curViewPort.selectS = -1;
			this.curViewPort.selectE = -1;
		};

		/**
		 * gets the current Viewport
		 */
		this.getViewPort = function () {
			return this.curViewPort;
		};

		/**
		 * setspectroSettings
		 */
		this.setspectroSettings = function (len, rfrom, rto, dyn, win, hm, preEmph, hmColorAnchors, invert) {
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
		this.setOsciSettings = function (curCh) {
			this.osciSettings.curChannel = curCh;
		};


		/**
		 * returns current selection as array
		 */
		this.getSelect = function () {
			return [this.curViewPort.selectS, this.curViewPort.selectE];
		};

		/**
		 * set selected Area if new
		 * start value is smaler than actual and
		 * end value is greater than actual
		 * @param start of selected Area
		 * @param end of seleected Area
		 */
		this.selectDependent = function (start, end) {
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
		this.selectLevel = function (next, order, Levelserv) {
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
		this.setWindowFunction = function (name) {
			switch (name) {
				case 'BARTLETT':
					this.spectroSettings.window = myWindow.BARTLETT;
					break;
				case 'BARTLETTHANN':
					this.spectroSettings.window = myWindow.BARTLETTHANN;
					break;
				case 'BLACKMAN':
					this.spectroSettings.window = myWindow.BLACKMAN;
					break;
				case 'COSINE':
					this.spectroSettings.window = myWindow.COSINE;
					break;
				case 'GAUSS':
					this.spectroSettings.window = myWindow.GAUSS;
					break;
				case 'HAMMING':
					this.spectroSettings.window = myWindow.HAMMING;
					break;
				case 'HANN':
					this.spectroSettings.window = myWindow.HANN;
					break;
				case 'LANCZOS':
					this.spectroSettings.window = myWindow.LANCZOS;
					break;
				case 'RECTANGULAR':
					this.spectroSettings.window = myWindow.RECTANGULAR;
					break;
				case 'TRIANGULAR':
					this.spectroSettings.window = myWindow.TRIANGULAR;
					break;
				default:
					this.spectroSettings.window = myWindow.BARTLETTHANN;
					break;
			}
		};

		/**
		 * @returns myWindow object
		 */
		this.getWindowFunctions = function () {
			return myWindow;
		};

		/**
		 * @returns myWindow object
		 */
		this.getCommunicationModes = function () {
			return myMode;
		};

		/**
		 * @returns myWindow object
		 */
		this.getTimeModes = function () {
			return myTimeMode;
		};

		/**
		 * @returns myWindow object
		 */
		this.getSignalTypes = function () {
			return mySignalType;
		};

		/**
		 * @returns myWindow object
		 */
		this.getTwoDimTypes = function () {
			return myTwoDimType;
		};

		/**
		 * set if user is dragging dragbar
		 */
		this.getdragBarActive = function () {
			return this.curViewPort.dragBarActive;
		};


		/**
		 * set if user is dragging dragbar
		 */
		this.setdragBarActive = function (b) {
			this.curViewPort.dragBarActive = b;
		};

		/**
		 * set if user is dragging dragbar
		 */
		this.getdragBarHeight = function () {
			return this.curViewPort.dragBarHeight;
		};


		/**
		 * set if user is dragging dragbar
		 */
		this.setdragBarHeight = function (b) {
			this.curViewPort.dragBarHeight = b;
		};


		/**
		 * get pixel position in current viewport given the canvas width
		 * @param w is width of canvas
		 * @param s is current sample to convert to pixel value
		 */
		this.getPos = function (w, s) {
			return (w * (s - this.curViewPort.sS) / (this.curViewPort.eS - this.curViewPort.sS + 1)); // + 1 because of view (displays all samples in view)
		};

		/**
		 * calculate the pixel distance between two samples
		 * @param w is width of canvas
		 */
		this.getSampleDist = function (w) {
			return this.getPos(w, this.curViewPort.sS + 1) - this.getPos(w, this.curViewPort.sS);
		};


		/**
		 * toggle boolean if left submenu is open
		 */
		this.toggleBundleListSideBar = function (time) {
			this.bundleListSideBarOpen = !this.bundleListSideBarOpen;
			// hack to call $apply post animation
			$timeout(() => {
				var d = new Date();
				this.lastUpdate = d.getTime();
			}, time);
		};

		/**
		 * get boolean if left submenu is open
		 */
		this.getBundleListSideBarOpen = function () {
			return this.bundleListSideBarOpen;
		};

		/**
		 * set boolean if left submenu is open
		 */
		this.setBundleListSideBarOpen = function (s) {
			this.bundleListSideBarOpen = s;
		};


		/**
		 * get the height of the osci
		 */
		this.setenlarge = function (s) {
			this.timelineSize = s;
		};


		/**
		 * get the height of the osci
		 */
		this.getenlarge = function () {
			return this.timelineSize;
		};

		/**
		 * get the height of the osci
		 */
		this.getTransitionTime = function () {
			return this.TransitionTime;
		};

		/**
		 * get the height of the osci
		 */
		this.setTransitionTime = function (s) {
			this.TransitionTime = s;
		};

		/**
		 * get the height of the osci
		 */
		this.getPerspectivesSideBarOpen = function () {
			return this.rightSubmenuOpen;
		};


		/**
		 * get the height of the osci
		 */
		this.setPerspectivesSideBarOpen = function (s) {
			this.rightSubmenuOpen = s;
		};

		/**
		 *
		 */
		this.setcurClickLevel = function (levelID, levelType, levelIndex) {
			this.setcurClickLevelName(levelID, levelIndex);
			this.setcurClickLevelType(levelType);
		};


		/**
		 * sets the current (clicked) Level Name
		 * @param name is name of level
		 */
		this.setcurClickLevelType = function (name) {
			this.curClickLevelType = name;
		};

		/**
		 * gets the current (clicked) Level Name
		 */
		this.getcurClickLevelType = function () {
			return this.curClickLevelType;
		};


		/**
		 * sets the current (clicked) Level Name
		 * @param name is name of level
		 * @param index index of level
		 */
		this.setcurClickLevelName = function (name, index) {
			this.curClickLevelName = name;
			this.curClickLevelIndex = index;
		};

		/**
		 * gets the current (clicked) Level Name
		 */
		this.getcurClickLevelName = function () {
			return this.curClickLevelName;
		};

		/**
		 * gets the current (clicked) Level Name
		 */
		this.getcurClickLevelIndex = function () {
			return this.curClickLevelIndex;
		};


		/**
		 * gets the current (clicked) Level Name
		 */
		this.getcurClickNeighbours = function () {
			return this.curClickNeighbours;
		};


		/**
		 * sets the current (mousemove) Level Name
		 * @param name is name of level
		 */
		this.setcurMouseLevelName = function (name) {
			this.curMouseLevelName = name;
		};

		/**
		 * gets the current (mousemove) Level Name
		 */
		this.getcurMouseLevelName = function () {
			return this.curMouseLevelName;
		};


		/**
		 * sets the current (mousemove) Level Name
		 * @param name is name of level
		 */
		this.setcurMouseLevelType = function (name) {
			this.curMouseLevelType = name;
		};

		/**
		 * gets the current (mousemove) Level Name
		 */
		this.getcurMouseLevelType = function () {
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
		this.setcurMouseItem = function (item, neighbour, x, isFirst, isLast) {
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
		this.getcurMouseItem = function () {
			return this.curMouseItem;
		};

		/**
		 * Getter for isFirst
		 * @return true if item is first item on level
		 */
		this.getcurMouseisFirst = function () {
			return this.curMouseisFirst;
		};

		/**
		 * Getter for isLast
		 * @return true if item is last item on level
		 */
		this.getcurMouseisLast = function () {
			return this.curMouseisLast;
		};

		/**
		 * Getter for current Mouse Item Neighbours (left and right)
		 * @return Object representing the current mouse item neighbours
		 */
		this.getcurMouseNeighbours = function () {
			return this.curMouseNeighbours;
		};

		/**
		 * get all items of current level which are inside the selected viewport
		 */
		this.getItemsInSelection = function (levelData) {
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
		this.setcurClickItem = function (item) {
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
		this.selectBoundary = function () {
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
		this.setcurClickItemMultiple = function (item, neighbour) {

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
		this.sortbystart = function (a, b) {
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
		this.getselectedRange = function () {
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
		this.getcurClickItems = function () {
			return this.curClickItems;
		};


		/**
		 *
		 */
		this.getselected = function () {
			return this.curClickItems;
		};

		/**
		 *
		 */
		this.isEditing = function () {
			return this.editing;
		};

		/**
		 *
		 */
		this.setEditing = function (n) {
			this.editing = n;
		};

		/**
		 *
		 */
		this.getLasPcm = function () {
			return this.lastPcm;
		};

		/**
		 *
		 */
		this.setLastPcm = function (n) {
			this.lastPcm = n;
		};


		/**
		 *
		 */
		this.getcursorInTextField = function () {
			return this.cursorInTextField;
		};

		/**
		 *
		 */
		this.setcursorInTextField = function (n) {
			this.cursorInTextField = n;
		};

		/**
		 *
		 */
		this.isSavingAllowed = function () {
			return this.saving;
		};

		/**
		 *
		 */
		this.setSavingAllowed = function (n) {
			this.saving = n;
		};

		/**
		 *
		 */
		this.countSelected = function () {
			return this.curClickItems.length;
		};

		/**
		 *
		 */
		this.getCurrentSample = function (perc) {
			return this.curViewPort.sS + (this.curViewPort.eS - this.curViewPort.sS) * perc;
		};

		/**
		 *
		 */
		this.getCurrentPercent = function (sample) {
			return (sample * (100 / (this.curViewPort.eS - this.curViewPort.sS) / 100));
		};

		/**
		 *
		 */
		this.getSamplesPerPixelVal = function (event) {
			var start = parseFloat(this.curViewPort.sS);
			var end = parseFloat(this.curViewPort.eS);
			return (end - start) / event.originalEvent.target.width;
		};


		/**
		 * calcs and returns start in secs
		 */
		this.getViewPortStartTime = function () {
			return (this.curViewPort.sS / Soundhandlerservice.audioBuffer.sampleRate) - 0.5 / Soundhandlerservice.audioBuffer.sampleRate;
		};

		/**
		 * calcs and returns end time in secs
		 */
		this.getViewPortEndTime = function () {
			return (this.curViewPort.eS / Soundhandlerservice.audioBuffer.sampleRate) + 0.5 / Soundhandlerservice.audioBuffer.sampleRate;
		};

		/**
		 * calcs and returns start in secs
		 */
		this.getSelectedStartTime = function () {
			return (this.curViewPort.selectS / Soundhandlerservice.audioBuffer.sampleRate) - 0.5 / Soundhandlerservice.audioBuffer.sampleRate;
		};

		/**
		 * calcs and returns end time in secs
		 */
		this.getSelectedEndTime = function () {
			return (this.curViewPort.selectE / Soundhandlerservice.audioBuffer.sampleRate) + 0.5 / Soundhandlerservice.audioBuffer.sampleRate;
		};

		/**
		 * calcs sample time in seconds
		 */
		this.calcSampleTime = function (sample) {
			return (sample / Soundhandlerservice.audioBuffer.sampleRate) + 0.5 / Soundhandlerservice.audioBuffer.sampleRate;
		};


		/**
		 * set view port to start and end sample
		 * (with several out-of-bounds like checks)
		 *
		 * @param sSample start sample of view
		 * @param eSample end sample of view
		 */
		this.setViewPort = function (sSample, eSample) {
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
				if (this.curViewPort.eS > Soundhandlerservice.audioBuffer.length) {
					this.curViewPort.sS = oldStart;
					this.curViewPort.eS = Soundhandlerservice.audioBuffer.length;
				}
			}

			// check if in range
			if (this.curViewPort.sS < 0) {
				this.curViewPort.sS = 0;
			}
			if (this.curViewPort.eS > Soundhandlerservice.audioBuffer.length) {
				this.curViewPort.eS = Soundhandlerservice.audioBuffer.length;
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
		this.zoomViewPort = function (zoomIn, LevelService) {
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
		this.shiftViewPort = function (shiftRight) {
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
		this.setCurLevelAttrDefs = function (levelDefs) {
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
		this.setCurAttrDef = function (levelName, newAttrDefName, index) {
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
		this.getCurAttrDef = function (levelName) {
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
		this.getCurAttrIndex = function (levelName) {
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

		this.setlastKeyCode = function (e) {
			this.lastKeyCode = e;
		};

		/**
		 *
		 */
		this.getX = function (e) {
			return (e.offsetX || e.originalEvent.layerX) * (e.originalEvent.target.width / e.originalEvent.target.clientWidth);
		};

		/**
		 *
		 */
		this.getY = function (e) {
			return (e.offsetY || e.originalEvent.layerY) * (e.originalEvent.target.height / e.originalEvent.target.clientHeight);
		};

		/**
		 *
		 */
		this.resetToInitState = function () {
			this.initialize();
		};

		/**
		 *
		 */
		this.getColorOfAnchor = function (val, anchorNr) {
			var curStyle = {
				'background-color': 'rgb(' + val[anchorNr][0] + ',' + val[anchorNr][1] + ',' + val[anchorNr][2] + ')',
				'width': '10px',
				'height': '10px'
			};
			return (curStyle);
		};
		
		this.numberOfPages = function (sessionLength) {
			return Math.ceil(sessionLength / this.pageSize);
		};

		this.switchPerspective = function (index, allPerspectives) {
		    // @ todo check permission/state machine
            if (allPerspectives.length > index) {
				this.curPerspectiveIdx = index;
            }
		};

	});
