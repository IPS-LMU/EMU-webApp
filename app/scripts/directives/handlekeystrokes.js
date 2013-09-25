'use strict';

angular.module('emulvcApp')
    .directive('handleglobalkeystrokes', function() {
            return {
                restrict: 'A',
                link: function postLink(scope, element, attrs) {
                    // element.text('this is the handlekeystrokes directive');
                    console.log("############################ das mach ma einfach mal...");

                    $(document).bind("keydown", function(e) {
                            var code = (e.keyCode ? e.keyCode : e.which);
                            
                            if(code==13) alert("enter");

                            scope.$apply(function() {
                                scope.setlastkeycode(code);
                            });
                        });

                // clean up of binding
                scope.$on(
                    "$destroy",
                    function() {
                        $(window).off("keydown");
                    }
                );
            }
        };
});