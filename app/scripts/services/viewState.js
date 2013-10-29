'use strict';

angular.module('emulvcApp')
  .factory('viewState', function($rootScope, Soundhandlerservice) {

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


    sServObj.selected = [];
    sServObj.lasteditArea = null;
    sServObj.editing = false;
    sServObj.submenuOpen = false;
    sServObj.modalOpen = false;

    sServObj.scroll = 0;
    sServObj.heightOsci = 0;
    sServObj.heightSpectro = 0;
    sServObj.heightTimeline = 0;
    sServObj.scrollSpectroOpen = true;
    sServObj.scrollOsciOpen = true;

    sServObj.curClickTierName = '';

    sServObj.curPreselColumnSample = 2;

    sServObj.curCorrectionToolNr = -1;


    /**
     * set selected Area
     * @param start of selected Area
     * @param end of selected Area
     */
    sServObj.select = function(start, end) {
      sServObj.curViewPort.selectS = start;
      sServObj.curViewPort.selectE = end;
    };

    /**
     * set selected Area
     * @param start of selected Area
     * @param end of selected Area
     */
    sServObj.setspectroSettings = function(len, rfrom, rto, dyn, win) {
      sServObj.spectroSettings.windowLength = parseInt(len,10);
      sServObj.spectroSettings.rangeFrom    = parseInt(rfrom,10);
      sServObj.spectroSettings.rangeTo      = parseInt(rto,10);
      sServObj.spectroSettings.dynamicRange = parseInt(dyn,10);
      sServObj.spectroSettings.window       = win;
    };    


    /**
     * returns current selection as array
     */
    sServObj.getSelect = function() {
      return [sServObj.curViewPort.selectS, sServObj.curViewPort.selectE];
    };

    /**
     * set selected Area if new
     * start value is smaler than actual and
     * end value is greater than actual
     * @param start of selected Area
     * @param end of seleected Area
     */
    sServObj.selectDependent = function(start, end) {
      if (start < this.curViewPort.selectS) {
        this.curViewPort.selectS = start;
      }
      if (end > this.selectE) {
        this.curViewPort.selectE = end;
      }
    };

    /**
     * get pixel position in current viewport given the canvas width
     * @param w is width of canvas
     * @param s is current sample to convert to pixel value
     */
    sServObj.getPos = function(w, s) {
      return (w * (s - this.curViewPort.sS) / (this.curViewPort.eS - this.curViewPort.sS + 1)); // + 1 because of view (displays all samples in view)
    };

    /**
     * calculate the pixel distance between two samples
     * @param w is width of canvas
     */
    sServObj.getSampleDist = function(w) {
      return this.getPos(w, this.curViewPort.sS + 1) - this.getPos(w, this.curViewPort.sS);
    };

    /**
     * get the height of the osci
     */
    sServObj.getscroll = function() {
      return this.scroll;
    };

    /**
     * get the height of the osci
     */
    sServObj.setscroll = function(s) {
      this.scroll = s;
    };

    /**
     * get the height of the osci
     */
    sServObj.getheightOsci = function() {
      return this.heightOsci;
    };

    /**
     * get the height of the osci
     */
    sServObj.setheightOsci = function(s) {
      this.heightOsci = s;
    };
    
    /**
     * get the height of the timeline
     */
    sServObj.getheightTimeline = function() {
      return this.heightTimeline;
    };

    /**
     * get the height of the timeline
     */
    sServObj.setheightTimeline = function(s) {
      this.heightTimeline = s;
    };    

    /**
     * get the height of the osci
     */
    sServObj.getsubmenuOpen = function() {
      return this.submenuOpen;
    };

    /**
     * get the height of the osci
     */
    sServObj.setsubmenuOpen = function(s) {
      this.submenuOpen = s;
    };

    /**
     * get the height of the osci
     */
    sServObj.getmodalOpen = function() {
      return this.modalOpen;
    };

    /**
     * get the height of the osci
     */
    sServObj.setmodalOpen = function(s) {
      this.modalOpen = s;
    };

    /**
     * get the height of the osci
     */
    sServObj.getheightSpectro = function() {
      return this.heightSpectro;
    };

    /**
     * get the height of the osci
     */
    sServObj.setheightSpectro = function(s) {
      this.heightSpectro = s;
    };

    /**
     * get the height of the osci
     */
    sServObj.getscrollSpectroOpen = function() {
      return this.scrollSpectroOpen;
    };

    /**
     * get the height of the osci
     */
    sServObj.setscrollSpectroOpen = function(s) {
      this.scrollSpectroOpen = s;
    };

    /**
     * get the height of the osci
     */
    sServObj.getscrollOsciOpen = function() {
      return this.scrollOsciOpen;
    };

    /**
     * get the height of the osci
     */
    sServObj.setscrollOsciOpen = function(s) {
      this.scrollOsciOpen = s;
    };


    /**
     * sets the current (clicked) Tier Name
     * @param name is name of tier
     */
    sServObj.setcurClickTierName = function(name) {
      this.curClickTierName = name;
    };

    /**
     * gets the current (clicked) Tier Name
     */
    sServObj.getcurClickTierName = function() {
      return this.curClickTierName;
    };

    /**
     * sets the current (mousemove) Tier Name
     * @param name is name of tier
     */
    sServObj.setcurMouseTierName = function(name) {
      this.curMouseTierName = name;
    };

    /**
     * gets the current (mousemove) Tier Name
     */
    sServObj.getcurMouseTierName = function() {
      return this.curMouseTierName;
    };

    /**
     * sets the current (mousemove) Segment
     * @param name is name of tier
     */
    sServObj.setcurMouseSegment = function(segment) {
      this.curMouseSegment = segment;
    };

    /**
     * gets the current (mousemove) Segment
     */
    sServObj.getcurMouseSegment = function() {
      return this.curMouseSegment;
    };

    /**
     * sets the current (mousemove) Segment
     * @param name is name of tier
     */
    sServObj.setcurMouseSegmentId = function(id) {
      this.curMouseSegmentId = id;
    };

    /**
     * gets the current (mousemove) Segment
     */
    sServObj.getcurMouseSegmentId = function() {
      return this.curMouseSegmentId;
    };


    /**
     * sets the current (click) Segment
     * @param segment
     */
    sServObj.setcurClickSegment = function(segment, id) {
      if (segment !== null) {
        this.select(segment.startSample, segment.startSample + segment.sampleDur);
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
    sServObj.selectBoundry = function() {
      if (this.curClickSegments !== undefined) {
        var left = this.curClickSegments[0].startSample;
        var right = this.curClickSegments[0].startSample + this.curClickSegments[0].sampleDur;
        this.curClickSegments.forEach(function(entry) {
          if (entry.startSample <= left) {
            left = entry.startSample;
          }
          if (entry.startSample + entry.sampleDur >= right) {
            right = entry.startSample + entry.sampleDur;
          }
        });
        this.select(left, right);
      }
    };

    /**
     * sets a multiple select (click) Segment
     * @param segment
     */
    sServObj.setcurClickSegmentMultiple = function(segment, id) {
      var empty = true;
      var my = this;
      this.selected.forEach(function(entry) {
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
    sServObj.getselected = function() {
      return this.selected;
    };

    /**
     * gets the current (click) Segment
     */
    sServObj.getcurClickSegments = function() {
      return this.curClickSegments;
    };

    sServObj.isEditing = function() {
      return this.editing;
    };

    sServObj.setEditing = function(n) {
      this.editing = n;
    };

    sServObj.setlasteditArea = function(name) {
      this.lasteditArea = name;
    };

    sServObj.getlastID = function() {
      return this.lasteditArea.substr(1);
    };

    sServObj.getlasteditArea = function() {
      return this.lasteditArea;
    };

    sServObj.deleteEditArea = function() {
      if (null !== this.getlasteditArea()) {
        $('.' + this.getlasteditArea()).remove();
      }
      this.editing = false;
    };


    sServObj.countSelected = function() {
      return this.selected.length;
    };

    sServObj.setTierLength = function(length) {
      this.tierLength = length;
    };

    sServObj.getTierLength = function() {
      return this.tierLength;
    };

    sServObj.getCurrentSample = function(perc) {
      return this.curViewPort.sS + (this.curViewPort.eS - this.curViewPort.sS) * perc;
    };

    sServObj.getCurrentPercent = function(sample) {
      return (sample * (100 / (this.curViewPort.eS - this.curViewPort.sS) / 100));
    };

    sServObj.getPCMpp = function(event) {
      var start = parseInt(this.curViewPort.sS, 10);
      var end = parseInt(this.curViewPort.eS, 10);
      return (end - start) / event.originalEvent.srcElement.width;
    };

    /**
     * round to n decimal digits after the comma
     * used to help display numbers with a given
     * precision
     */
    sServObj.round = function(x, n) {
      if (n < 1 || n > 14) {
        alert('error in call of round function!!');
      }
      var e = Math.pow(10, n);
      var k = (Math.round(x * e) / e).toString();
      if (k.indexOf('.') === -1) {
        k += '.';
      }
      k += e.toString().substring(1);
      return k.substring(0, k.indexOf('.') + n + 1);
    };

    sServObj.openEditArea = function() {
      var lastEventClick = this.getcurClickSegments()[0];
      var lastEventClickId = this.getlastID();
      var elem = $('#' + this.getcurClickTierName()).find('canvas')[0];
      console.log(this.getcurClickTierName());
      var start = this.getPos(elem.clientWidth, lastEventClick.startSample) + elem.offsetLeft;
      var end = this.getPos(elem.clientWidth, (lastEventClick.startSample + lastEventClick.sampleDur)) + elem.offsetLeft;
      var top = elem.offsetTop;
      var height = elem.clientHeight;
      var myid = this.createEditArea(this.getcurClickTierName(), start, top, end - start, height, lastEventClick.label, lastEventClickId);
      this.createSelection($('#' + myid)[0], 0, $('#' + myid).val().length);
      return myid;
    };

    sServObj.createSelection = function(field, start, end) {
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

    sServObj.createEditArea = function(id, x, y, width, height, label, labelid) {
      console.log(id);
      var textid = '_' + labelid;
      $('#' + id).prepend($('<textarea>').attr({
        id: textid,
        'autofocus': 'true',
        'class': textid + ' Label_Edit',
        'ng-model': 'message'
      }).css({
        'position': 'absolute',
        'z-index': '5',
        'left': x + 2 + 'px',
        'width': width - 1 + 'px',
        'height': height + 'px',
        'padding': '0px',
        'vertical-align': 'middle'
      }).text(label));
      return textid;
    };

    /**
     * calcs and returns start in secs
     */
    sServObj.getViewPortStartTime = function() {
      return (this.curViewPort.sS * 1 / Soundhandlerservice.wavJSO.SampleRate) - 0.5 / Soundhandlerservice.wavJSO.SampleRate;
    };

    /**
     * calcs and returns end time in secs
     */
    sServObj.getViewPortEndTime = function() {
      return (this.curViewPort.eS * 1 / Soundhandlerservice.wavJSO.SampleRate) + 0.5 / Soundhandlerservice.wavJSO.SampleRate;
    };


    /**
     * set view port to start and end sample
     * (with several out-of-bounds like checks)
     *
     * @param sSample start sample of view
     * @param sSample end sample of view
     */
    sServObj.setViewPort = function(sSample, eSample) {

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
    sServObj.zoomViewPort = function(zoomIn) {
      // this.tierHandler.removeLabelDoubleClick();
      var newStartS, newEndS;
      // var d1 = 1; //this.curMouseMoveSegmentStart - this.curViewPort.sS;
      // var d2 = 1; //this.viewPort.eS - this.viewPort.curMouseMoveSegmentStart;
      var d = this.curViewPort.eS - this.curViewPort.sS;

      if (zoomIn) {

        newStartS = this.curViewPort.sS + d * 0.1;
        newEndS = this.curViewPort.eS - d * 0.1;

        // if (this.viewPort.curMouseMoveSegmentStart) { //check if in view
        // newStartS = this.sS + d1 * 0.5;
        // newEndS = this.eS - d2 * 0.5;
        // } //else {
        //     newStartS = this.viewPort.sS + ~~(d / 4);
        //     newEndS = this.viewPort.eS - ~~(d / 4);
        // }
      } else {
        newStartS = this.curViewPort.sS - d * 0.1;
        newEndS = this.curViewPort.eS + d * 0.1;


        //     if (this.viewPort.curMouseMoveSegmentStart) { //check if in view
        //         newStartS = this.viewPort.sS - d1 * 0.5;
        //         newEndS = this.viewPort.eS + d2 * 0.5;
        //     } else {
        //         newStartS = this.viewPort.sS - ~~(d / 4);
        //         newEndS = this.viewPort.eS + ~~(d / 4);
        //     }
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
    sServObj.shiftViewPort = function(shiftRight) {
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