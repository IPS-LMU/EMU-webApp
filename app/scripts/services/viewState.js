'use strict';

angular.module('emulvcApp')
  .factory('viewState', function ($rootScope, Soundhandlerservice, $window, Levelservice) {

    //shared service object to be returned
    var sServObj = {};

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

    sServObj.curViewPort = {
      sS: 0,
      eS: 0,
      selectS: -1,
      selectE: -1,
      bufferLength: -1,
    };

    sServObj.spectroSettings = {
      windowLength: -1,
      rangeFrom: -1,
      rangeTo: -1,
      dynamicRange: -1,
      window: -1,
    };

    sServObj.playHeadAnimationInfos = {
      sS: -1,
      eS: -1,
      curS: null,
    };



    sServObj.selected = [];
    sServObj.curClickSegments = [];
    sServObj.lasteditArea = null;
    sServObj.editing = false;
    sServObj.submenuOpen = false;
    sServObj.rightSubmenuOpen = false;
    sServObj.modalOpen = false;
    sServObj.scrollOpen = 0;
    sServObj.levelLength = 0;
    sServObj.curMouseLevelName = undefined;
    sServObj.curMouseLevelType = undefined;
    sServObj.curClickLevelName = undefined;
    sServObj.curClickLevelType = undefined;
    sServObj.curPreselColumnSample = 2;
    sServObj.curCorrectionToolNr = undefined;
    sServObj.curClickLevelIndex = undefined;
    sServObj.start = null;
    sServObj.loadingUtt = false;
    sServObj.curMouseSegmentId = undefined;
    sServObj.TransitionTime = undefined;
    sServObj.showDropZone = undefined;

    sServObj.dragBarActive = false;
    sServObj.movingBoundary = false;

    sServObj.focusInTextField = false;

    sServObj.curTaskPercCompl = 0;

    sServObj.curPerspectiveIdx = 0;

    // possible general states of state machine
    sServObj.states = [];
    sServObj.states.noDBorFilesloaded = {
      'permittedActions': ['connectBtnClick', 'openDemoBtnDBclick']
    };
    sServObj.states.loadingSaving = {
      'permittedActions': []
    };
    sServObj.states.labeling = {
      'permittedActions': ['zoom', 'playaudio', 'spectSettingsChange', 'addLevelSegBtnClick', 'addLevelPointBtnClick', 'renameSelLevelBtnClick', 'downloadTextGridBtnClick', 'spectSettingsChange', 'clearBtnClick']
    };
    sServObj.states.modalShowing = {
      'permittedActions': []
    };
    sServObj.prevState = sServObj.states.noDBorFilesloaded;

    sServObj.curState = sServObj.states.noDBorFilesloaded;

    /**
     * function to ask permission in current labeler state
     */

    sServObj.getPermission = function (actionName) {

      return (sServObj.curState.permittedActions.indexOf(actionName) > -1);
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
      var samplesPassed = (Math.ceil(timestamp - sServObj.start) / 1000) * Soundhandlerservice.wavJSO.SampleRate;
      sServObj.playHeadAnimationInfos.curS = Math.round(sServObj.playHeadAnimationInfos.sS + samplesPassed);

      if (Soundhandlerservice.player.isPlaying && sServObj.playHeadAnimationInfos.curS <= sServObj.playHeadAnimationInfos.eS) {
        $rootScope.$apply();
      } else {
        sServObj.playHeadAnimationInfos.sS = -1;
        sServObj.playHeadAnimationInfos.eS = -1;
        sServObj.playHeadAnimationInfos.curS = 0;
        sServObj.start = null;
      }
    };

    /**
     */
    sServObj.animatePlayHead = function (startS, endS) {
      sServObj.playHeadAnimationInfos.sS = startS;
      sServObj.playHeadAnimationInfos.eS = endS;
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
    sServObj.setspectroSettings = function (len, rfrom, rto, dyn, win) {
      sServObj.spectroSettings.windowLength = parseInt(len, 10);
      sServObj.spectroSettings.rangeFrom = parseInt(rfrom, 10);
      sServObj.spectroSettings.rangeTo = parseInt(rto, 10);
      sServObj.spectroSettings.dynamicRange = parseInt(dyn, 10);
      sServObj.setWindowFunction(win);
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
      if (end > this.selectE) {
        this.curViewPort.selectE = end;
      }
    };

    sServObj.selectLevel = function (next) {
      var tag;
      var now = sServObj.getcurClickLevelName();
      var name = $('li').children()[0].id;
      if (now === undefined) {
        sServObj.setcurClickLevelName(name);
      } else {
        if (next) {
          tag = $('li.' + now).next().children()[0];
          if (tag === undefined) {
            sServObj.setcurClickLevelName(name);
          } else {
            name = tag.id;
            sServObj.setcurClickLevelName(name);
          }
        } else {
          tag = $('li.' + now).prev().children()[0];
          if (tag === undefined) {
            sServObj.setcurClickLevelName(name);
          } else {
            name = tag.id;
            sServObj.setcurClickLevelName(name);
          }
        }
        var segs = sServObj.getcurClickSegments();
        if (segs !== undefined) {
          if (segs.length > 0) {
            var pcm = segs[0].sampleStart + (segs[0].sampleDur / 2);
            var ld = Levelservice.getLevelDetails(name);
            var lastEventClick = Levelservice.getEvent(pcm, ld.level, false);
            var lastEventClickId = Levelservice.getEventId(pcm, ld.level, false);
            console.log(lastEventClick);
            sServObj.setlasteditArea('_' + lastEventClickId);
            sServObj.setcurClickLevelType(ld.level.type);
            sServObj.setcurClickSegment(lastEventClick, lastEventClickId);
            sServObj.setLevelLength(ld.level.elements.length);
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
      return this.dragBarActive;
    };


    /**
     * set if user is dragging dragbar
     */
    sServObj.setdragBarActive = function (b) {
      this.dragBarActive = b;
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
     * get the height of the osci
     */
    sServObj.getsubmenuOpen = function () {
      return this.submenuOpen;
    };

    /**
     * get the height of the osci
     */
    sServObj.setsubmenuOpen = function (s) {
      this.submenuOpen = s;
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
     * get the height of the osci
     */
    sServObj.getmodalOpen = function () {
      return this.modalOpen;
    };

    /**
     * get the height of the osci
     */
    sServObj.setmodalOpen = function (s) {
      this.modalOpen = s;
    };

    /**
     * get the height of the osci
     */
    sServObj.getscrollOpen = function () {
      return this.scrollOpen;
    };

    /**
     * get the height of the osci
     */
    sServObj.setscrollOpen = function (s) {
      this.scrollOpen = s;
    };


    sServObj.setcurClickLevel = function (levelID, levelType, levelIndex, elementsLength) {
      this.setLevelLength(elementsLength);
      this.setcurClickLevelName(levelID, levelIndex);
      this.setcurClickLevelType(levelType);
      this.setLevelLength(elementsLength);
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
     * sets the current (mousemove) Segment
     * @param name is name of segment
     */
    sServObj.setcurMouseSegment = function (segment) {
      this.curMouseSegment = segment;
    };

    /**
     * gets the current (mousemove) Segment
     */
    sServObj.getcurMouseSegment = function () {
      return this.curMouseSegment;
    };

    /**
     * sets the current (mousemove) Segment
     * @param id is if of segment
     */
    sServObj.setcurMouseSegmentId = function (id) {
      this.curMouseSegmentId = id;
    };

    /**
     * gets the current (mousemove) Segment
     */
    sServObj.getcurMouseSegmentId = function () {
      return this.curMouseSegmentId;
    };

    /**
     * selects all Segements on current level which are inside the selected viewport
     */
    sServObj.selectSegmentsInSelection = function () {
      var rangeStart = sServObj.curViewPort.selectS;
      var rangeEnd = sServObj.curViewPort.selectE;
      angular.forEach(Levelservice.data.levels, function (t) {
        var i = 0;
        if (t.LevelName === sServObj.getcurClickLevelName()) {
          angular.forEach(t.elements, function (evt) {
            if (evt.sampleStart >= rangeStart && (evt.sampleStart + evt.sampleDur) <= rangeEnd) {
              sServObj.setcurClickSegmentMultiple(evt, i);
            }
            ++i;
          });
        }
      });
    };


    /**
     * sets the current (click) Segment
     * @param segment
     */
    sServObj.setcurClickSegment = function (segment, id) {
      if (segment !== null) {
        this.select(segment.sampleStart, segment.sampleStart + segment.sampleDur);
        this.curClickSegments = [];
        this.curClickSegments.push(segment);
        this.selected = [];
        this.selected.push(id);
      }
    };

    /**
     * sets a multiple select (click) Segment
     * @param segment
     */
    sServObj.selectBoundry = function () {
      if (this.curClickSegments.length > 0) {
        var left = this.curClickSegments[0].sampleStart;
        var right = this.curClickSegments[0].sampleStart + this.curClickSegments[0].sampleDur;
        this.curClickSegments.forEach(function (entry) {
          if (entry.sampleStart <= left) {
            left = entry.sampleStart;
          }
          if (entry.sampleStart + entry.sampleDur >= right) {
            right = entry.sampleStart + entry.sampleDur;
          }
        });
        this.select(left, right);
      }
    };

    /**
     * sets a multiple select (click) Segment
     * @param segment
     */
    sServObj.setcurClickSegmentMultiple = function (segment, id) {
      var empty = true;
      var my = this;
      this.selected.forEach(function (entry) {
        if (my.selected.indexOf(id) === -1 && (entry - 1 === id)) {
          my.selected.push(id);
          my.curClickSegments.push(segment);
          empty = false;
        }
        if (my.selected.indexOf(id) === -1 && (entry + 1 === id)) {
          my.selected.push(id);
          my.curClickSegments.push(segment);
          empty = false;
        }
      });
      if (empty) {
        this.curClickSegments = [];
        this.curClickSegments.push(segment);
        this.selected = [];
        this.selected.push(id);
      }
      this.selectBoundry();
    };

    /**
     * gets the current (click) Segment
     */
    sServObj.getselected = function () {
      return this.selected;
    };


    /**
     * gets the current (click) Segment
     */
    sServObj.getselectedRange = function () {
      if (this.curClickSegments.length > 1) {
        return {
          start: this.curClickSegments[0].sampleStart,
          end: (this.curClickSegments[this.curClickSegments.length - 1].sampleStart + this.curClickSegments[this.curClickSegments.length - 1].sampleDur)
        };
      } else if (this.curClickSegments.length == 1) {
        return {
          start: this.curClickSegments[0].sampleStart,
          end: (this.curClickSegments[0].sampleStart + this.curClickSegments[0].sampleDur)
        };
      } else {
        return {
          start: -1,
          end: -1
        };
      }
    };

    /**
     * gets the current (click) Segment
     */
    sServObj.getcurClickSegments = function () {
      return this.curClickSegments;
    };

    sServObj.isEditing = function () {
      return this.editing;
    };

    sServObj.setEditing = function (n) {
      this.editing = n;
    };

    sServObj.setlasteditArea = function (name) {
      this.lasteditArea = name;
    };

    sServObj.getlastID = function () {
      return this.lasteditArea.substr(1);
    };

    sServObj.getlasteditArea = function () {
      return this.lasteditArea;
    };

    sServObj.deleteEditArea = function () {
      if (null !== this.getlasteditArea()) {
        $('.' + this.getlasteditArea()).remove();
      }
      this.editing = false;
    };


    sServObj.countSelected = function () {
      return this.selected.length;
    };

    sServObj.setLevelLength = function (length) {
      this.levelLength = length;
    };

    sServObj.getLevelLength = function () {
      return this.levelLength;
    };

    sServObj.getCurrentSample = function (perc) {
      return this.curViewPort.sS + (this.curViewPort.eS - this.curViewPort.sS) * perc;
    };

    sServObj.getCurrentPercent = function (sample) {
      return (sample * (100 / (this.curViewPort.eS - this.curViewPort.sS) / 100));
    };

    sServObj.getPCMpp = function (event) {
      var start = parseFloat(this.curViewPort.sS);
      var end = parseFloat(this.curViewPort.eS);
      return (end - start) / event.originalEvent.srcElement.width;
    };

    /**
     * round to n decimal digits after the comma
     * used to help display numbers with a given
     * precision
     */
    sServObj.round = function (x, n) {
      if (n < 1 || n > 14) {
        console.error('error in call of round function!!');
      }
      var e = Math.pow(10, n);
      var k = (Math.round(x * e) / e).toString();
      if (k.indexOf('.') === -1) {
        k += '.';
      }
      k += e.toString().substring(1);
      return k.substring(0, k.indexOf('.') + n + 1);
    };

    sServObj.openEditArea = function (lastEventClick, lastEventClickId, type, element) {
      var elem = element.find('canvas').context.getContext('2d');
      var clientWidth = elem.canvas.clientWidth;
      var clientOffset = elem.canvas.offsetLeft;
      
      console.log(elem.canvas.clientWidth);
      if (type === "seg") {
        var start = this.getPos(clientWidth, lastEventClick.sampleStart) + clientOffset;
        var end = this.getPos(clientWidth, (lastEventClick.sampleStart + lastEventClick.sampleDur)) + clientOffset;
      } else {
        var start = this.getPos(clientWidth, lastEventClick.sampleStart) + clientOffset - (clientWidth / 50);
        var end = this.getPos(clientWidth, lastEventClick.sampleStart) + clientOffset + (clientWidth / 50);
      }
      var top = elem.canvas.offsetTop + 1;
      var height = elem.canvas.clientHeight + 1;
      this.createEditArea(element, start, top, end - start, height, lastEventClick.label, lastEventClickId);
      //this.createSelection(element[0], 0, element.val().length);
    };

    sServObj.createSelection = function (field, start, end) {
      if (field.createTextRange) {
        var selRange = field.createTextRange();
        selRange.collapse(true);
        selRange.moveStart('character', start);
        selRange.moveEnd('character', end);
        selRange.select();
      } else if (field.setSelectionRange) {
        field.setSelectionRange(start, end);
      } else if (field.selectionStart) {
        field.selectionStart = start;
        field.selectionEnd = end;
      }
      field.focus();
    };

    sServObj.createEditArea = function (element, x, y, width, height, label, labelid) {
      var textid = '_' + labelid;
      element.prepend($('<textarea>').attr({
        id: textid,
        'class': textid + ' Label_Edit',
        'ng-model': 'message',
        'autofocus': 'true'
      }).css({
        'position': 'absolute',
        'z-index': '5',
        'left': x + 2 + 'px',
        'width': Math.round(width - 1) + 'px',
        'height': Math.round(height - 1) + 'px',
        'padding-top': Math.round(height / 3 + 1) + 'px'
      }).text(label));
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
    sServObj.zoomViewPort = function (zoomIn) {
      var newStartS, newEndS;
      // var levelName = this.getcurMouseLevelName();
      var segMId = this.getcurMouseSegmentId();

      // get cur mouse move level details
      var curLevel = Levelservice.getcurMouseLevelDetails();
      var d = this.curViewPort.eS - this.curViewPort.sS;
      var index = this.curClickLevelIndex;

      if (curLevel && segMId) {
        console.log(curLevel);
        console.log(index);
        var curMouseMoveSegmentStart = curLevel.elements[index][segMId].sampleStart;
        // console.log(curMouseMoveSegmentStart)

        var d1 = curMouseMoveSegmentStart - this.curViewPort.sS;
        var d2 = this.curViewPort.eS - curMouseMoveSegmentStart;

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
     * if set to falce -> shift left
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

    return sServObj;

  });