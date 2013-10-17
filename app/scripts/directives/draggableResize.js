'use strict';

angular.module("emulvcApp")
  .directive('drag', function() {
    return {
      restrict: "A",
      link: function(scope, element) {
      
        var osci = scope.vs.getscrollHOsci();
        var spectro = scope.vs.getscrollHSpectro();
        
        element.draggable({ 
            axis: "y",
            cursor: "move", 
            cursorAt: { bottom: 8 },
            handle: "div",
            containment: "parent",
		
			drag: function(e, ui) {
			    var add = ui.offset.top / 2;
			    scope.vs.setmarginTop(add);
			    scope.vs.setscrollHOsci(osci+add);
			    scope.vs.setscrollHSpectro(spectro+add);
			    scope.$apply();
			},	            
        });
      
      
    }
  };
});