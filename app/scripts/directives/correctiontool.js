'use strict';

angular.module('emuwebApp')
	.directive('correctiontool', function () {
		return {
			restrict: 'A',
			link: function (scope, element, atts) {

				var curMouseSample;
				var dragStartSample;
				var dragEndSample;

				var canvas = element[0];
								
				var ctx = canvas.getContext('2d');
				// var elem = element[0];
				var tr, col, sRaSt;
				var trackName;
				var bundleName;
				
				/////////////////////////////
				// observe attribute
				atts.$observe('ssffTrackname', function (val) {
					if (val) {
						trackName = val;
					}
				});

				// bundleName needed to reset tr, col, sRaSt on bundle change
				atts.$observe('bundleName', function (val) {
					if (val) {
						bundleName = val;
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								tr = scope.cps.getSsffTrackConfig('FORMANTS');
								col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
								sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);
							}
						}
					}
				});

				/////////////////////////////
				// Bindings
				element.bind('mousedown', function (event) {
					dragStartSample = Math.round(scope.dhs.getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS);
					dragEndSample = dragStartSample;
					scope.vs.select(dragStartSample, dragStartSample);
					scope.dhs.drawViewPortTimes(ctx, true);
					scope.$apply();
				});

				element.bind('mousemove', function (event) {
				    
					switch (event.which) {
					case 0:
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {

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

									switchMarkupContext();
									


									if (scope.vs.curCorrectionToolNr !== undefined && !scope.vs.getdragBarActive() && !$.isEmptyObject(scope.cps.getAssignment(trackName))) {
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

										// console.log(colStartSampleNr)


										var curMouseTime = startTimeVP + (scope.dhs.getX(event) / event.originalEvent.srcElement.width) * (endTimeVP - startTimeVP);
										var curMouseSample = Math.round((curMouseTime + sRaSt.startTime) * sRaSt.sampleRate) - 1; //-1 for in view correction

										var curMouseSampleTime = (1 / sRaSt.sampleRate * curMouseSample) + sRaSt.startTime;


										if (curMouseSample - colStartSampleNr < 0 || curMouseSample - colStartSampleNr >= curSampleArrs.length) {
											console.log('early return');
											return;
										}

										scope.vs.curPreselColumnSample = curMouseSample - colStartSampleNr;

										var x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
										var y = canvas.height - curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1] / (scope.vs.spectroSettings.rangeTo - scope.vs.spectroSettings.rangeFrom) * canvas.height;

										// draw sample
										ctx.strokeStyle = '#0DC5FF';
										ctx.fillStyle = 'white';
										ctx.beginPath();
										ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
										ctx.closePath();
										ctx.stroke();
										ctx.fill();

										if (event.shiftKey) {
											var oldValue = angular.copy(curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1]);
											var newValue = scope.vs.spectroSettings.rangeTo - scope.dhs.getY(event) / event.originalEvent.srcElement.height * scope.vs.spectroSettings.rangeTo; // SIC only using rangeTo

											curSampleArrs[scope.vs.curPreselColumnSample][scope.vs.curCorrectionToolNr - 1] = scope.vs.spectroSettings.rangeTo - scope.dhs.getY(event) / event.originalEvent.srcElement.height * scope.vs.spectroSettings.rangeTo;
											var updateObj = scope.hists.updateCurChangeObj({
												'type': 'SSFF',
												'trackName': tr.name,
												'sampleBlockIdx': colStartSampleNr + scope.vs.curPreselColumnSample,
												'sampleIdx': scope.vs.curCorrectionToolNr - 1,
												'oldValue': oldValue,
												'newValue': newValue
											});

											//draw updateObj as overlay
											for (var key in updateObj) {
												curMouseSampleTime = (1 / sRaSt.sampleRate * updateObj[key].sampleBlockIdx) + sRaSt.startTime;
												x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
												y = canvas.height - updateObj[key].newValue / (scope.vs.spectroSettings.rangeTo - scope.vs.spectroSettings.rangeFrom) * canvas.height;

												// draw sample
												ctx.strokeStyle = 'red';
												ctx.fillStyle = 'red';
												// ctx.lineWidth = 4;
												ctx.beginPath();
												ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
												ctx.closePath();
												ctx.stroke();
												ctx.fill();
											}


										}
									}
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
					
					scope.$apply();
				});

				element.bind('mouseup', function (event) {
					if (!scope.vs.getdragBarActive()) {
						setSelectDrag(event);
						switchMarkupContext();
					}
				});
				

				// on mouse leave clear markup canvas
				element.bind('mouseleave', function () {
				    if (!$.isEmptyObject(scope.shs)) {
				        if (!$.isEmptyObject(scope.shs.wavJSO)) {
				            switchMarkupContext();
				        }
				    }
				});					

				//
				////////////////////
				
				
				function switchMarkupContext() {
				    ctx.clearRect(0, 0, canvas.width, canvas.height);
					// draw current viewport selected
					if(atts.ssffTrackname=="OSCI") {
						scope.dhs.drawViewPortTimes(ctx, true);
					    scope.dhs.drawCurViewPortSelected(ctx, true);
					}
					else if(atts.ssffTrackname=="SPEC") {
						scope.dhs.drawCurViewPortSelected(ctx, false);
					    scope.dhs.drawMinMaxAndName(ctx, '', scope.vs.spectroSettings.rangeFrom, scope.vs.spectroSettings.rangeTo, 2);
					}
					else {
						scope.dhs.drawCurViewPortSelected(ctx, false);
						scope.dhs.drawMinMaxAndName(ctx, '', scope.vs.spectroSettings.rangeFrom, scope.vs.spectroSettings.rangeTo, 2);
					}				
				}
				

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