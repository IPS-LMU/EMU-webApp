'use strict';

angular.module('emulvcApp')
    .directive('handleglobalkeystrokes', function(viewState, Soundhandlerservice) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {

                // bind all keydown events
                $(document).bind("keydown", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    console.log(code)
                    scope.$apply(function() {
                        scope.setlastkeycode(code, e.shiftKey);
                        if (viewState.isEditing()) {
                            if (code == scope.keyMappings.enter) {
                                $('#HandletiersCtrl').scope().renameLabel();
                            }
                            if (code == scope.keyMappings.esc) {
                                $('#HandletiersCtrl').scope().deleteEditArea();
                            }
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
                            if (code == scope.keyMappings.zoomSel) {
                                viewState.setViewPort(viewState.curViewPort.selectS,viewState.curViewPort.selectE);
                            }                            
                            if (code == scope.keyMappings.selectFirstContourCorrectionTool) {
                                viewState.curCorrectionToolNr = 1;
                            }
                            if (code == scope.keyMappings.selectSecondContourCorrectionTool) {
                                viewState.curCorrectionToolNr = 2;
                            }
                            if (code == scope.keyMappings.selectThirdContourCorrectionTool) {
                                viewState.curCorrectionToolNr = 3;
                            }
                            if (code == scope.keyMappings.selectFourthContourCorrectionTool) {
                                viewState.curCorrectionToolNr = 4;
                            }
                            if (code == scope.keyMappings.zoomIn) {
                                viewState.zoomViewPort(true);
                            }
                            if (code == scope.keyMappings.playEntireFile) {
                                //play entire file
                                Soundhandlerservice.play(0, 2.9044217803634114, undefined); // SIC.. hard coded
                            }
                            if (code == scope.keyMappings.shiftViewPortRight) {
                                viewState.shiftViewPort(true);
                            }
                            if (code == scope.keyMappings.zoomAll) {
                                viewState.setViewPort(0,viewState.curViewPort.bufferLength);
                            }                            
                            if (code == scope.keyMappings.tab) {
                                if (e.shiftKey)
                                    $('#HandletiersCtrl').scope().tabPrev();
                                else
                                    $('#HandletiersCtrl').scope().tabNext();
                            }
                            if (code == scope.keyMappings.history) {
                                $('#HandletiersCtrl').scope().goBackHistory();
                            }
                            if (code == scope.keyMappings.backspace) {
                                var seg = viewState.getcurClickSegments();
                                var toDelete = "";
                                for (var i = 0; i < seg.length; i++) {
                                    toDelete += seg[i].label + ",";
                                }
                                toDelete = toDelete.substring(0, toDelete.length - 1);
                                scope.openModal('views/deleteSegment.html', 'deleteTier', toDelete, toDelete);
                            }

                            if (!e.metaKey) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
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