'use strict';

angular.module('emulvcApp')
  .factory('viewState', function($rootScope) {

    //shared service object to be returned
    var sServObj = {};

    sServObj.sS = 0;
    sServObj.eS = 0;
    sServObj.selectS = -1;
    sServObj.selectE = -1;
    sServObj.selected = [];
    sServObj.lasteditArea = null;
    sServObj.editing = false;

    sServObj.tmpFixedBufferLength = 128085;

    /**
     * set selected Area
     * @param start of selected Area
     * @param end of seleected Area
     */
    sServObj.select = function(start, end) {
      this.selectS = start;
      this.selectE = end;
    };

    /**
     * get pixel position in current viewport given the canvas width
     * @param w is width of canvas
     * @param s is current sample to convert to pixel value
     */
    sServObj.getPos = function(w, s) {
      return (w * (s - this.sS) / (this.eS - this.sS + 1)); // + 1 because of view (displays all samples in view)
    };

    /**
     * calculate the pixel distance between two samples
     * @param w is width of canvas
     */
    sServObj.getSampleDist = function(w) {
      return this.getPos(w, this.sS + 1) - this.getPos(w, this.sS);
    };

    /**
     * sets the current (clicked) Tier Name
     * @param name is name of tier
     */
    sServObj.setcurClickTierName= function(name) {
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
    sServObj.setcurMouseTierName= function(name) {
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
    sServObj.getcurMouseSegment= function() {
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
    sServObj.getcurMouseSegmentId= function() {
      return this.curMouseSegmentId;
    };


    /**
     * sets the current (click) Segment
     * @param segment
     */
    sServObj.setcurClickSegment = function(segment, id) {
      this.curClickSegment = segment;
      this.selected = [];
      this.selected.push(id);
    };

    /**
     * sets a multiple select (click) Segment
     * @param segment
     */
    sServObj.setcurClickSegmentMultiple = function(segment, id) {
      var empty = true;
      var my = this;
      this.selected.forEach(function(entry) {
        if (my.selected.indexOf(id) == -1 && (entry - 1 == id ||  entry + 1 == id)) {
          my.selected.push(id);
          empty = false;
        }
      });
      if (empty) {
        this.selected = [];
        this.selected.push(id);
      }
    };

    /**
     * gets the current (click) Segment
     */
    sServObj.getcurClickSegment= function() {
      return this.selected;
    };

    /**
     * gets the current (click) Segment
     */
    sServObj.getlastClickSegment= function() {
      return this.curClickSegment;
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

    sServObj.getlastID= function() {
      return this.lasteditArea.substr(1);
    };

    sServObj.getlasteditArea = function() {
      return this.lasteditArea;
    };

    sServObj.deleteEditArea = function() {
      if (null != this.getlasteditArea()) $("." + this.getlasteditArea()).remove();
      this.editing = false;
    };


    sServObj.resizeSelectArea = function(start, end) {
      this.selectS = start;
      this.selectE = end;
    };

    sServObj.resizeSelectAreaMulti = function(start, end) {
      if (start < this.selectS)
        this.selectS = start;
      if (end > this.selectE)
        this.selectE = end;
    };


    sServObj.countSelected = function() {
      return this.selected.length;
    };

    sServObj.getCurrentSample = function(perc) {
      return this.sS + (this.eS - this.sS) * perc;
    };

    sServObj.getCurrentPercent = function(sample) {
      return (sample * (100 / (this.eS - this.sS) / 100));
    };

    /**
     * round to n decimal digits after the comma
     * used to help display numbers with a given
     * precision
     */
    sServObj.round = function(x, n) {
      if (n < 1 || n > 14) alert("error in call of round function!!");
      var e = Math.pow(10, n);
      var k = (Math.round(x * e) / e).toString();
      if (k.indexOf('.') == -1) k += '.';
      k += e.toString().substring(1);
      return k.substring(0, k.indexOf('.') + n + 1);
    };

    sServObj.openEditArea = function() {
      var lastEventClick = this.getlastClickSegment();
      var lastEventClickId = this.getlastID();
      var elem = $("#" + this.getcurClickTierName()).find("canvas")[0];
      var start = this.getPos(elem.clientWidth, lastEventClick.startSample) + elem.offsetLeft;
      var end = this.getPos(elem.clientWidth, (lastEventClick.startSample + lastEventClick.sampleDur)) + elem.offsetLeft;
      var top = elem.offsetTop;
      var height = elem.clientHeight;
      var myid = this.createEditArea(this.getcurClickTierName(), start, top, end - start, height, lastEventClick.label, lastEventClickId);
      this.createSelection($("#" + myid)[0], 0, $("#" + myid).val().length);
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
      var textid = "_" + labelid;
      $("#" + id).append($("<textarea>").attr({
        id: textid,
        "autofocus": "true",
        "class": textid + " Label_Edit",
        "ng-model": "message"
      }).css({
        "position": "absolute",
        "top": y + 1 + "px",
        "left": x + 2 + "px",
        "width": width - 1 + "px",
        "height": height + "px",
        "max-height": height - (height / 3) + "px",
        "padding-top": (height / 3) + "px"
      }).text(label));
      return textid;
    };

    /**
     * set view port to start and end sample
     * (with several out-of-bounds like checks)
     *
     * @param sSample start sample of view
     * @param sSample end sample of view
     */
    sServObj.setViewPort = function(sSample, eSample) {

        var oldStart = this.sS;
        var oldEnd = this.eS;
        if (sSample !== undefined) {
            this.sS = Math.round(sSample);
        }
        if (eSample !== undefined) {
            this.eS = Math.round(eSample);
        }

        // check if moving left or right is not out of bounds -> prevent zooming on edge when moving left/right
        if (oldStart > this.sS && oldEnd > this.eS) {
            //moved left
            if (this.sS < 0) {
                this.sS = 0;
                this.eS = oldEnd + Math.abs(this.sS);
            }
        }
        if (oldStart < this.sS && oldEnd < this.eS) {
            //moved right
            if (this.eS > this.tmpFixedBufferLength) {
                this.sS = oldStart;
                this.eS = this.tmpFixedBufferLength;
            }
        }

        // check if in range
        if (this.sS < 0) {
            this.sS = 0;
        }
        if (this.eS > this.tmpFixedBufferLength) {
            this.eS = this.tmpFixedBufferLength;
        }
        // check if at least 4 samples are showing (fixed max zoom size)
        if (this.eS - this.sS < 4) {
            this.sS = oldStart;
            this.eS = oldEnd;
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
        var d1 = 1;//this.viewPort.curMouseMoveSegmentStart - this.viewPort.sS;
        var d2 = 1; //this.viewPort.eS - this.viewPort.curMouseMoveSegmentStart;
        var d = this.eS - this.sS;

        if (zoomIn) {

          newStartS = this.sS + d * 0.1;
          newEndS = this.eS - d * 0.1;

            // if (this.viewPort.curMouseMoveSegmentStart) { //check if in view
                // newStartS = this.sS + d1 * 0.5;
                // newEndS = this.eS - d2 * 0.5;
            // } //else {
            //     newStartS = this.viewPort.sS + ~~(d / 4);
            //     newEndS = this.viewPort.eS - ~~(d / 4);
            // }
        } else {
          newStartS = this.sS - d * 0.1;
          newEndS = this.eS + d * 0.1;


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
            newStartS = this.sS + ~~((this.eS - this.sS) / 4);
            newEndS = this.eS + ~~((this.eS - this.sS) / 4);
        } else {
            newStartS = this.sS - ~~((this.eS - this.sS) / 4);
            newEndS = this.eS - ~~((this.eS - this.sS) / 4);
        }

        this.setViewPort(newStartS, newEndS);
    };

    return sServObj;

  });