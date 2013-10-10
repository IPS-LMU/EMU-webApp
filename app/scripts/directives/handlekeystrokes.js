'use strict';

angular.module('emulvcApp')
    .directive('handleglobalkeystrokes', function(viewState) {
            return {
                restrict: 'A',
                link: function postLink(scope, element, attrs) {
                
                    // element.bind("mousedown", function(e) {
                    //  console.log(element);
                    // });
                    
                    $(document).bind("keydown", function(e) {
                        var code = (e.keyCode ? e.keyCode : e.which);
                        scope.$apply(function() {
                            scope.setlastkeycode(code, e.shiftKey);
                            if(viewState.isEditing()) {
                                console.log(code)
                                if(code==13) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }
                            else {
                                console.log(e)
                                // e.preventDefault();
                                e.stopPropagation();
                            }
                        });
                    });

                    //remove binding on destroy
                    scope.$on(
                        "$destroy",
                        function() {
                            $(window).off("keydown");
                        }
                   );
              }
        };
});