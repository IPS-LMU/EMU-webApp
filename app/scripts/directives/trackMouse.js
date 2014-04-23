'use strict';

angular.module('emuwebApp')
  .directive('trackmouse', function () {
    return {
      restrict: 'A',
      link: function (scope, element, atts) {

        var curMouseSample;
        var dragStartSample;
        var dragEndSample;
        var trackName;
        var tr, col, sRaSt;
        var min, max, unit, drawTimes, tN;

        var canvas = element[0];
        var ctx = canvas.getContext('2d');

        // observe attribute
        atts.$observe('ssffTrackname', function (val) {
          if (val) {
            trackName = val;
          }
        });

        element.bind('mousedown', function (event) {
          dragStartSample = Math.round(scope.dhs.getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS);
          dragEndSample = dragStartSample;
          scope.vs.select(dragStartSample, dragStartSample);
          scope.$apply();
        });

        element.bind('mousemove', function (event) {
          switch (event.which) {
          case 0:
            if (!$.isEmptyObject(scope.ssffds.data)) {
              if (scope.ssffds.data.length !== 0) {
                if (!scope.vs.getdragBarActive()) {
                  if (tr === undefined && trackName !== 'OSCI') {
                    tr = scope.cps.getSsffTrackConfig(trackName);
                    col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
                    sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);
                  }

                  switch (trackName) {
                  case 'OSCI':
                    min = undefined;
                    max = undefined;
                    unit = undefined;
                    drawTimes = true;
                    tN = '';
                    break;
                  case 'SPEC':
                    min = scope.vs.spectroSettings.rangeFrom;
                    max = scope.vs.spectroSettings.rangeTo;
                    unit = 'Hz';
                    drawTimes = false;
                    tN = trackName;
                    break;
                  default:
                    min = col._minVal;
                    max = col._maxVal;
                    unit = '';
                    drawTimes = false;
                    tN = trackName;
                    break;
                  }

                  // console.log(event);
                  var mouseX = scope.dhs.getX(event);
                  scope.vs.curMousePosSample = Math.round(scope.vs.curViewPort.sS + mouseX / element[0].width * (scope.vs.curViewPort.eS - scope.vs.curViewPort.sS));

                  // drawing stuff on mouse move 
                  ctx.clearRect(0, 0, canvas.width, canvas.height);

                  // draw crossHairs
                  if (scope.cps.vals.restrictions.drawCrossHairs) {
                    scope.dhs.drawCrossHairs(ctx, event, min, max, unit);
                  }
                  // draw moving boundary line if moving
                  scope.dhs.drawMovingBoundaryLine(ctx);

                  // draw current viewport selected
                  scope.dhs.drawCurViewPortSelected(ctx, drawTimes);

                  // draw min max vals and name of track
                  scope.dhs.drawMinMaxAndName(ctx, tN, min, max, 2);

                  // draw view port times
                  if (drawTimes) {
                    scope.dhs.drawViewPortTimes(ctx);
                  }


                  scope.$apply();
                }
              }
            }
            break;

          case 1:
            if (!scope.vs.getdragBarActive()) {
              setSelectDrag(event);
            }
            break;
          }
        });

        // clean up on mouse leave
        element.bind('mouseleave', function (event) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // draw moving boundary line if moving
          scope.dhs.drawMovingBoundaryLine(ctx);

          // draw current viewport selected
          scope.dhs.drawCurViewPortSelected(ctx, drawTimes);

          // draw min max vals and name of track
          scope.dhs.drawMinMaxAndName(ctx, tN, min, max, 2);

          // draw view port times
          if (drawTimes) {
            scope.dhs.drawViewPortTimes(ctx);
          }
        })

        element.bind('mouseup', function (event) {
          if (!scope.vs.getdragBarActive()) {
            setSelectDrag(event);
          }
        });

        function setSelectDrag(event) {
          curMouseSample = Math.round(scope.dhs.getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS);
          if (curMouseSample > dragStartSample) {
            dragEndSample = curMouseSample;
            scope.vs.select(dragStartSample, dragEndSample);
          } else {
            dragStartSample = curMouseSample;
            scope.vs.select(dragStartSample, dragEndSample);
          }
          scope.$apply();
        }

      }
    };
  });