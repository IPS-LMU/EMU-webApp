'use strict';

angular.module('emuwebApp')
  .directive('ssffTrack', function (viewState, ConfigProviderService) {
    return {
      templateUrl: 'views/ssffTrack.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        // select the needed DOM elements from the template
        var canvasLength = element.find('canvas').length;
        var ssffCanvas = element.find('canvas')[1];
        var markupCanvas = element.find('canvas')[canvasLength - 1];
        // var context = canvas0.getContext('2d');
        var markupCtx = markupCanvas.getContext('2d');

        var trackName;

        attrs.$observe('trackName', function (val) {
          if (val) {
            trackName = val;
          }
        });


        scope.order = attrs.order;

        scope.enlargeCanvas = {
          'height': 100 / ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length + '%'
        };

        
        
        
        /////////////////////
        // watches

		//
		scope.$watch('vs.timelineSize', function () {
    		scope.updateCSS();  
		}); 

        scope.$watch('vs.curPerspectiveIdx', function () {
          scope.updateCSS();
        }, true);

        scope.$watch('vs.curViewPort', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              drawSsffTrackMarkup();
              // scope.updateCSS();
            }
          }
        }, true);

        scope.$watch('ssffds.data.length', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              drawSsffTrackMarkup();
              scope.updateCSS();
            }
          }
        }, true);

        scope.$watch('vs.movingBoundary', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              drawSsffTrackMarkup();
            }
          }
        }, true);


        scope.$watch('vs.movingBoundarySample', function () {
          if (!$.isEmptyObject(scope.shs)) {
            if (!$.isEmptyObject(scope.shs.wavJSO)) {
              drawSsffTrackMarkup();
            }
          }
        }, true);


        //
        /////////////////////
        
        scope.redraw = function () {
          drawSsffTrackMarkup();
          scope.updateCSS();
        };
        
        /**
         *
         */
        scope.updateCSS = function () {
          var parts = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length;
          if (viewState.getenlarge() === -1) {
            scope.enlargeCanvas = {
              'height': 100 / parts + '%'
            };
          } else {
            if (viewState.getenlarge() === scope.order) {
              scope.enlargeCanvas = {
                'height': 3 * 100 / (parts + 2) + '%'
              };
            } else {
              scope.enlargeCanvas = {
                'height': 100 / (parts + 2) + '%'
              };
            }
          }
        };

        /**
         *
         */
        function drawSsffTrackMarkup() {
          if (!$.isEmptyObject(scope.ssffds.data)) {
            if (scope.ssffds.data.length !== 0) {

              markupCtx.clearRect(0, 0, markupCtx.canvas.width, markupCtx.canvas.height);

              // draw moving boundary line if moving
              scope.dhs.drawMovingBoundaryLine(markupCtx);

              // draw current viewport selected
              scope.dhs.drawCurViewPortSelected(markupCtx, false);

              // draw min max an name of track
              var tr = scope.cps.getSsffTrackConfig(trackName);
              var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
              scope.dhs.drawMinMaxAndName(markupCtx, trackName, col._minVal, col._maxVal, 2);
            }
          }

        }


      }
    };
  });