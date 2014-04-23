'use strict';

angular.module('emuwebApp')
	.directive('correctiontool', function () {
		return {
			restrict: 'A',
			link: function (scope, element) {

				var curMouseSample;
				var dragStartSample;
				var dragEndSample;

				var canvas = element[0];
				var ctx = canvas.getContext('2d');
				// var elem = element[0];
				var tr, col, sRaSt;

				element.bind('mousedown', function (event) {
					dragStartSample = Math.round(scope.dhs.getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS);
					dragEndSample = dragStartSample;
					scope.vs.select(dragStartSample, dragStartSample);
					scope.$apply();
				});

				element.bind('mousemove', function (event) {
					console.log(event.which);
					switch (event.which) {
					case 0:
						if (!scope.vs.getdragBarActive()) {
							// perform mouse tracking
							var mouseX = scope.dhs.getX(event);
							scope.vs.curMousePosSample = Math.round(scope.vs.curViewPort.sS + mouseX / element[0].width * (scope.vs.curViewPort.eS - scope.vs.curViewPort.sS));


							ctx.clearRect(0, 0, canvas.width, canvas.height);
							// draw crossHairs
							if (scope.cps.vals.restrictions.drawCrossHairs) {
								scope.dhs.drawCrossHairs(ctx, event, scope.vs.spectroSettings.rangeFrom, scope.vs.spectroSettings.rangeTo, 'Hz');
							}
							// draw moving boundary line if moving
							scope.dhs.drawMovingBoundaryLine(ctx);

							// draw current viewport selected
							scope.dhs.drawCurViewPortSelected(ctx, false);

							// draw min max vals and name of track
							scope.dhs.drawMinMaxAndName(ctx, '', scope.vs.spectroSettings.rangeFrom, scope.vs.spectroSettings.rangeTo, 2);



							if (scope.vs.curCorrectionToolNr !== undefined && !scope.vs.getdragBarActive()) {
								// var col = scope.ssffds.data[0].Columns[0];
								if (tr === undefined) {
									tr = scope.cps.getSsffTrackConfig('FORMANTS');
									col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
									sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);
								}
								var startTimeVP = scope.vs.getViewPortStartTime();
								var endTimeVP = scope.vs.getViewPortEndTime();

								var colStartSampleNr = Math.round(startTimeVP * sRaSt.sampleRate + sRaSt.startTime);
								var colEndSampleNr = Math.round(endTimeVP * sRaSt.sampleRate + sRaSt.startTime);
								var nrOfSamples = colEndSampleNr - colStartSampleNr;
								var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);


								var curMouseTime = startTimeVP + (scope.dhs.getX(event) / event.originalEvent.srcElement.width) * (endTimeVP - startTimeVP);
								var curMouseSample = Math.round((curMouseTime + sRaSt.startTime) * sRaSt.sampleRate);


								if (curMouseSample - colStartSampleNr <= 0 || curMouseSample - colStartSampleNr >= curSampleArrs.length) {
									return;
								}

								scope.vs.curPreselColumnSample = curMouseSample - colStartSampleNr; //-1 for in view correction

								// console.log(scope.vs.curPreselColumnSample);
								// console.log(curSampleArrs.length)

								// draw preselected sample
								var half = (1 / curSampleArrs.length) * canvas.width / 2;
								var x = (scope.vs.curPreselColumnSample / curSampleArrs.length) * canvas.width - half;

								var y = canvas.height - curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1] / (scope.vs.spectroSettings.rangeTo - scope.vs.spectroSettings.rangeFrom) * canvas.height;

								// draw sample
								ctx.strokeStyle = '#0DC5FF';
								ctx.fillStyle = 'white';
								// ctx.lineWidth = 4;
								ctx.beginPath();
								ctx.arc(x, y - 2, 4, 0, 2 * Math.PI, false);
								ctx.closePath();
								ctx.stroke();
								ctx.fill();

								// console.log(scope.vs.curPreselColumnSample);

								if (event.shiftKey) {
									var oldValue = angular.copy(curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1]);
									var newValue = scope.vs.spectroSettings.rangeTo - scope.dhs.getY(event) / event.originalEvent.srcElement.height * scope.vs.spectroSettings.rangeTo; // SIC only using rangeTo
									// 	// console.log('##########################');
									// 	// console.log(colStartSampleNr + scope.vs.curPreselColumnSample);
									// 	// console.log(scope.vs.curCorrectionToolNr - 1);
									// 	// console.log(oldValue);
									// 	// console.log(newValue);
									curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1] = scope.vs.spectroSettings.rangeTo - scope.dhs.getY(event) / event.originalEvent.srcElement.height * scope.vs.spectroSettings.rangeTo;
									var updateObj = scope.hists.updateCurChangeObj({
										'type': 'SSFF',
										'ssffIdx': 0, // SIC hardcoded
										'colIdx': 0, // SIC hardcoded
										'sampleBlockIdx': colStartSampleNr + scope.vs.curPreselColumnSample,
										'sampleIdx': scope.vs.curCorrectionToolNr - 1,
										'oldValue': oldValue,
										'newValue': newValue
									});

									console.log('###############');
									//draw updateObj as overlay
									for (var key in updateObj) {
										console.log(updateObj[key].newValue);
									}


								}
								scope.$apply();
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