'use strict';

angular.module('emuwebApp')
	.directive('correctiontool', function (viewState, ConfigProviderService, Ssffdataservice, Drawhelperservice, HistoryService, Soundhandlerservice) {
		return {
			restrict: 'A',
			scope: {},
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
						if (!$.isEmptyObject(Ssffdataservice.data)) {
							if (Ssffdataservice.data.length !== 0) {
								// console.log('WHAT?' + val)
								// console.log(atts)
								tr = ConfigProviderService.getSsffTrackConfig('FORMANTS');
								col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
								sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);
							}
						}
					}
				});

				/////////////////////////////
				// Bindings
				element.bind('mousedown', function (event) {
					dragStartSample = Math.round(Drawhelperservice.getX(event) * viewState.getPCMpp(event) + viewState.curViewPort.sS);
					dragEndSample = dragStartSample;
					viewState.select(dragStartSample, dragStartSample);
					Drawhelperservice.drawViewPortTimes(ctx, true);
					scope.$apply();
				});

				element.bind('mousemove', function (event) {

					switch (event.which) {
					case 0:
						if (!$.isEmptyObject(Ssffdataservice.data)) {
							if (Ssffdataservice.data.length !== 0) {

								if (!viewState.getdragBarActive()) {
									// perform mouse tracking
									var mouseX = Drawhelperservice.getX(event);
									viewState.curMousePosSample = Math.round(viewState.curViewPort.sS + mouseX / element[0].width * (viewState.curViewPort.eS - viewState.curViewPort.sS));

									switchMarkupContext(event);

									if (viewState.curCorrectionToolNr !== undefined && !viewState.getdragBarActive() && !$.isEmptyObject(ConfigProviderService.getAssignment(trackName))) {
										// var col = Ssffdataservice.data[0].Columns[0];
										if (tr === undefined) {
											tr = ConfigProviderService.getSsffTrackConfig('FORMANTS');
											col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
											sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);
										}

										var startTimeVP = viewState.getViewPortStartTime();
										var endTimeVP = viewState.getViewPortEndTime();

										var colStartSampleNr = Math.round(startTimeVP * sRaSt.sampleRate + sRaSt.startTime);
										var colEndSampleNr = Math.round(endTimeVP * sRaSt.sampleRate + sRaSt.startTime);
										var nrOfSamples = colEndSampleNr - colStartSampleNr;
										var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);

										// console.log(colStartSampleNr)


										var curMouseTime = startTimeVP + (Drawhelperservice.getX(event) / event.originalEvent.srcElement.width) * (endTimeVP - startTimeVP);
										var curMouseSample = Math.round((curMouseTime + sRaSt.startTime) * sRaSt.sampleRate) - 1; //-1 for in view correction

										var curMouseSampleTime = (1 / sRaSt.sampleRate * curMouseSample) + sRaSt.startTime;


										if (curMouseSample - colStartSampleNr < 0 || curMouseSample - colStartSampleNr >= curSampleArrs.length) {
											console.log('early return');
											return;
										}

										viewState.curPreselColumnSample = curMouseSample - colStartSampleNr;

										var x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
										var y = canvas.height - curSampleArrs[viewState.curPreselColumnSample][viewState.curCorrectionToolNr - 1] / (viewState.spectroSettings.rangeTo - viewState.spectroSettings.rangeFrom) * canvas.height;

										// draw sample
										ctx.strokeStyle = '#0DC5FF';
										ctx.fillStyle = 'white';
										ctx.beginPath();
										ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
										ctx.closePath();
										ctx.stroke();
										ctx.fill();

										if (event.shiftKey) {
											var oldValue = angular.copy(curSampleArrs[viewState.curPreselColumnSample][viewState.curCorrectionToolNr - 1]);
											var newValue = viewState.spectroSettings.rangeTo - Drawhelperservice.getY(event) / event.originalEvent.srcElement.height * viewState.spectroSettings.rangeTo; // SIC only using rangeTo

											curSampleArrs[viewState.curPreselColumnSample][viewState.curCorrectionToolNr - 1] = viewState.spectroSettings.rangeTo - Drawhelperservice.getY(event) / event.originalEvent.srcElement.height * viewState.spectroSettings.rangeTo;
											var updateObj = HistoryService.updateCurChangeObj({
												'type': 'SSFF',
												'trackName': tr.name,
												'sampleBlockIdx': colStartSampleNr + viewState.curPreselColumnSample,
												'sampleIdx': viewState.curCorrectionToolNr - 1,
												'oldValue': oldValue,
												'newValue': newValue
											});

											//draw updateObj as overlay
											for (var key in updateObj) {
												curMouseSampleTime = (1 / sRaSt.sampleRate * updateObj[key].sampleBlockIdx) + sRaSt.startTime;
												x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
												y = canvas.height - updateObj[key].newValue / (viewState.spectroSettings.rangeTo - viewState.spectroSettings.rangeFrom) * canvas.height;

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
						if (!viewState.getdragBarActive()) {
							setSelectDrag(event);
						}
						break;
					}

					scope.$apply();
				});

				element.bind('mouseup', function (event) {
					if (!viewState.getdragBarActive()) {
						setSelectDrag(event);
						switchMarkupContext(event);
					}
				});


				// on mouse leave clear markup canvas
				element.bind('mouseleave', function (event) {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							switchMarkupContext(event, false);
						}
					}
				});

				//
				////////////////////


				function switchMarkupContext(event, leave) {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					// draw current viewport selected
					if (atts.ssffTrackname == 'OSCI') {
						Drawhelperservice.drawViewPortTimes(ctx, true);
						Drawhelperservice.drawCurViewPortSelected(ctx, true);
					} else if (atts.ssffTrackname == 'SPEC') {
						Drawhelperservice.drawCurViewPortSelected(ctx, false);
						Drawhelperservice.drawMinMaxAndName(ctx, '', viewState.spectroSettings.rangeFrom, viewState.spectroSettings.rangeTo, 2);
					} else {
						Drawhelperservice.drawCurViewPortSelected(ctx, false);
						Drawhelperservice.drawMinMaxAndName(ctx, atts.ssffTrackname, viewState.spectroSettings.rangeFrom, viewState.spectroSettings.rangeTo, 2);
					}
					
					// draw crossHairs
					if (leave !== false && ConfigProviderService.vals.restrictions.drawCrossHairs) {
						Drawhelperservice.drawCrossHairs(ctx, event, viewState.spectroSettings.rangeFrom, viewState.spectroSettings.rangeTo, 'Hz');
					}
					// draw moving boundary line if moving
					Drawhelperservice.drawMovingBoundaryLine(ctx);
					
					
					
				}


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