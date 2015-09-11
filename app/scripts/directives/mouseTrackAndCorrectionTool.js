'use strict';

angular.module('emuwebApp')
	.directive('mouseTrackAndCorrectionTool', function (viewState, ConfigProviderService, Ssffdataservice, Drawhelperservice, HistoryService, Soundhandlerservice) {
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
						if (!$.isEmptyObject(Ssffdataservice.data)) {
							if (Ssffdataservice.data.length !== 0) {
								tr = ConfigProviderService.getSsffTrackConfig('FORMANTS');
								if (tr !== undefined) {
									col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
									sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);
								}
							}
						}
					}
				});


				/////////////////////////////
				// Bindings
				element.bind('mousedown touchstart', function (event) {
					viewState.curViewPort.movingS = Math.round(viewState.getX(event) * viewState.getSamplesPerPixelVal(event) + viewState.curViewPort.sS);
					viewState.curViewPort.movingE = viewState.curViewPort.movingS;
					viewState.select(viewState.curViewPort.movingS, viewState.curViewPort.movingE);
					scope.switchMarkupContext(event);
					scope.$apply();
				});

				element.bind('mousemove touchmove', function (event) {
					var mbutton = 0;
					if (event.buttons === undefined) {
						mbutton = event.which;
					} else {
						mbutton = event.buttons;
					}
					// perform mouse tracking
					var mouseX = viewState.getX(event);
					viewState.curMousePosSample = Math.round(viewState.curViewPort.sS + mouseX / element[0].width * (viewState.curViewPort.eS - viewState.curViewPort.sS));

					switch (mbutton) {
					case 0:
						if (viewState.getPermission('labelAction')) {
							scope.switchMarkupContext(event);
							if (!$.isEmptyObject(Ssffdataservice.data)) {
								if (Ssffdataservice.data.length !== 0) {
									if (!viewState.getdragBarActive()) {
										if (viewState.curCorrectionToolNr !== undefined && !viewState.getdragBarActive() && !$.isEmptyObject(ConfigProviderService.getAssignment(trackName))) {
											// var col = Ssffdataservice.data[0].Columns[0];
											if (tr === undefined) {
												tr = ConfigProviderService.getSsffTrackConfig('FORMANTS');
											}
											col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
											sRaSt = Ssffdataservice.getSampleRateAndStartTimeOfTrack(tr.name);
											var startTimeVP = viewState.getViewPortStartTime();
											var endTimeVP = viewState.getViewPortEndTime();
											var colStartSampleNr = Math.round(startTimeVP * sRaSt.sampleRate + sRaSt.startTime);
											var colEndSampleNr = Math.round(endTimeVP * sRaSt.sampleRate + sRaSt.startTime);
											var nrOfSamples = colEndSampleNr - colStartSampleNr;
											var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
											var curMouseTime = startTimeVP + (viewState.getX(event) / event.originalEvent.target.width) * (endTimeVP - startTimeVP);
											var curMouseSample = Math.round((curMouseTime + sRaSt.startTime) * sRaSt.sampleRate) - 1; //-1 for in view correction
											var curMouseSampleTime = (1 / sRaSt.sampleRate * curMouseSample) + sRaSt.startTime;
											if (curMouseSample - colStartSampleNr < 0 || curMouseSample - colStartSampleNr >= curSampleArrs.length) {
												//console.log('early return');
												return;
											}
											viewState.curPreselColumnSample = curMouseSample - colStartSampleNr;
											var x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
											var y = canvas.height - curSampleArrs[viewState.curPreselColumnSample][viewState.curCorrectionToolNr - 1] / (viewState.spectroSettings.rangeTo - viewState.spectroSettings.rangeFrom) * canvas.height;

											// draw sample
											ctx.strokeStyle = 'black';
											ctx.fillStyle = 'black';
											ctx.beginPath();
											ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
											ctx.closePath();
											ctx.stroke();
											ctx.fill();


											if (event.shiftKey) {
												var oldValue = angular.copy(curSampleArrs[viewState.curPreselColumnSample][viewState.curCorrectionToolNr - 1]);
												var newValue = viewState.spectroSettings.rangeTo - viewState.getY(event) / event.originalEvent.target.height * viewState.spectroSettings.rangeTo; // SIC only using rangeTo

												curSampleArrs[viewState.curPreselColumnSample][viewState.curCorrectionToolNr - 1] = viewState.spectroSettings.rangeTo - viewState.getY(event) / event.originalEvent.target.height * viewState.spectroSettings.rangeTo;
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
						}
						break;
					case 1:
						if (!viewState.getdragBarActive()) {
							scope.setSelectDrag(event);
						}
						break;
					}
					scope.$apply();
				});
/*
				element.bind('mouseup', function (event) {
					if (!viewState.getdragBarActive()) {
						scope.setSelectDrag(event);
						scope.switchMarkupContext(event, false);
					}
				});
*/
				// on mouse leave clear markup canvas
				element.bind('mouseleave touchleave', function (event) {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							if (!viewState.getdragBarActive()) {
								if (viewState.getPermission('labelAction')) {
									scope.switchMarkupContext(event, false);
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
					if (atts.ssffTrackname == 'OSCI') {
						Drawhelperservice.drawViewPortTimes(ctx, true);
						Drawhelperservice.drawCurViewPortSelected(ctx, true);
					} else if (atts.ssffTrackname == 'SPEC') {
						Drawhelperservice.drawCurViewPortSelected(ctx, false);
						Drawhelperservice.drawMinMaxAndName(ctx, '', viewState.spectroSettings.rangeFrom, viewState.spectroSettings.rangeTo, 2);
					} else {
						var tr = ConfigProviderService.getSsffTrackConfig(atts.ssffTrackname);
						var col = Ssffdataservice.getColumnOfTrack(tr.name, tr.columnName);
						Drawhelperservice.drawCurViewPortSelected(ctx, false);
						Drawhelperservice.drawMinMaxAndName(ctx, atts.ssffTrackname, col._minVal, col._maxVal, 2);
					}
					// draw crossHairs
					if (leave !== false && ConfigProviderService.vals.restrictions.drawCrossHairs) {
						Drawhelperservice.drawCrossHairs(ctx, event, viewState.spectroSettings.rangeFrom, viewState.spectroSettings.rangeTo, 'Hz', atts.ssffTrackname);
					}
					// draw moving boundary line if moving
					Drawhelperservice.drawMovingBoundaryLine(ctx);
				};

				scope.setSelectDrag = function (event) {
					curMouseSample = Math.round(viewState.getX(event) * viewState.getSamplesPerPixelVal(event) + viewState.curViewPort.sS);
					if (curMouseSample > viewState.curViewPort.movingS) {
						viewState.curViewPort.movingE = curMouseSample;
					} else {
						viewState.curViewPort.movingS = curMouseSample;
					}
					viewState.select(viewState.curViewPort.movingS, viewState.curViewPort.movingE);
					scope.$apply();
				};
			}
		};
	});
