'use strict';

angular.module('emuwebApp')
  .factory('viewState', function ($rootScope, $timeout, $window, Soundhandlerservice, DataService, StandardFuncsService) {

    //shared service object to be returned
    var sServObj = {};

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

    // hold the current attribute definitions that are in view
    sServObj.curLevelAttrDefs = [];

    /**
     * initialize all needed vars in viewState
     */
    sServObj.initialize = function () {
      sServObj.curViewPort = {
        sS: 0,
        eS: 0,
        selectS: -1,
        selectE: -1,
        dragBarActive: false,
        dragBarHeight: -1,
        windowWidth: undefined,
      };

      sServObj.spectroSettings = {
        windowSizeInSecs: -1,
        rangeFrom: -1,
        rangeTo: -1,
        dynamicRange: -1,
        window: -1,
        drawHeatMapColors: -1,
        preEmphasisFilterFactor: -1
      };

      sServObj.playHeadAnimationInfos = {
        sS: -1,
        eS: -1,
        curS: null,
        endFreezeSample: -1
      };

      //
      sServObj.hierarchyState = {
      	// These variables will be set from within the emuhierarchy directive
	// The directive will not watch for outside changes
      	selectedItemID: undefined,
	selectedLinkFromID: undefined,
	selectedLinkToID: undefined,
	editValue: undefined,
	inputFocus: false,
	collapseInfo: {},

	// These can be set from within the emuhierarchy directive
	// But the directive will also watch for outside changes
	contextMenuID: undefined,
	newLinkFromID: undefined,

	// These will be set by outside components
	path: [],
	rotated: false,
	playing: 0
      };

      sServObj.timelineSize = -1;
      sServObj.somethingInProgress = false;
      sServObj.somethingInProgressTxt = '';
      sServObj.historyActionTxt = '';
      sServObj.editing = false;
      sServObj.cursorInTextField = false;
      sServObj.saving = true;
      sServObj.hierarchyShown = false;
      sServObj.submenuOpen = false;
      sServObj.rightSubmenuOpen = false;
      sServObj.curClickItems = [];
      sServObj.curMousePosSample = 0;
      sServObj.curMouseLevelName = undefined;
      sServObj.curMouseLevelType = undefined;
      sServObj.curClickLevelName = undefined;
      sServObj.curClickLevelType = undefined;
      sServObj.lastPcm = undefined;
      sServObj.curPreselColumnSample = 2;
      sServObj.curCorrectionToolNr = undefined;
      sServObj.curClickLevelIndex = undefined;
      sServObj.start = null;
      sServObj.TransitionTime = undefined;
      sServObj.showDropZone = true;
      sServObj.movingBoundary = false;
      sServObj.movingBoundarySample = undefined;
      sServObj.focusInTextField = false;
      sServObj.curTaskPercCompl = 0;
      sServObj.curPerspectiveIdx = -1;
      sServObj.mouseInEmuWebApp = false;
      sServObj.lastKeyCode = undefined;
      // possible general states of state machine
      sServObj.states = [];
      sServObj.states.noDBorFilesloaded = {
        'permittedActions': ['connectBtnClick', 'openDemoBtnDBclick']
      };
      sServObj.states.loadingSaving = {
        'permittedActions': []
      };
      sServObj.states.labeling = {
        'permittedActions': ['zoom', 'playaudio', 'spectSettingsChange', 'addLevelSegBtnClick', 'addLevelPointBtnClick', 'renameSelLevelBtnClick', 'downloadTextGridBtnClick', 'downloadAnnotationBtnClick', 'spectSettingsChange', 'clearBtnClick', 'labelAction', 'toggleSideBars', 'saveBndlBtnClick', 'showHierarchyBtnClick', 'editDBconfigBtnClick']
      };
      sServObj.states.modalShowing = sServObj.states.loadingSaving;
      sServObj.prevState = sServObj.states.noDBorFilesloaded;
      sServObj.curState = sServObj.states.noDBorFilesloaded;

      sServObj.curLevelAttrDefs = [];
    };

    // initialize on init
    sServObj.initialize();

    /**
     * function to ask permission in current labeler state
     */
    sServObj.getPermission = function (actionName) {
      return (sServObj.curState.permittedActions.indexOf(actionName) > -1);
    };

    /**
     *
     */
    sServObj.setWindowWidth = function (b) {
      this.curViewPort.windowWidth = b;
    };

    /**
     * set state
     */
    sServObj.setState = function (nameOrObj) {
      sServObj.prevState = sServObj.curState;
      if (typeof nameOrObj === 'string') {
        sServObj.curState = sServObj.states[nameOrObj];
      } else {
        sServObj.curState = nameOrObj;
      }
    };

    /**
     *
     */
    sServObj.updatePlayHead = function (timestamp) {
      // at first push animation !!!
      if (Soundhandlerservice.player.isPlaying) {
        $window.requestAnimationFrame(sServObj.updatePlayHead);
      }

      // do work in this animation round now
      if (sServObj.start === null) {
        sServObj.start = timestamp;
      }

      var samplesPassed = (Math.floor(timestamp - sServObj.start) / 1000) * Soundhandlerservice.wavJSO.SampleRate;
      sServObj.playHeadAnimationInfos.curS = Math.floor(sServObj.playHeadAnimationInfos.sS + samplesPassed);

      if (Soundhandlerservice.player.isPlaying && sServObj.playHeadAnimationInfos.curS <= sServObj.playHeadAnimationInfos.eS) {
        if (sServObj.playHeadAnimationInfos.curS !== -1) {
          sServObj.curMousePosSample = sServObj.playHeadAnimationInfos.curS;
        }
        $rootScope.$apply();
      } else {
        sServObj.curMousePosSample = sServObj.playHeadAnimationInfos.endFreezeSample;
        sServObj.playHeadAnimationInfos.sS = -1;
        sServObj.playHeadAnimationInfos.eS = -1;
        sServObj.playHeadAnimationInfos.curS = 0;
        sServObj.start = null;
      }
    };

    /**
     *
     */
    sServObj.animatePlayHead = function (startS, endS) {
      sServObj.playHeadAnimationInfos.sS = startS;
      sServObj.playHeadAnimationInfos.eS = endS;
      sServObj.playHeadAnimationInfos.endFreezeSample = endS;
      sServObj.playHeadAnimationInfos.curS = startS;
      $window.requestAnimationFrame(sServObj.updatePlayHead);
    };


    /**
     * set selected Area
     * @param start of selected Area
     * @param end of selected Area
     */
    sServObj.select = function (start, end) {
      sServObj.curViewPort.selectS = start;
      sServObj.curViewPort.selectE = end;
      //$rootScope.$digest();
    };


    /**
     * reset selected Area to default
     * @param length of current pcm stream
     */
    sServObj.resetSelect = function () {
      sServObj.curViewPort.selectS = -1;
      sServObj.curViewPort.selectE = -1;
    };

    /**
     * gets the current Viewport
     */
    sServObj.getViewPort = function () {
      return sServObj.curViewPort;
    };

    /**
     * setspectroSettings
     */
    sServObj.setspectroSettings = function (len, rfrom, rto, dyn, win, hm, preEmph, hmColorAnchors) {
      sServObj.spectroSettings.windowSizeInSecs = len;
      sServObj.spectroSettings.rangeFrom = parseInt(rfrom, 10);
      sServObj.spectroSettings.rangeTo = parseInt(rto, 10);
      sServObj.spectroSettings.dynamicRange = parseInt(dyn, 10);
      sServObj.setWindowFunction(win);
      sServObj.spectroSettings.drawHeatMapColors = hm;
      sServObj.spectroSettings.preEmphasisFilterFactor = preEmph;
      sServObj.spectroSettings.heatMapColorAnchors = hmColorAnchors;
    };


    /**
     * returns current selection as array
     */
    sServObj.getSelect = function () {
      return [sServObj.curViewPort.selectS, sServObj.curViewPort.selectE];
    };

    /**
     * set selected Area if new
     * start value is smaler than actual and
     * end value is greater than actual
     * @param start of selected Area
     * @param end of seleected Area
     */
    sServObj.selectDependent = function (start, end) {
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
    sServObj.selectLevel = function (next, order, Levelserv) {
      var curLev;
      var now = sServObj.getcurClickLevelName();
      if (now === undefined && !next) {
        // select first if none prev. defined (up)
        // viewState.setcurClickLevel(levelID, levelType, scope.$index, scope.this.level.items.length);
        curLev = Levelserv.getLevelDetails(order[0]);
        sServObj.setcurClickLevel(curLev.level.name, curLev.level.type, 0);
        return;
      } else if (now === undefined && next) {
        // select last if none prev. defined (down)
        curLev = Levelserv.getLevelDetails(order[order.length - 1]);
        sServObj.setcurClickLevel(curLev.level.name, curLev.level.type, order.length - 1);
        return;
      }

      var idxOfNow;
      order.forEach(function (name, idx) {
        if (name === now) {
          idxOfNow = idx;
        }
      });
      if(idxOfNow === undefined) {
		  curLev = Levelserv.getLevelDetails(order[0]);
		  // sServObj.setcurClickLevelName(order[idxOfNow + 1]);
		  sServObj.setcurClickLevel(curLev.level.name, curLev.level.type, 0);
		  sServObj.curClickItems = [];
		  sServObj.selectBoundary();
      }
      else {
		  if (next) {
			if (idxOfNow + 1 < order.length) {
			  curLev = Levelserv.getLevelDetails(order[idxOfNow + 1]);
			  // sServObj.setcurClickLevelName(order[idxOfNow + 1]);
			  sServObj.setcurClickLevel(curLev.level.name, curLev.level.type, order.idxOfNow + 1);
			  sServObj.curClickItems = [];
			  sServObj.selectBoundary();
			  //sServObj.resetSelect();
			}
		  } else {
			if (idxOfNow - 1 >= 0) {
			  curLev = Levelserv.getLevelDetails(order[idxOfNow - 1]);
			  // sServObj.setcurClickLevelName(order[idxOfNow - 1]);
			  sServObj.setcurClickLevel(curLev.level.name, curLev.level.type, order.idxOfNow - 1);
			  sServObj.curClickItems = [];
			  sServObj.selectBoundary();
			  //sServObj.resetSelect();
			}
		  }
		}
    };


    /**
     * set the window Function for the Spectrogram
     * @param name of Window Function
     */
    sServObj.setWindowFunction = function (name) {
      switch (name) {
      case 'BARTLETT':
        sServObj.spectroSettings.window = myWindow.BARTLETT;
        break;
      case 'BARTLETTHANN':
        sServObj.spectroSettings.window = myWindow.BARTLETTHANN;
        break;
      case 'BLACKMAN':
        sServObj.spectroSettings.window = myWindow.BLACKMAN;
        break;
      case 'COSINE':
        sServObj.spectroSettings.window = myWindow.COSINE;
        break;
      case 'GAUSS':
        sServObj.spectroSettings.window = myWindow.GAUSS;
        break;
      case 'HAMMING':
        sServObj.spectroSettings.window = myWindow.HAMMING;
        break;
      case 'HANN':
        sServObj.spectroSettings.window = myWindow.HANN;
        break;
      case 'LANCZOS':
        sServObj.spectroSettings.window = myWindow.LANCZOS;
        break;
      case 'RECTANGULAR':
        sServObj.spectroSettings.window = myWindow.RECTANGULAR;
        break;
      case 'TRIANGULAR':
        sServObj.spectroSettings.window = myWindow.TRIANGULAR;
        break;
      default:
        sServObj.spectroSettings.window = myWindow.BARTLETTHANN;
        break;
      }
    };

    /**
     * @returns myWindow object
     */
    sServObj.getWindowFunctions = function () {
      return myWindow;
    };


    /**
     * set if user is dragging dragbar
     */
    sServObj.getdragBarActive = function () {
      return this.curViewPort.dragBarActive;
    };


    /**
     * set if user is dragging dragbar
     */
    sServObj.setdragBarActive = function (b) {
      this.curViewPort.dragBarActive = b;
    };

    /**
     * set if user is dragging dragbar
     */
    sServObj.getdragBarHeight = function () {
      return this.curViewPort.dragBarHeight;
    };


    /**
     * set if user is dragging dragbar
     */
    sServObj.setdragBarHeight = function (b) {
      this.curViewPort.dragBarHeight = b;
    };


    /**
     * get pixel position in current viewport given the canvas width
     * @param w is width of canvas
     * @param s is current sample to convert to pixel value
     */
    sServObj.getPos = function (w, s) {
      return (w * (s - this.curViewPort.sS) / (this.curViewPort.eS - this.curViewPort.sS + 1)); // + 1 because of view (displays all samples in view)
    };

    /**
     * calculate the pixel distance between two samples
     * @param w is width of canvas
     */
    sServObj.getSampleDist = function (w) {
      return this.getPos(w, this.curViewPort.sS + 1) - this.getPos(w, this.curViewPort.sS);
    };


    /**
     * toggle boolean if left submenu is open
     */
    sServObj.togglesubmenuOpen = function (time) {
      this.submenuOpen = !this.submenuOpen;
    };

    /**
     * get boolean if left submenu is open
     */
    sServObj.getsubmenuOpen = function () {
      return this.submenuOpen;
    };

    /**
     * set boolean if left submenu is open
     */
    sServObj.setsubmenuOpen = function (s) {
      this.submenuOpen = s;
    };


    /**
     * get the height of the osci
     */
    sServObj.setenlarge = function (s) {
      this.timelineSize = s;
    };


    /**
     * get the height of the osci
     */
    sServObj.getenlarge = function () {
      return this.timelineSize;
    };

    /**
     * get the height of the osci
     */
    sServObj.getTransitionTime = function () {
      return this.TransitionTime;
    };

    /**
     * get the height of the osci
     */
    sServObj.setTransitionTime = function (s) {
      this.TransitionTime = s;
    };

    /**
     * get the height of the osci
     */
    sServObj.getRightsubmenuOpen = function () {
      return this.rightSubmenuOpen;
    };



    /**
     * get the height of the osci
     */
    sServObj.setRightsubmenuOpen = function (s) {
      this.rightSubmenuOpen = s;
    };

    /**
     *
     */
    sServObj.setcurClickLevel = function (levelID, levelType, levelIndex) {
      this.setcurClickLevelName(levelID, levelIndex);
      this.setcurClickLevelType(levelType);
    };



    /**
     * sets the current (clicked) Level Name
     * @param name is name of level
     */
    sServObj.setcurClickLevelType = function (name) {
      this.curClickLevelType = name;
    };

    /**
     * gets the current (clicked) Level Name
     */
    sServObj.getcurClickLevelType = function () {
      return this.curClickLevelType;
    };


    /**
     * sets the current (clicked) Level Name
     * @param name is name of level
     */
    sServObj.setcurClickLevelName = function (name, index) {
      this.curClickLevelName = name;
      this.curClickLevelIndex = index;
    };

    /**
     * gets the current (clicked) Level Name
     */
    sServObj.getcurClickLevelName = function () {
      return this.curClickLevelName;
    };

    /**
     * gets the current (clicked) Level Name
     */
    sServObj.getcurClickLevelIndex = function () {
      return this.curClickLevelIndex;
    };



    /**
     * gets the current (clicked) Level Name
     */
    sServObj.getcurClickNeighbours = function () {
      return this.curClickNeighbours;
    };



    /**
     * sets the current (mousemove) Level Name
     * @param name is name of level
     */
    sServObj.setcurMouseLevelName = function (name) {
      this.curMouseLevelName = name;
    };

    /**
     * gets the current (mousemove) Level Name
     */
    sServObj.getcurMouseLevelName = function () {
      return this.curMouseLevelName;
    };


    /**
     * sets the current (mousemove) Level Name
     * @param name is name of level
     */
    sServObj.setcurMouseLevelType = function (name) {
      this.curMouseLevelType = name;
    };

    /**
     * gets the current (mousemove) Level Name
     */
    sServObj.getcurMouseLevelType = function () {
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
    sServObj.setcurMouseItem = function (item, neighbour, x, isFirst, isLast) {
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
    sServObj.getcurMouseItem = function () {
      return this.curMouseItem;
    };

    /**
     * Getter for isFirst
     * @return true if item is first item on level
     */
    sServObj.getcurMouseisFirst = function () {
      return this.curMouseisFirst;
    };

    /**
     * Getter for isLast
     * @return true if item is last item on level
     */
    sServObj.getcurMouseisLast = function () {
      return this.curMouseisLast;
    };

    /**
     * Getter for current Mouse Item Neighbours (left and right)
     * @return Object representing the current mouse item neighbours
     */
    sServObj.getcurMouseNeighbours = function () {
      return this.curMouseNeighbours;
    };

    /**
     * selects all Segements on current level which are inside the selected viewport
     * @param levelData current level Object
     */
    sServObj.selectItemsInSelection = function (levelData) {
      sServObj.curClickItems = [];
      var min = Infinity;
      var max = -Infinity;
      var itemInSel = this.getItemsInSelection(levelData);
      angular.forEach(itemInSel, function (item) {
        if (item.sampleStart < min) {
          min = item.sampleStart;
        }
        if ((item.sampleStart + item.sampleDur + 1) > max) {
          max = item.sampleStart + item.sampleDur + 1;
        }
        sServObj.setcurClickItemMultiple(item, sServObj.curClickLevelType);
      });
      sServObj.curViewPort.selectS = min;
      sServObj.curViewPort.selectE = max;
    };

    /**
     * get all items of current level which are inside the selected viewport
     */
    sServObj.getItemsInSelection = function (levelData) {
      var itemsInRange = [];
      var rangeStart = sServObj.curViewPort.selectS;
      var rangeEnd = sServObj.curViewPort.selectE;

      angular.forEach(levelData, function (t) {
        if (t.name === sServObj.getcurClickLevelName()) {
          angular.forEach(t.items, function (item) {
            if (item.sampleStart >= rangeStart && (item.sampleStart + item.sampleDur) <= rangeEnd) {
              itemsInRange.push(item);
            }
            if (item.samplePoint >= rangeStart && item.samplePoint <= rangeEnd) {
              itemsInRange.push(item);
            }
          });
        }
      });

      return itemsInRange;


    };


    /**
     * Setter for the current (click) Item
     * @param item Object representing the currently clicked item
     */
    sServObj.setcurClickItem = function (item) {
      if (item !== null && item !== undefined) {
        sServObj.curClickItems = [];
        sServObj.curClickItems.push(item);
        sServObj.selectBoundary();
      } else {
        sServObj.curClickItems = [];
      }
    };


    /**
     * Selects the current Boundary
     */
    sServObj.selectBoundary = function () {
      if (sServObj.curClickItems.length > 0) {
        var left = sServObj.curClickItems[0].sampleStart || sServObj.curClickItems[0].samplePoint;
        var right = sServObj.curClickItems[sServObj.curClickItems.length - 1].sampleStart + sServObj.curClickItems[sServObj.curClickItems.length - 1].sampleDur ||  sServObj.curClickItems[0].samplePoint;
        sServObj.curClickItems.forEach(function (entry) {
          if (entry.sampleStart <= left) {
            left = entry.sampleStart;
          }
          if (entry.sampleStart + entry.sampleDur >= right) {
            right = entry.sampleStart + entry.sampleDur;
          }
        });
        sServObj.select(left, right + 1);
      }
    };

    /**
     * adds a item the currently selected items if left or right of current selected items
     * @param item representing the Object to be added to selection
     */
    sServObj.setcurClickItemMultiple = function (item, type) {
      var empty = true;
      if(type === 'SEGMENT') {
        var start = item.sampleStart;
        var end = start + item.sampleDur + 1;
        sServObj.curClickItems.forEach(function (entry) {
          var front = (entry.sampleStart === end) ? true : false;
          var back = ((entry.sampleStart + entry.sampleDur + 1) === start) ? true : false;
          if ((front || back) && sServObj.curClickItems.indexOf(item) === -1) {
            sServObj.curClickItems.push(item);
            empty = false;
          }
        });
        if (empty) {
          sServObj.curClickItems = [];
          sServObj.curClickItems.push(item);
        } else {
          sServObj.curClickItems.sort(sServObj.sortbystart);
        }
      } else {
        
      }
    };

    /**
     *
     */
    sServObj.sortbystart = function (a, b) {
        //Compare "a" and "b" in some fashion, and return -1, 0, or 1
        if (a.sampleStart > b.sampleStart) {
          return 1;
        }
        if (a.sampleStart < b.sampleStart ) {
          return -1;
        }
        return 0;
      };


      /**
       *
       */
      sServObj.sortbypoint = function (a, b) {
        //Compare "a" and "b" in some fashion, and return -1, 0, or 1
        if (a.samplePoint > b.samplePoint) {
          return 1;
        }
        if (a.samplePoint < b.samplePoint ) {
          return -1;
        }
        return 0;
      };

    /**
     * Getter for the current selected range in samples
     * if nothing is selected returns -1
     * @return Object with Start and End values in samples
     */
    sServObj.getselectedRange = function () {
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
    sServObj.getcurClickItems = function () {
      return this.curClickItems;
    };


    /**
     *
     */
    sServObj.getselected = function () {
      return this.curClickItems;
    };

    /**
     *
     */
    sServObj.isEditing = function () {
      return this.editing;
    };

    /**
     *
     */
    sServObj.setEditing = function (n) {
      this.editing = n;
    };

    /**
     *
     */
    sServObj.getLasPcm = function () {
      return this.lastPcm;
    };

    /**
     *
     */
    sServObj.setLastPcm = function (n) {
      this.lastPcm = n;
    };

    /**
     *
     */
    sServObj.isHierarchyRotated = function () {
      return sServObj.hierarchyState.rotated;
    };

    /**
     *
     */
    sServObj.toggleHierarchyRotation = function () {
      sServObj.hierarchyState.rotated = !sServObj.hierarchyState.rotated;
    };

    /**
     *
     */
    sServObj.toggleHierarchy = function () {
      sServObj.hierarchyShown = !sServObj.hierarchyShown;
      if (sServObj.hierarchyShown === false) {
        // Make sure no private attributes (such as do start with an underscore
        // are left in the data when the hierarchy modal is closed
        console.debug ('Hierarchy modal was closed, cleaning up underscore attributes');
        StandardFuncsService.traverseAndClean (DataService.getData());
      }
    };

    sServObj.hierarchyState.contextMenuIsOpen = function () {
	    return sServObj.hierarchyState.contextMenuID !== undefined;
    };

    sServObj.hierarchyState.closeContextMenu = function () {
	    sServObj.hierarchyState.contextMenuID = undefined;
    };

    sServObj.hierarchyState.getContextMenuID = function () {
	    return sServObj.hierarchyState.contextMenuID;
    };

    sServObj.hierarchyState.setContextMenuID = function (id) {
	    sServObj.hierarchyState.contextMenuID = id;
    };

    sServObj.hierarchyState.getInputFocus = function () {
	    return sServObj.hierarchyState.inputFocus;
    };

    sServObj.hierarchyState.setInputFocus = function (f) {
	    sServObj.hierarchyState.inputFocus = f;
    };

    sServObj.hierarchyState.getEditValue = function () {
	    return sServObj.hierarchyState.editValue;
    };

    sServObj.hierarchyState.setEditValue = function (e) {
	    sServObj.hierarchyState.editValue = e;
    };

    /**
     *
     */
    sServObj.getCollapsed = function (id) {
	    if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
		    return false;
	    } else {
		    if (typeof sServObj.hierarchyState.collapseInfo[id].collapsed === 'boolean') {
			    return sServObj.hierarchyState.collapseInfo[id].collapsed;
		    } else {
			    return false;
		    }
	    }
    };

    /**
     *
     */
    sServObj.getCollapsePosition = function (id) {
	    if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
		    return undefined;
	    } else {
		    if (typeof sServObj.hierarchyState.collapseInfo[id].collapsePosition === 'object') {
			    return sServObj.hierarchyState.collapseInfo[id].collapsePosition;
		    } else {
			    return undefined;
		    }
	    }
    };

    /**
     *
     */
    sServObj.getNumCollapsedParents = function (id) {
	    if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
		    return 0;
	    } else {
		    if (typeof sServObj.hierarchyState.collapseInfo[id].numCollapsedParents === 'number') {
			    return sServObj.hierarchyState.collapseInfo[id].numCollapsedParents;
		    } else {
			    return 0;
		    }
	    }
    };

    /**
     *
     */
    sServObj.setCollapsed = function (id, newState) {
	    if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
		    sServObj.hierarchyState.collapseInfo[id] = {};
	    }

	    sServObj.hierarchyState.collapseInfo[id].collapsed = newState;
    };

    /**
     *
     */
    sServObj.setCollapsePosition = function (id, newPosition) {
	    if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
		    sServObj.hierarchyState.collapseInfo[id] = {};
	    }

	    sServObj.hierarchyState.collapseInfo[id].collapsePosition = newPosition;
    };

    /**
     *
     */
    sServObj.setNumCollapsedParents = function (id, newNum) {
	    if (typeof sServObj.hierarchyState.collapseInfo[id] === 'undefined') {
		    sServObj.hierarchyState.collapseInfo[id] = {};
	    }

	    sServObj.hierarchyState.collapseInfo[id].numCollapsedParents = newNum;
    };



    /**
     *
     */
    sServObj.getcursorInTextField = function () {
      return this.cursorInTextField;
    };

    /**
     *
     */
    sServObj.setcursorInTextField = function (n) {
      this.cursorInTextField = n;
    };

    /**
     *
     */
    sServObj.isSavingAllowed = function () {
      return this.saving;
    };

    /**
     *
     */
    sServObj.setSavingAllowed = function (n) {
      this.saving = n;
    };

    /**
     *
     */
    sServObj.countSelected = function () {
      return this.curClickItems.length;
    };

    /**
     *
     */
    sServObj.getCurrentSample = function (perc) {
      return this.curViewPort.sS + (this.curViewPort.eS - this.curViewPort.sS) * perc;
    };

    /**
     *
     */
    sServObj.getCurrentPercent = function (sample) {
      return (sample * (100 / (this.curViewPort.eS - this.curViewPort.sS) / 100));
    };

    /**
     *
     */
    sServObj.getSamplesPerPixelVal = function (event) {
      var start = parseFloat(this.curViewPort.sS);
      var end = parseFloat(this.curViewPort.eS);
      return (end - start) / event.originalEvent.target.width;
    };


    /**
     * calcs and returns start in secs
     */
    sServObj.getViewPortStartTime = function () {
      return (this.curViewPort.sS * 1 / Soundhandlerservice.wavJSO.SampleRate) - 0.5 / Soundhandlerservice.wavJSO.SampleRate;
    };

    /**
     * calcs and returns end time in secs
     */
    sServObj.getViewPortEndTime = function () {
      return (this.curViewPort.eS * 1 / Soundhandlerservice.wavJSO.SampleRate) + 0.5 / Soundhandlerservice.wavJSO.SampleRate;
    };

    /**
     * calcs and returns start in secs
     */
    sServObj.getSelectedStartTime = function () {
      return (this.curViewPort.selectS * 1 / Soundhandlerservice.wavJSO.SampleRate) - 0.5 / Soundhandlerservice.wavJSO.SampleRate;
    };

    /**
     * calcs and returns end time in secs
     */
    sServObj.getSelectedEndTime = function () {
      return (this.curViewPort.selectE * 1 / Soundhandlerservice.wavJSO.SampleRate) + 0.5 / Soundhandlerservice.wavJSO.SampleRate;
    };


    /**
     * set view port to start and end sample
     * (with several out-of-bounds like checks)
     *
     * @param sSample start sample of view
     * @param sSample end sample of view
     */
    sServObj.setViewPort = function (sSample, eSample) {
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
        if (this.curViewPort.eS > Soundhandlerservice.wavJSO.Data.length) {
          this.curViewPort.sS = oldStart;
          this.curViewPort.eS = Soundhandlerservice.wavJSO.Data.length;
        }
      }

      // check if in range
      if (this.curViewPort.sS < 0) {
        this.curViewPort.sS = 0;
      }
      if (this.curViewPort.eS > Soundhandlerservice.wavJSO.Data.length) {
        this.curViewPort.eS = Soundhandlerservice.wavJSO.Data.length;
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
     */
    sServObj.zoomViewPort = function (zoomIn, LevelService) {
      var newStartS, newEndS, curMouseMoveItemStart;
      var seg = this.getcurMouseItem();
      var d = this.curViewPort.eS - this.curViewPort.sS;

      var isLastSeg = false;

      if (seg !== undefined) {
        if (this.getcurMouseisFirst()) { // before first element
          seg = LevelService.getItemDetails(sServObj.getcurMouseLevelName(), 0);
        } else if (this.getcurMouseisLast()) {
          seg = LevelService.getLastItem(sServObj.getcurMouseLevelName());
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
    sServObj.shiftViewPort = function (shiftRight) {
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
    sServObj.setCurLevelAttrDefs = function (levelDefs) {
      angular.forEach(levelDefs, function (ld) {
        sServObj.curLevelAttrDefs.push({
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
     */
    sServObj.setCurAttrDef = function (levelName, newAttrDefName, index) {
      angular.forEach(sServObj.curLevelAttrDefs, function (ad) {
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
    sServObj.getCurAttrDef = function (levelName) {
      var curAttrDef;
      angular.forEach(sServObj.curLevelAttrDefs, function (ad) {
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
    sServObj.getCurAttrIndex = function (levelName) {
      var curAttrDef;
      angular.forEach(sServObj.curLevelAttrDefs, function (ad) {
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

    sServObj.setlastKeyCode = function (e) {
        this.lastKeyCode = e;
    };

    /**
	*
	*/
    sServObj.getX = function (e) {
	    return (e.offsetX || e.originalEvent.layerX) * (e.originalEvent.target.width / e.originalEvent.target.clientWidth);
    };

	/**
	*
	*/
    sServObj.getY = function (e) {
	    return (e.offsetY || e.originalEvent.layerY) * (e.originalEvent.target.height / e.originalEvent.target.clientHeight);
    };

    /**
     *
     */
    sServObj.resetToInitState = function () {
      sServObj.initialize();
    };

    /**
     *
     */
    sServObj.getColorOfAnchor = function (val, anchorNr) {
	    var curStyle = {
			'background-color': 'rgb(' + val[anchorNr][0] + ',' + val[anchorNr][1] + ',' + val[anchorNr][2] + ')',
			'width': '10px',
			'height': '10px'
		};
		return (curStyle);
	};

    return sServObj;

  });
