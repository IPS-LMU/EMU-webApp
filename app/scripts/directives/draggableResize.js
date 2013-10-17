'use strict';

angular.module("emulvcApp")
  .directive('drag', function() {
    return {
      restrict: "A",
      link: function(scope, element) {
      
        var osci = scope.cps.vals.osciCanvasHeight;
        var spectro = scope.cps.vals.osciCanvasHeight;
        
        element.draggable({ 
            axis: "y",
            cursor: "move", 
            cursorAt: { bottom: 8 },
            handle: "div",
            containment: "parent",
		
			drag: function(e, ui) {
			    var add = ui.offset.top / 2;
			    scope.vs.setscrollHeight(scope.cps.vals.osciCanvasHeight+add,add);
			    scope.$apply();
			},	            
        });
      
      
    }
  };
});