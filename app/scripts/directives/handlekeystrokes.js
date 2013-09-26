'use strict';

angular.module('emulvcApp')
    .directive('handleglobalkeystrokes', function() {
            return {
                restrict: 'A',
                link: function postLink(scope, element, attrs) {
                    $(document).bind("keydown", function(e) {
                        var code = (e.keyCode ? e.keyCode : e.which);
                        scope.$apply(function() {
                            scope.setlastkeycode(code);
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