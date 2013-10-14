angular.module("emulvcApp").directive('draggableResizeBar', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      var options = scope.$eval(attrs.draggableResizeBar); //allow options to be passed in
      elm.draggable(options);
    }
  };
});