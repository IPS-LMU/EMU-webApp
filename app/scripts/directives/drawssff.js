'use strict';

angular.module('emuwebApp')
  .directive('drawssff', function ($timeout, viewState, ConfigProviderService, Ssffdataservice, HistoryService, fontScaleService, loadedMetaDataService) {
    return {
      restrict: 'A',
      scope: {},
      link: function postLink(scope, element, atts) {
        scope.trackName = atts.ssffTrackname;
        scope.assTrackName = '';
        scope.lastDraw = Date.now();

        // add watch vars to scope
        scope.vs = viewState;
        scope.hists = HistoryService;
        scope.ssffds = Ssffdataservice;
        scope.cps = ConfigProviderService;
        scope.lmds = loadedMetaDataService;

        ////////////////////
        // observes

        // observe attribute
        atts.$observe('ssffTrackname', function (val) {
          scope.trackName = val;
        });

        ////////////////////
        // watches

        //watch viewPort change
        scope.$watch('vs.curViewPort', function (newValue, oldValue) {
          if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
            scope.handleUpdate();
          }
          if (oldValue.windowWidth !== newValue.windowWidth) {
            scope.handleUpdate();
          }
          if (oldValue.dragBarHeight !== newValue.dragBarHeight) {
            scope.handleUpdate();
          }
        }, true);

        //watch perspective change
        scope.$watch('vs.curPerspectiveIdx', function (newValue, oldValue) {
          scope.handleUpdate();
        }, true);

        //watch vs.curCorrectionToolNr change
        scope.$watch('vs.curCorrectionToolNr', function (newValue, oldValue) {
          scope.handleUpdate();
        }, true);

        //watch hists.
        scope.$watch('hists.movesAwayFromLastSave', function (newValue, oldValue) {
          scope.handleUpdate();
        }, true);

        // watch ssffds.data change
        scope.$watch('ssffds.data.length', function (newValue, oldValue) {
          scope.handleUpdate();
        }, true);

        // watch vs.spectroSettings change
        scope.$watch('vs.spectroSettings', function (newValue, oldValue) {
          scope.handleUpdate();
        }, true);

        //
        scope.$watch('vs.submenuOpen', function (oldValue, newValue) {
          if (oldValue !== newValue) {
            $timeout(scope.handleUpdate, ConfigProviderService.design.animation.duration);
          }
        });

        //
        scope.$watch('vs.timelineSize', function (oldValue, newValue) {
          if (oldValue !== newValue) {
            $timeout(scope.handleUpdate, ConfigProviderService.design.animation.duration / 10);
          }
        });

        //
        scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
          if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
            scope.handleUpdate();
          }
        }, true);

        //
        //////////////////////

        /**
         *
         */
        scope.handleUpdate = function () {
          var ctx = element[0].getContext('2d');
          ctx.clearRect(0, 0, element[0].width, element[0].height);

          if (!$.isEmptyObject(Ssffdataservice.data)) {
            if (Ssffdataservice.data.length !== 0) {
              scope.assTrackName = '';
              // check assignments (= overlays)
              ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign.forEach(function (ass, i) {
                if (ass.signalCanvasName === scope.trackName) {
                  scope.assTrackName = ass.ssffTrackName;
                  var tr = ConfigProviderService.getSsffTrackConfig(ass.ssffTrackName);
                  var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
                  var sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);
                  var minMaxLims = ConfigProviderService.getLimsOfTrack(tr.name);
                  // draw values  
                  scope.drawValues(viewState, element[0], ConfigProviderService, col, sRaSt.sampleRate, sRaSt.startTime, minMaxLims);
                }
              });
              scope.assTrackName = '';
              // draw ssffTrack onto own canvas
              if (scope.trackName !== 'OSCI' && scope.trackName !== 'SPEC') {

                var tr = ConfigProviderService.getSsffTrackConfig(scope.trackName);
                var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
                var sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);

                var minMaxLims = ConfigProviderService.getLimsOfTrack(tr.name);
                // draw values  
                scope.drawValues(viewState, element[0], ConfigProviderService, col, sRaSt.sampleRate, sRaSt.startTime, minMaxLims);
              }
            }
          } else {
            ctx.clearRect(0, 0, element[0].width, element[0].height);
          }
        };

        /**
         * draw values onto canvas
         */
        scope.drawValues = function (viewState, canvas, config, col, sR, sT, minMaxLims) {

            var ctx = canvas.getContext('2d');
            var minVal, maxVal;

            if (scope.trackName === 'SPEC' && scope.assTrackName === 'FORMANTS') {
              minVal = viewState.spectroSettings.rangeFrom;
              maxVal = viewState.spectroSettings.rangeTo;
            } else {
              minVal = col._minVal;
              maxVal = col._maxVal;
            }
            var startTimeVP = viewState.getViewPortStartTime();
            var endTimeVP = viewState.getViewPortEndTime();
            var colStartSampleNr = Math.round(startTimeVP * sR + sT);
            var colEndSampleNr = Math.round(endTimeVP * sR + sT);
            var nrOfSamples = colEndSampleNr - colStartSampleNr;
            var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);

            if (nrOfSamples < canvas.width && nrOfSamples >= 2) {

              var x, y, prevX, prevY, prevVal, curSampleInCol, curSampleInColTime;

              ////////////////////////////////
              // NEW VERSION
              ////////////////////////////////

              angular.forEach(curSampleArrs[0], function (contourVal, contourNr) {



                // console.log(contourNr);
                if ($.isEmptyObject(minMaxLims) || (contourNr >= minMaxLims.minContourIdx && contourNr <= minMaxLims.maxContourIdx)) {

                  // set color
                  if ($.isEmptyObject(minMaxLims)) {
                    ctx.strokeStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
                    ctx.fillStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
                  } else {
                    var l = (minMaxLims.maxContourIdx - minMaxLims.minContourIdx) + 1;
                    ctx.strokeStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
                    ctx.fillStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
                  }

                  // overwrite color settings if they are preconfigured
                  var contColors = ConfigProviderService.getContourColorsOfTrack(scope.assTrackName);
                  if (contColors !== undefined) {
                    if (contColors.colors[contourNr] !== undefined) {
                      ctx.strokeStyle = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.contourColors[0].colors[contourNr];
                      ctx.fillStyle = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.contourColors[0].colors[contourNr];
                    }
                  }

                  // mark selected
                  // console.log(viewState.curCorrectionToolNr);
                  if (viewState.curCorrectionToolNr - 1 === contourNr && scope.trackName === 'SPEC' && scope.assTrackName === 'FORMANTS') {
                    ctx.strokeStyle = ConfigProviderService.vals.colors.selectedContourColor;
                    ctx.fillStyle = ConfigProviderService.vals.colors.selectedContourColor;
                  }

                  ctx.beginPath();
                  // first line from sample not in view (left)
                  if (colStartSampleNr >= 1) {
                    var leftBorder = col.values[colStartSampleNr - 1];
                    var leftVal = leftBorder[contourNr];

                    curSampleInCol = colStartSampleNr - 1;
                    curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                    x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                    y = canvas.height - ((leftVal - minVal) / (maxVal - minVal) * canvas.height);

                    ctx.moveTo(x, y);
                  }

                  angular.forEach(curSampleArrs, function (curArr, curArrIdx) {
                    // console.log(curArr[contourNr]);

                    curSampleInCol = colStartSampleNr + curArrIdx;
                    curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                    x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                    y = canvas.height - ((curArr[contourNr] - minVal) / (maxVal - minVal) * canvas.height);

                    ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
                    ctx.lineTo(x, y);

                  });
                  // last line from sample not in view (right)
                  if (colEndSampleNr < col.values.length - 1) {
                    var rightBorder = col.values[colEndSampleNr + 1];
                    var rightVal = rightBorder[contourNr];

                    curSampleInCol = colEndSampleNr + 1;
                    curSampleInColTime = (1 / sR * curSampleInCol) + sT;

                    x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
                    y = canvas.height - ((rightVal - minVal) / (maxVal - minVal) * canvas.height);

                    ctx.lineTo(x, y);
                  }

                  ctx.stroke();
                  // ctx.fill();
                }
              });
            } else {
              ctx.strokeStyle = 'red';
              var txt;
              // var tW;
              var horizontalText;
              
              if (nrOfSamples <= 2) {
                horizontalText = fontScaleService.getTextImageTwoLines(ctx, 'Zoom out to', 'see contour(s)', ConfigProviderService.design.font.small.size.slice(0,-2), ConfigProviderService.design.font.large.family, ConfigProviderService.design.color.red);
                // ctx.fillStyle = ConfigProviderService.vals.colors.levelColor;
                // ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, canvas.width / 2 - horizontalText.width / 2, 25, horizontalText.width, horizontalText.height);
              } else {
                txt = 'Zoom in to see contour(s)';
                horizontalText = fontScaleService.getTextImageTwoLines(ctx, 'Zoom in to', 'see contour(s)', ConfigProviderService.design.font.small.size.slice(0,-2), ConfigProviderService.design.font.large.family, ConfigProviderService.design.color.transparent.red);
                // ctx.fillStyle = ConfigProviderService.vals.colors.levelColor;
                // ctx.fillRect(0, 0, canvas.width, canvas.height);              
                ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, canvas.width / 2 - horizontalText.width / 2, 25, horizontalText.width, horizontalText.height);
              }
            }
          } //function
      }
    };
  });
