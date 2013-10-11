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
                        if (viewState.isEditing()) {
                            console.log(code)
                            if (code == 13) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        } else {
                            // delegate keyboard shortcuts according to keyMappings of scope
                            if (code == scope.keyMappings.shiftViewPortLeft) {
                                viewState.shiftViewPort(false);
                            }
                            if (code == scope.keyMappings.shiftViewPortRight) {
                                viewState.shiftViewPort(true);
                            }
                            if (code == scope.keyMappings.zoomOut) {
                                viewState.zoomViewPort(false);
                            }
                            if (code == scope.keyMappings.zoomIn) {
                                viewState.zoomViewPort(true);
                            }
                            if (code == scope.keyMappings.playEntireFile) {
                                //play entire file
                                Soundhandlerservice.play(0, 2.9044217803634114, undefined); // SIC.. hard coded
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
