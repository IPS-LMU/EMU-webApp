'use strict';

$(function() {

  var DOWN = 'mousedown touchstart',
    MOVE = 'mousemove touchmove',
    STOP = 'mouseup touchend',
    E, M = {};

  var MAX = 0;

  function xy(v) {
    var y = v.pageY,
      x = v.pageX,
      t = v.originalEvent.targetTouches;
    if (t) {
      x = t[0].pageX;
      y = t[0].pageY;
    }
    return {
      x: x,
      y: y
    };
  }

  function init(e, h, k) {
    return e.each(function () {
      var $box = $(this),
        $handle = (h) ? $(h, this).css('cursor', k) : $box;
      $handle.bind(DOWN, {
        e: $box,
        k: k
      }, dragStart);
    });
  }

  function dragStart(v) {
    var p = xy(v),
      f = function (k) {
        return parseInt(E.css(k),10) || false;
      };
    E = v.data.e;
    M = {
      X: f('left') || 0,
      Y: f('top') || 0,
      H: f('height') || E[0].scrollHeight || 0,
      pX: p.x,
      pY: p.y,
      k: v.data.k
    };
    $('.container').scope().dragStart();
    $(document).bind(MOVE, drag).bind(STOP, dragEnd);
    MAX = $(document).height() - 2 * $('.menu-bottom').height();
    return false;
  }

  function drag(v) {
    var p = xy(v);
    var X = Math.max(p.y - M.pY + M.H, 0);
    if (X < MAX) {
      E.css({
        height: X
      });
      $('.container').scope().refreshTimeline();
      $('.HandletiersCtrl').css('padding-top', $('.TimelineCtrl').height() + 2 * $('.menu').height() + 'px');
    }
    return false;
  }

  function dragEnd() {
    $('.container').scope().dragEnd();
    $(document).unbind(MOVE, drag).unbind(STOP, dragEnd);
  }
  $.fn.ownResize = function (h) {
    return init(this, h, 'ns-resize');
  };

});