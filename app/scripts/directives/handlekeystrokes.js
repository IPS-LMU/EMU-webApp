'use strict';

angular.module('emulvcApp')
    .directive('handleglobalkeystrokes', function(viewState, Soundhandlerservice) {
            return {
                restrict: 'A',
                link: function postLink(scope, element, attrs) {
                    
                    // bind all keydown events
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
                                if(code==65) { // A
                                    viewState.shiftViewPort(false);
                                }
                                if(code==68) { // D
                                    viewState.shiftViewPort(true);
                                }
                                if(code==83) { // S
                                    viewState.zoomViewPort(false);
                                }
                                if(code==87) { // W
                                    viewState.zoomViewPort(true);
                                }
                                if(code==32) { // Space
                                    //play entire file
                                    Soundhandlerservice.play(0, 2.9044217803634114 , undefined);
                                }

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