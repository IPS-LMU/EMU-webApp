'use strict';

angular.module('emulvcApp')
  .factory('viewState', function() {
    var sS = 0;
    var eS = 128085;

    var selectS = -1;
    var selectE = -1;
    var bufferLength = 128085; // on init
    var sampleRate = 44100;

    // red line on wave & spectro
    var percent = -1;

    // list of selected Segments 
    var uiInfo = []; // [Segments]

    var selectInfo = []; // [Segments]

    // set everything to deselect when tiers are loaded and view is init()
    // var resetSelection();

    // id of tier and segment CLICKED on
    var MouseTierName = '';
    var MouseSegmentName = '';

    // id of tier and segment MOVED on
    var curMouseMoveTierName = '';
    var curMouseMoveTierType = '';
    var curMouseMoveSegmentName = '';
    var curMouseMoveSegmentStart = '';
    var curMouseMoveSegmentDuration = '';

    var selectSPixel = 0;
    var selectEPixel = 0;

    var curCursorPosInPercent = 0.0;

    var meaningOfLife = 42;


    // Public API here
    return {
      sS: sS,
      eS: eS,

      someMethod: function() {
        return meaningOfLife;
      },
      /**
       * set selected Area
       * @param start of selected Area
       * @param end of seleected Area
       */
      select: function(start, end) {
        this.selectS = start;
        this.selectE = end;
      },

      selectMove: function(tier, evt) {
        this.curMouseMoveTierName = tier.TierName;
        this.curMouseMoveTierType = tier.type;
        this.curMouseMoveSegmentName = this.getId(tier, evt.label, evt.startSample);
        this.curMouseMoveSegmentStart = evt.startSample;
        this.curMouseMoveSegmentDuration = evt.sampleDur;
      },

      /**
       * get pixel position in current viewport given the canvas width
       * @param w is width of canvas
       * @param s is current sample to convert to pixel value
       */
      getPos: function(w, s) {
        return (w * (s - sS) / (eS - sS + 1)); // + 1 because of view (displays all samples in view)
      },

      /**
       * calculate the pixel distance between two samples
       * @param w is width of canvas
       */
      getSampleDist: function(w) {
        return this.getPos(w, this.sS + 1) - this.getPos(w, this.sS);
      },

      /**
       * param name name of tier
       */
      setSelectTier: function(name) {
        this.MouseTierName = name;
      },

      getSelectTier: function() {
        return this.MouseTierName;
      },

      getSelectName: function() {
        console.log(this.MouseSegmentName)
        return this.MouseSegmentName;
      },

      setSelectName: function(n) {
        this.MouseSegmentName = n;
      },

      setSelectSegment: function(tier, evt, isSelected, width) {
        var id = this.getId(tier, evt.label, evt.startSample);
        this.MouseSegmentName = id;
        this.uiInfo[id] = isSelected;
        this.resizeSelectArea(evt.startSample, evt.startSample + evt.sampleDur + 1);
      },

      setSelectPoint: function(tier, evt, isSelected, width) {
        var id = this.getId(tier, evt.label, evt.startSample);
        this.MouseSegmentName = id;
        this.uiInfo[id] = isSelected;
        this.resizeSelectArea(evt.startSample, evt.startSample);
      },

      resizeSelectArea: function(start, end) {
        this.selectS = start;
        this.selectE = end;
      },

      resizeSelectAreaMulti: function(start, end) {
        if (start < this.selectS)
          this.selectS = start;
        if (end > this.selectE)
          this.selectE = end;
      },

      // SIC call to emulabeller
      // setSelectMultiSegment: function(tier, evt, isSelected, width, dontCheck) {
      //   var id = this.getId(tier, evt.label, evt.startSample);
      //   if (emulabeller.viewPort.uiInfo[id - 1] ||  emulabeller.viewPort.uiInfo[id + 1] ||  dontCheck) {
      //     emulabeller.viewPort.uiInfo[id] = isSelected;
      //     if (!dontCheck) emulabeller.viewPort.resizeSelectAreaMulti(evt.startSample, evt.startSample + evt.sampleDur + 1);
      //     return true;
      //   } else return false;
      // },

      isSelected: function(tier, name, start) {
        if (tier.TierName == this.getSelectTier())
          return this.uiInfo[this.getId(tier, name, start)];
        else
          return false;
      },

      getAllSelected: function(tier) {
        var ret = [];
        var j = 0;
        if (tier.TierName == this.getSelectTier()) {
          for (e in tier.events) {
            if (this.uiInfo[j]) ret[j] = tier.events[e];
            j++;
          }
          return ret;
        } else
          return false;
      },


      countSelected: function() {
        var x = 0;
        for (var i = 0; i < tierhis.uiInfo.length; i++)
          if (this.uiInfo[i]) x++;
        return x;
      },


      getCurrentSample: function(perc) {
        return this.sS + (this.eS - this.sS) * perc;
      },

      getCurrentPercent: function(sample) {
        return (sample * (100 / (this.eS - this.sS) / 100));
      },

      getId: function(tier, name, start) {
        var j = 0;
        for (var y in tier.events) {
          if (tier.events[y].label == name && tier.events[y].startSample == start)
            return j;
          j++;
        }
        return false;
      },

      resetSelection: function(length) {
        for (var i = 0; i < length; i++) {
          this.uiInfo[i] = false;
        }
      },

      /**
       * round to n decimal digits after the comma
       * used to help display numbers with a given
       * precision
       */
      round: function(x, n) {
        if (n < 1 || n > 14) alert("error in call of round function!!");
        var e = Math.pow(10, n);
        var k = (Math.round(x * e) / e).toString();
        if (k.indexOf('.') == -1) k += '.';
        k += e.toString().substring(1);
        return k.substring(0, k.indexOf('.') + n + 1);
      }

      // getsS: function(){
      //   return sS;
      // },

      // geteS: function(){
      //   return eS;
      // },

    };
  });