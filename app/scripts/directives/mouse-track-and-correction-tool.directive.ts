import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('mouseTrackAndCorrectionTool', function (ViewStateService, ConfigProviderService, SsffDataService, DrawHelperService, HistoryService, SoundHandlerService) {
		return {
			restrict: 'A',
			scope: {},
			link: function (scope, element, atts) {

				var curMouseSample;
				var canvas = element[0];
				var ctx = canvas.getContext('2d');
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
						if (!$.isEmptyObject(SsffDataService.data)) {
							if (SsffDataService.data.length !== 0) {
								tr = ConfigProviderService.getSsffTrackConfig('FORMANTS');
								if (tr !== undefined) {
									col = SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
									sRaSt = SsffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
								}
							}
						}
					}
				});


				/////////////////////////////
				// Bindings
				element.bind('mousedown', function (event) {
					if(!event.shiftKey){
						ViewStateService.curViewPort.movingS = Math.round(ViewStateService.getX(event) * ViewStateService.getSamplesPerPixelVal(event) + ViewStateService.curViewPort.sS);
						ViewStateService.curViewPort.movingE = ViewStateService.curViewPort.movingS;
						ViewStateService.select(ViewStateService.curViewPort.movingS, ViewStateService.curViewPort.movingE);
						scope.switchMarkupContext(event);
						scope.$apply();
					}
				});


				element.bind('mouseup', function (event) {
					if(event.shiftKey){
						var curSample = Math.round(ViewStateService.getX(event) * ViewStateService.getSamplesPerPixelVal(event) + ViewStateService.curViewPort.sS);
						var selectDist = ViewStateService.curViewPort.selectE - ViewStateService.curViewPort.selectS;
						if(curSample <= ViewStateService.curViewPort.selectS + selectDist/2){
							ViewStateService.curViewPort.selectS = curSample;
						}
						// expand right
						if(curSample >= ViewStateService.curViewPort.selectE - selectDist/2){
							ViewStateService.curViewPort.selectE = curSample;
						}
						scope.switchMarkupContext(event);
						scope.$apply();
					}
				});


				element.bind('mousemove', function (event) {
					var mbutton = 0;
					if (event.buttons === undefined) {
						mbutton = event.which;
					} else {
						mbutton = event.buttons;
					}
					// perform mouse tracking
					var mouseX = ViewStateService.getX(event);
					ViewStateService.curMouseX = mouseX;
					ViewStateService.curMouseTrackName = trackName;
					ViewStateService.curMousePosSample = Math.round(ViewStateService.curViewPort.sS + mouseX / element[0].width * (ViewStateService.curViewPort.eS - ViewStateService.curViewPort.sS));

					switch (mbutton) {
						case 0:
							if (ViewStateService.getPermission('labelAction')) {
								scope.switchMarkupContext(event);
								if (!$.isEmptyObject(SsffDataService.data)) {
									if (SsffDataService.data.length !== 0) {
										if (!ViewStateService.getdragBarActive()) {
											if (ViewStateService.curCorrectionToolNr !== undefined && !ViewStateService.getdragBarActive() && !$.isEmptyObject(ConfigProviderService.getAssignment(trackName))) {
												// var col = SsffDataService.data[0].Columns[0];
												if (tr === undefined) {
													tr = ConfigProviderService.getSsffTrackConfig('FORMANTS');
												}
												col = SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
												sRaSt = SsffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
												var startTimeVP = ViewStateService.getViewPortStartTime();
												var endTimeVP = ViewStateService.getViewPortEndTime();
												var colStartSampleNr = Math.round(startTimeVP * sRaSt.sampleRate + sRaSt.startTime);
												var colEndSampleNr = Math.round(endTimeVP * sRaSt.sampleRate + sRaSt.startTime);
												var nrOfSamples = colEndSampleNr - colStartSampleNr;
												var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
												var curMouseTime = startTimeVP + (ViewStateService.getX(event) / event.originalEvent.target.width) * (endTimeVP - startTimeVP);
												var curMouseSample = Math.round((curMouseTime + sRaSt.startTime) * sRaSt.sampleRate) - 1; //-1 for in view correction
												var curMouseSampleTime = (1 / sRaSt.sampleRate * curMouseSample) + sRaSt.startTime;
												if (curMouseSample - colStartSampleNr < 0 || curMouseSample - colStartSampleNr >= curSampleArrs.length) {
													//console.log('early return');
													return;
												}
												ViewStateService.curPreselColumnSample = curMouseSample - colStartSampleNr;
												var x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
												var y = canvas.height - curSampleArrs[ViewStateService.curPreselColumnSample][ViewStateService.curCorrectionToolNr - 1] / (ViewStateService.spectroSettings.rangeTo - ViewStateService.spectroSettings.rangeFrom) * canvas.height;

												// draw sample
												ctx.strokeStyle = 'black';
												ctx.fillStyle = 'black';
												ctx.beginPath();
												ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
												ctx.closePath();
												ctx.stroke();
												ctx.fill();


												if (event.shiftKey) {
													var oldValue = angular.copy(curSampleArrs[ViewStateService.curPreselColumnSample][ViewStateService.curCorrectionToolNr - 1]);
													var newValue = ViewStateService.spectroSettings.rangeTo - ViewStateService.getY(event) / event.originalEvent.target.height * ViewStateService.spectroSettings.rangeTo; // SIC only using rangeTo

													curSampleArrs[ViewStateService.curPreselColumnSample][ViewStateService.curCorrectionToolNr - 1] = ViewStateService.spectroSettings.rangeTo - ViewStateService.getY(event) / event.originalEvent.target.height * ViewStateService.spectroSettings.rangeTo;
													var updateObj = HistoryService.updateCurChangeObj({
														'type': 'SSFF',
														'trackName': tr.name,
														'sampleBlockIdx': colStartSampleNr + ViewStateService.curPreselColumnSample,
														'sampleIdx': ViewStateService.curCorrectionToolNr - 1,
														'oldValue': oldValue,
														'newValue': newValue
													});

													//draw updateObj as overlay
													for (var key in updateObj) {
														curMouseSampleTime = (1 / sRaSt.sampleRate * updateObj[key].sampleBlockIdx) + sRaSt.startTime;
														x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
														y = canvas.height - updateObj[key].newValue / (ViewStateService.spectroSettings.rangeTo - ViewStateService.spectroSettings.rangeFrom) * canvas.height;

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
							}
							break;
						case 1:
							if (!ViewStateService.getdragBarActive()) {
								scope.setSelectDrag(event);
							}
							break;
					}
					scope.$apply();
				});
				/*
				 element.bind('mouseup', function (event) {
				 if (!ViewStateService.getdragBarActive()) {
				 scope.setSelectDrag(event);
				 scope.switchMarkupContext(event, false);
				 }
				 });
				 */
				// on mouse leave clear markup canvas
				element.bind('mouseleave', function (event) {
					if (!$.isEmptyObject(SoundHandlerService)) {
						if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
							if (!ViewStateService.getdragBarActive()) {
								if (ViewStateService.getPermission('labelAction')) {
									scope.switchMarkupContext(event, false);
									ViewStateService.curMouseTrackName = undefined;
								}
							}
						}
					}
				});

				//
				////////////////////
				// Functions

				scope.switchMarkupContext = function (event, leave) {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					// draw current viewport selected
					if (atts.ssffTrackname === 'OSCI') {
						DrawHelperService.drawViewPortTimes(ctx, true);
						DrawHelperService.drawCurViewPortSelected(ctx, true);
					} else if (atts.ssffTrackname === 'SPEC') {
						DrawHelperService.drawCurViewPortSelected(ctx, false);
						DrawHelperService.drawMinMaxAndName(ctx, '', ViewStateService.spectroSettings.rangeFrom, ViewStateService.spectroSettings.rangeTo, 2);
					} else {
						var tr = ConfigProviderService.getSsffTrackConfig(atts.ssffTrackname);
						var col = SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
						DrawHelperService.drawCurViewPortSelected(ctx, false);
						DrawHelperService.drawMinMaxAndName(ctx, atts.ssffTrackname, col._minVal, col._maxVal, 2);
					}
					// draw crossHairs
					if (leave !== false && ConfigProviderService.vals.restrictions.drawCrossHairs) {
						DrawHelperService.drawCrossHairs(ctx, event, ViewStateService.spectroSettings.rangeFrom, ViewStateService.spectroSettings.rangeTo, 'Hz', atts.ssffTrackname);
					}
					// draw moving boundary line if moving
					DrawHelperService.drawMovingBoundaryLine(ctx);
				};

				scope.setSelectDrag = function (event) {
					curMouseSample = Math.round(ViewStateService.getX(event) * ViewStateService.getSamplesPerPixelVal(event) + ViewStateService.curViewPort.sS);
					if (curMouseSample > ViewStateService.curViewPort.movingS) {
						ViewStateService.curViewPort.movingE = curMouseSample;
					} else {
						ViewStateService.curViewPort.movingS = curMouseSample;
					}
					ViewStateService.select(ViewStateService.curViewPort.movingS, ViewStateService.curViewPort.movingE);
					scope.$apply();
				};
			}
		};
	});
