'use strict';

angular.module('emulvcApp')
  .directive('handleglobalkeystrokes', function(viewState, Soundhandlerservice, ConfigProviderService) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

        // bind all keydown events
        $(document).bind('keydown', function(e) {
          var code = (e.keyCode ? e.keyCode : e.which);
          scope.$apply(function() {
            scope.setlastkeycode(code, e.shiftKey);
            if (viewState.isEditing()) {
              if (code === ConfigProviderService.vals.keyMappings.enter) {
                $('#HandletiersCtrl').scope().renameLabel();
              }
              if (code === ConfigProviderService.vals.keyMappings.esc) {
                $('#HandletiersCtrl').scope().deleteEditArea();
              }
              if (code === 13) {
                e.preventDefault();
                e.stopPropagation();
              }
            } else if (viewState.getmodalOpen()) {
              // if (code === ConfigProviderService.vals.keyMappings.enter) {
              //     //$('#HandletiersCtrl').scope().renameLabel();
              // }
              // if (code === ConfigProviderService.vals.keyMappings.esc) {
              //     //$('#HandletiersCtrl').scope().deleteEditArea();
              // }
            } else {
              // delegate keyboard keyMappings according to keyMappings of scope
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortLeft) {
                viewState.shiftViewPort(false);
              }
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortRight) {
                viewState.shiftViewPort(true);
              }
              if (code === ConfigProviderService.vals.keyMappings.zoomOut) {
                viewState.zoomViewPort(false);
              }
              if (code === ConfigProviderService.vals.keyMappings.zoomSel) {
                viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
              }
              if (code === ConfigProviderService.vals.keyMappings.selectFirstContourCorrectionTool) {
                viewState.curCorrectionToolNr = 1;
              }
              if (code === ConfigProviderService.vals.keyMappings.selectSecondContourCorrectionTool) {
                viewState.curCorrectionToolNr = 2;
              }
              if (code === ConfigProviderService.vals.keyMappings.selectThirdContourCorrectionTool) {
                viewState.curCorrectionToolNr = 3;
              }
              if (code === ConfigProviderService.vals.keyMappings.selectFourthContourCorrectionTool) {
                viewState.curCorrectionToolNr = 4;
              }
              if (code === ConfigProviderService.vals.keyMappings.zoomIn) {
                viewState.zoomViewPort(true);
              }
              if (code === ConfigProviderService.vals.keyMappings.playEntireFile) {
                //play entire file
                Soundhandlerservice.playFromTo(-Infinity, +Infinity);
              }
              if (code === ConfigProviderService.vals.keyMappings.playAllInView) {
                Soundhandlerservice.playFromTo(viewState.getViewPortStartTime(), viewState.getViewPortEndTime());
              }
              if (code === ConfigProviderService.vals.keyMappings.playSelected) {
                Soundhandlerservice.playFromTo(viewState.getSelectedStartTime(), viewState.getSelectedEndTime());
              }
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortRight) {
                viewState.shiftViewPort(true);
              }
              if (code === ConfigProviderService.vals.keyMappings.zoomAll) {
                viewState.setViewPort(0, viewState.curViewPort.bufferLength);
              }
              if (code === ConfigProviderService.vals.keyMappings.tierUp) {
                $('#HandletiersCtrl').scope().selectTier(false);
              }
              if (code === ConfigProviderService.vals.keyMappings.tierDown) {
                $('#HandletiersCtrl').scope().selectTier(true);
              }
              if (code === ConfigProviderService.vals.keyMappings.tab) {
                if (e.shiftKey)
                  $('#HandletiersCtrl').scope().tabPrev();
                else
                  $('#HandletiersCtrl').scope().tabNext();
              }
              if (code === ConfigProviderService.vals.keyMappings.history) {
                $('#HandletiersCtrl').scope().goBackHistory();
              }
              if (code === ConfigProviderService.vals.keyMappings.backspace) {
                var seg = viewState.getcurClickSegments();
                var toDelete = "";
                for (var i = 0; i < seg.length; i++) {
                  toDelete += seg[i].label + ",";
                }
                toDelete = toDelete.substring(0, toDelete.length - 1);
                scope.openModal('views/deleteSegment.html', 'dialogSmall', toDelete, toDelete);
              }

              if (!e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
              }
              console.log(code);
            }
          });
        });

        //remove binding on destroy
        scope.$on(
          '$destroy',
          function() {
            $(window).off('keydown');
          }
        );
      }
    };
  });