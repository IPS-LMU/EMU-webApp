'use strict';

angular.module('emuwebApp')
  .directive('trackmouse', function (viewState, ConfigProviderService, Ssffdataservice, Drawhelperservice) {
    return {
      restrict: 'A',
      scope: {},
      link: function (scope, element, atts) {

        var curMouseSample;
        var dragStartSample;
        var dragEndSample;
        var trackName;
        var tr, col, sRaSt;
        var min, max, unit, drawTimes, tN;

        var canvas = element[0];
        var ctx = canvas.getContext('2d');

        /////////////////////////////
        // observe attribute
        atts.$observe('ssffTrackname', function (val) {
          if (val) {
            trackName = val;
          }
        });


        /////////////////////////////
        // Bindings
        element.bind('mousedown', function (event) {
          dragStartSample = Math.round(Drawhelperservice.getX(event) * viewState.getPCMpp(event) + viewState.curViewPort.sS);
          dragEndSample = dragStartSample;
          viewState.select(dragStartSample, dragStartSample);
          scope.$apply();
        });

        element.bind('mousemove', function (event) {
          switch (event.which) {
          case 0:
            if (!$.isEmptyObject(Ssffdataservice.data)) {
              if (Ssffdataservice.data.length !== 0) {
                if (!viewState.getdragBarActive()) {
                  if (tr === undefined && trackName !== 'OSCI') {
                    tr = ConfigProviderService.getSsffTrackConfig(trackName);
                    col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
                    sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);
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
                    min = viewState.spectroSettings.rangeFrom;
                    max = viewState.spectroSettings.rangeTo;
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
                  var mouseX = Drawhelperservice.getX(event);
                  viewState.curMousePosSample = Math.round(viewState.curViewPort.sS + mouseX / element[0].width * (viewState.curViewPort.eS - viewState.curViewPort.sS));

                  // drawing stuff on mouse move 
                  ctx.clearRect(0, 0, canvas.width, canvas.height);

                  // draw crossHairs
                  if (ConfigProviderService.vals.restrictions.drawCrossHairs) {
                    Drawhelperservice.drawCrossHairs(ctx, event, min, max, unit);
                  }
                  // draw moving boundary line if moving
                  Drawhelperservice.drawMovingBoundaryLine(ctx);

                  // draw current viewport selected
                  Drawhelperservice.drawCurViewPortSelected(ctx, drawTimes);

                  // draw min max vals and name of track
                  Drawhelperservice.drawMinMaxAndName(ctx, tN, min, max, 2);

                  // draw view port times
                  if (drawTimes) {
                    Drawhelperservice.drawViewPortTimes(ctx);
                  }


                  scope.$apply();
                }
              }
            }
            break;

          case 1:
            if (!viewState.getdragBarActive()) {
              setSelectDrag(event);
            }
            break;
          }
        });

        // clean up on mouse leave
        element.bind('mouseleave', function (event) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // draw moving boundary line if moving
          Drawhelperservice.drawMovingBoundaryLine(ctx);

          // draw current viewport selected
          Drawhelperservice.drawCurViewPortSelected(ctx, drawTimes);

          // draw min max vals and name of track
          Drawhelperservice.drawMinMaxAndName(ctx, tN, min, max, 2);

          // draw view port times
          if (drawTimes) {
            Drawhelperservice.drawViewPortTimes(ctx);
          }
        })

        element.bind('mouseup', function (event) {
          if (!viewState.getdragBarActive()) {
            setSelectDrag(event);
          }
        });

        //
        //////////////////////

        function setSelectDrag(event) {
          curMouseSample = Math.round(Drawhelperservice.getX(event) * viewState.getPCMpp(event) + viewState.curViewPort.sS);
          if (curMouseSample > dragStartSample) {
            dragEndSample = curMouseSample;
            viewState.select(dragStartSample, dragEndSample);
          } else {
            dragStartSample = curMouseSample;
            viewState.select(dragStartSample, dragEndSample);
          }
          scope.$apply();
        }

      }
    };
  });