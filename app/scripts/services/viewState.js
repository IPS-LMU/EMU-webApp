'use strict';

angular.module('emulvcApp')
  .factory('viewState', function() {
  
    // start Sample of current Wave
    var sS = 0;
    
    // end Sample of current Wave
    var eS = 0;

    // current selected border start (left side)
    var selectS = -1;
    
    // current selected border end (right side)
    var selectE = -1;  
    
    // current selected segments
    var selected = [];     
    
    // complete buffer length
    var bufferLength = 0; 
    
    // sample Rate of Wave
    var sampleRate = 44100;
    
    // variable name of edit area (textarea)
    var editAreaName = "";


    // Public API here
    return {
      sS: sS,
      eS: eS,
      selectS : selectS,
      selectE : selectE,
      selected : selected,
      editAreaName : editAreaName,
      
      
      /**
       * set selected Area
       * @param start of selected Area
       * @param end of seleected Area
       */
      select: function(start, end) {
        this.selectS = start;
        this.selectE = end;
      },
      
      /**
       * get pixel position in current viewport given the canvas width
       * @param w is width of canvas
       * @param s is current sample to convert to pixel value
       */
      getPos: function(w, s) {
        return (w * (s - this.sS) / (this.eS - this.sS + 1)); // + 1 because of view (displays all samples in view)
      },

      /**
       * calculate the pixel distance between two samples
       * @param w is width of canvas
       */
      getSampleDist: function(w) {
        return this.getPos(w, this.sS + 1) - this.getPos(w, this.sS);
      },

      /**
       * sets the current (clicked) Tier Name
       * @param name is name of tier
       */
      setcurClickTierName: function(name) {
        this.curClickTierName = name;
      },

      /**
       * gets the current (clicked) Tier Name
       */
      getcurClickTierName: function() {
        return this.curClickTierName;
      },

      /**
       * sets the current (mousemove) Tier Name
       * @param name is name of tier
       */
      setcurMouseTierName: function(name) {
        this.curMouseTierName = name;
      },

      /**
       * gets the current (mousemove) Tier Name
       */
      getcurMouseTierName: function() {
        return this.curMouseTierName;
      },

      /**
       * sets the current (mousemove) Segment
       * @param name is name of tier
       */
      setcurMouseSegment: function(segment) {
        this.curMouseSegment = segment;
      },

      /**
       * gets the current (mousemove) Segment
       */
      getcurMouseSegment: function() {
        return this.curMouseSegment;
      },
      
      /**
       * sets the current (click) Segment
       * @param segment
       */
      setcurClickSegment: function(segment,id) {
        this.curClickSegment = segment;
        this.selected = [];
        this.selected.push(id);
      },
      
      /**
       * sets the name of the current Edit Area (textarea)
       * @name of Edit Area
       */
      setEditAreaName: function(name) {
        this.editAreaName = name;
      },
      
      /**
       * gets the current name of the Edit Area (textarea)
       */      
      getEditAreaName: function() {
        return this.editAreaName;
      },

      /**
       * sets a multiple select (click) Segment
       * @param segment
       */
      setcurClickSegmentMultiple: function(segment,id) {
        var empty = true;
        var my = this;
        this.selected.forEach(function(entry) {
            if(my.selected.indexOf(id) == -1 &&(entry-1==id || entry+1==id)) {
              my.selected.push(id);
              empty = false;
            }
        });
        if(empty) {
          this.selected = [];
          this.selected.push(id);        
        }
      },

      /**
       * gets the current (click) Segment
       */
      getcurClickSegment: function() {
        return this.selected;
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


      countSelected: function() {
        return this.selected.length;
      },

      getCurrentSample: function(perc) {
        return this.sS + (this.eS - this.sS) * perc;
      },

      getCurrentPercent: function(sample) {
        return (sample * (100 / (this.eS - this.sS) / 100));
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