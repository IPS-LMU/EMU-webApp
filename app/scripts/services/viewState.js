'use strict';

angular.module('emulvcApp')
  .factory('viewState', function($rootScope) {

    //shared service object to be returned
    var sServ = {};

    sServ.sS = 0;
    sServ.eS = 0;
    sServ.selectS = -1;
    sServ.selectE = -1;
    sServ.selected = [];
    sServ.lasteditArea = null;
    sServ.editing = false;

    /**
     * set selected Area
     * @param start of selected Area
     * @param end of seleected Area
     */
    sServ.select = function(start, end) {
      this.selectS = start;
      this.selectE = end;
    };

    /**
     * get pixel position in current viewport given the canvas width
     * @param w is width of canvas
     * @param s is current sample to convert to pixel value
     */
    sServ.getPos = function(w, s) {
      return (w * (s - this.sS) / (this.eS - this.sS + 1)); // + 1 because of view (displays all samples in view)
    };

    /**
     * calculate the pixel distance between two samples
     * @param w is width of canvas
     */
    sServ.getSampleDist = function(w) {
      return this.getPos(w, this.sS + 1) - this.getPos(w, this.sS);
    };

    /**
     * sets the current (clicked) Tier Name
     * @param name is name of tier
     */
    sServ.setcurClickTierName= function(name) {
      this.curClickTierName = name;
    };

    /**
     * gets the current (clicked) Tier Name
     */
    sServ.getcurClickTierName = function() {
      return this.curClickTierName;
    };

    /**
     * sets the current (mousemove) Tier Name
     * @param name is name of tier
     */
    sServ.setcurMouseTierName= function(name) {
      this.curMouseTierName = name;
    };

    /**
     * gets the current (mousemove) Tier Name
     */
    sServ.getcurMouseTierName = function() {
      return this.curMouseTierName;
    };

    /**
     * sets the current (mousemove) Segment
     * @param name is name of tier
     */
    sServ.setcurMouseSegment = function(segment) {
      this.curMouseSegment = segment;
    };

    /**
     * gets the current (mousemove) Segment
     */
    sServ.getcurMouseSegment= function() {
      return this.curMouseSegment;
    };

    /**
     * sets the current (mousemove) Segment
     * @param name is name of tier
     */
    sServ.setcurMouseSegmentId = function(id) {
      this.curMouseSegmentId = id;
    };

    /**
     * gets the current (mousemove) Segment
     */
    sServ.getcurMouseSegmentId= function() {
      return this.curMouseSegmentId;
    };


    /**
     * sets the current (click) Segment
     * @param segment
     */
    sServ.setcurClickSegment = function(segment, id) {
      this.curClickSegment = segment;
      this.selected = [];
      this.selected.push(id);
    };

    /**
     * sets a multiple select (click) Segment
     * @param segment
     */
    sServ.setcurClickSegmentMultiple = function(segment, id) {
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
    sServ.getcurClickSegment= function() {
      return this.selected;
    };

    /**
     * gets the current (click) Segment
     */
    sServ.getlastClickSegment= function() {
      return this.curClickSegment;
    };

    sServ.isEditing = function() {
      return this.editing;
    };

    sServ.setEditing = function(n) {
      this.editing = n;
    };

    sServ.setlasteditArea = function(name) {
      this.lasteditArea = name;
    };

    sServ.getlastID= function() {
      return this.lasteditArea.substr(1);
    };

    sServ.getlasteditArea = function() {
      return this.lasteditArea;
    };

    sServ.deleteEditArea = function() {
      if (null != this.getlasteditArea()) $("." + this.getlasteditArea()).remove();
      this.editing = false;
    };


    sServ.resizeSelectArea = function(start, end) {
      this.selectS = start;
      this.selectE = end;
    };

    sServ.resizeSelectAreaMulti = function(start, end) {
      if (start < this.selectS)
        this.selectS = start;
      if (end > this.selectE)
        this.selectE = end;
    };


    sServ.countSelected = function() {
      return this.selected.length;
    };

    sServ.getCurrentSample = function(perc) {
      return this.sS + (this.eS - this.sS) * perc;
    };

    sServ.getCurrentPercent = function(sample) {
      return (sample * (100 / (this.eS - this.sS) / 100));
    };

    /**
     * round to n decimal digits after the comma
     * used to help display numbers with a given
     * precision
     */
    sServ.round = function(x, n) {
      if (n < 1 || n > 14) alert("error in call of round function!!");
      var e = Math.pow(10, n);
      var k = (Math.round(x * e) / e).toString();
      if (k.indexOf('.') == -1) k += '.';
      k += e.toString().substring(1);
      return k.substring(0, k.indexOf('.') + n + 1);
    };

    sServ.openEditArea = function() {
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

    sServ.createSelection = function(field, start, end) {
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

    sServ.createEditArea = function(id, x, y, width, height, label, labelid) {
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

    return sServ;

  });