'use strict';

angular.module("emulvcApp")
  .directive('drag', function() {
    return {
      restrict: "A",
      link: function(scope, element) {

        element.draggable({ 
            axis: "y",
            cursor: "move", 
            cursorAt: { bottom: 8 },
            handle: "div",
            containment: "parent",
		
			drag: function(e, ui) {
			    scope.vs.setscroll(ui.offset.top);
			    scope.$apply();
			},	            
        });
      
      
    }
  };
});