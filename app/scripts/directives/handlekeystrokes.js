'use strict';

angular.module('emulvcApp')
    .directive('handleglobalkeystrokes', function(viewState) {
            return {
                restrict: 'A',
                link: function postLink(scope, element, attrs) {
                    $(document).bind("keydown", function(e) {
                        var code = (e.keyCode ? e.keyCode : e.which);
                        scope.$apply(function() {
                            scope.setlastkeycode(code, e.shiftKey);
                            if(!viewState.isEditing()) e.preventDefault();
                        });
                    });
                    scope.$on(
                        "$destroy",
                        function() {
                            $(window).off("keydown");
                        }
                   );
              }
        };
});