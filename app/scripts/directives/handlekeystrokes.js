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
            if (viewState.focusInTextField) {
              // disable keys when focus is in comment text filed
              
              // enable enter and escape when in editing mode
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
            }              
              
              
            }
            else {
              // delegate keyboard keyMappings according to keyMappings of scope
              // shiftViewPortLeft
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortLeft) {
                viewState.shiftViewPort(false);
              }
              // shiftViewPortRight
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortRight) {
                viewState.shiftViewPort(true);
              }
              // zoomOut
              if (code === ConfigProviderService.vals.keyMappings.zoomOut) {
                viewState.zoomViewPort(false);
              }
              // zoomSel
              if (code === ConfigProviderService.vals.keyMappings.zoomSel) {
                viewState.setViewPort(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
              }
              // selectFirstContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectFirstContourCorrectionTool) {
                viewState.curCorrectionToolNr = 1;
              }
              // selectSecondContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectSecondContourCorrectionTool) {
                viewState.curCorrectionToolNr = 2;
              }
              // selectThirdContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectThirdContourCorrectionTool) {
                viewState.curCorrectionToolNr = 3;
              }
              // selectFourthContourCorrectionTool
              if (code === ConfigProviderService.vals.keyMappings.selectFourthContourCorrectionTool) {
                viewState.curCorrectionToolNr = 4;
              }
              // zoomIn
              if (code === ConfigProviderService.vals.keyMappings.zoomIn) {
                viewState.zoomViewPort(true);
              }
              // playEntireFile
              if (code === ConfigProviderService.vals.keyMappings.playEntireFile) {
                Soundhandlerservice.playFromTo(0, Soundhandlerservice.wavJSO.Data.length);
                viewState.animatePlayHead(0, Soundhandlerservice.wavJSO.Data.length);
              }
              // playAllInView
              if (code === ConfigProviderService.vals.keyMappings.playAllInView) {
                Soundhandlerservice.playFromTo(viewState.curViewPort.sS, viewState.curViewPort.eS);
                viewState.animatePlayHead(viewState.curViewPort.sS, viewState.curViewPort.eS);
              }
              // playSelected
              if (code === ConfigProviderService.vals.keyMappings.playSelected) {
                Soundhandlerservice.playFromTo(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
                viewState.animatePlayHead(viewState.curViewPort.selectS, viewState.curViewPort.selectE);
              }
              // shiftViewPortRight
              if (code === ConfigProviderService.vals.keyMappings.shiftViewPortRight) {
                viewState.shiftViewPort(true);
              }
              // zoomAll
              if (code === ConfigProviderService.vals.keyMappings.zoomAll) {
                viewState.setViewPort(0, viewState.curViewPort.bufferLength);
              }
              // tierUp
              if (code === ConfigProviderService.vals.keyMappings.tierUp) {
                $('#HandletiersCtrl').scope().selectTier(false);
              }
              // tierDown
              if (code === ConfigProviderService.vals.keyMappings.tierDown) {
                $('#HandletiersCtrl').scope().selectTier(true);
              }
              // openSubmenu
              if (code === ConfigProviderService.vals.keyMappings.openSubmenu) {
                scope.openSubmenu();
              } 
              // openSubmenu
              if (code === ConfigProviderService.vals.keyMappings.spectroSettings) {
                scope.openModal('views/spectroSettings.html','dialog');
              }              
              // tab
              if (code === ConfigProviderService.vals.keyMappings.tab) {
                if (e.shiftKey)
                  $('#HandletiersCtrl').scope().tabPrev();
                else
                  $('#HandletiersCtrl').scope().tabNext();
              }
              // history
              if (code === ConfigProviderService.vals.keyMappings.history) {
                $('#HandletiersCtrl').scope().goBackHistory();
              }
              // backspace
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