(function($){

  var DOWN = 'mousedown touchstart', 
      MOVE = 'mousemove touchmove', 
      STOP = 'mouseup touchend',
      E, M = {};

  function xy(v) {
    var y = v.pageY, 
        x = v.pageX, 
        t = v.originalEvent.targetTouches;
    if(t) {
      x = t[0]['pageX'];
      y = t[0]['pageY'];
    }
    return {x:x,y:y};
  }

  function toTop($e) {
    var z = 0;
    $e.siblings().each(function(){
      z = parseInt($(this).css("z-index"),10);
    });
    return $e.css('z-index', z);
  }

  function init(e,h,k) {
    console.log(e.css('top'));
    return e.each( function() {
      var $box = $(this),
          $handle = (h) ? $(h,this).css('cursor',k) : $box;
      $handle.bind(DOWN, {e:$box,k:k}, dragStart);
    });
  };

  function dragStart(v) {
    var p = xy(v), f = function(k) { return parseInt(E.css(k))||false; };
    E = toTop(v.data.e);
    M = {
      X:f('left')||0, Y:f('top')||0, 
      H:f('height')||E[0].scrollHeight||0,
      pX:p.x, pY:p.y, k:v.data.k
    };
    $(document).bind(MOVE,drag).bind(STOP,dragEnd);
    return false;
  };

  function drag(v) {
    var p = xy(v);
    E.css({ height:Math.max(p.y-M.pY+M.H,0) });
    return false;
  };

  function dragEnd() {
    $(document).unbind(MOVE,drag).unbind(STOP,dragEnd);
  };

  $.fn.ownDrag = function(h) { return init(this, h, 'move'); };
  $.fn.ownResize = function(h) { return init(this, h, 'ns-resize'); };

})(jQuery);