import * as angular from 'angular';
import { SpectroDrawingWorker } from '../workers/spectro-drawing.worker';


angular.module('emuwebApp')
	.directive('spectro', function ($timeout, ViewStateService, ConfigProviderService, DrawHelperService, FontScaleService, SoundHandlerService, MathHelperService) {
		return {
			templateUrl: 'views/spectro.html',
			restrict: 'E',
			replace: true,
			scope: {},
			link: function postLink(scope, element, attrs) {
				scope.shs = SoundHandlerService;
				scope.order = attrs.order;
				scope.vs = ViewStateService;
				scope.cps = ConfigProviderService;
				scope.dhs = DrawHelperService;
				scope.trackName = attrs.trackName;
				// select the needed DOM elements from the template
				scope.canvas0 = element.find('canvas')[0];
				scope.canvas1 = element.find('canvas')[element.find('canvas').length - 1];
				scope.context = scope.canvas0.getContext('2d');
				scope.markupCtx = scope.canvas1.getContext('2d');

				// FFT default vars
				// default alpha for Window Function
				scope.alpha = 0.16;
				scope.devicePixelRatio = window.devicePixelRatio || 1;

				// Spectro Worker
				scope.primeWorker = new SpectroDrawingWorker();


				///////////////
				// watches

				//
				scope.$watch('vs.timelineSize', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.audioBuffer)) {
							$timeout(scope.clearAndDrawSpectMarkup, ConfigProviderService.design.animation.duration);
						}
					}
				});

				//
				scope.$watch('ViewStateService.lastUpdate', function (newValue, oldValue) {
					if (newValue !== oldValue && !$.isEmptyObject(scope.shs) && !$.isEmptyObject(scope.shs.audioBuffer)) {
						scope.clearAndDrawSpectMarkup();
					}
				});


				scope.$watch('vs.bundleListSideBarOpen', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.audioBuffer)) {
							$timeout(scope.clearAndDrawSpectMarkup, ConfigProviderService.design.animation.duration);
						}
					}
				});


				scope.$watch('vs.curViewPort', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.audioBuffer)) {
							// check for changed zoom
							if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
								scope.redraw();
							}
							scope.clearAndDrawSpectMarkup();
						}
					}
				}, true);

				scope.$watch('vs.movingBoundarySample', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.audioBuffer)) {
							scope.clearAndDrawSpectMarkup();
						}
					}
				}, true);

				scope.$watch('vs.movingBoundary', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.audioBuffer)) {
							// scope.redraw();
							scope.clearAndDrawSpectMarkup();
						}
					}
				}, true);

                scope.$watch('vs.curMouseX', function () {
                    if (!$.isEmptyObject(scope.shs)) {
                        if (!$.isEmptyObject(scope.shs.audioBuffer)) {
                            // scope.redraw();
                            // only draw corsshair x line if mouse currently not over canvas
                            if(scope.vs.curMouseTrackName !== scope.trackName){
                                scope.clearAndDrawSpectMarkup();
                            }
                        }
                    }
                }, true);


                scope.$watch('vs.spectroSettings', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.audioBuffer)) {
							scope.setupEvent();
							scope.redraw();
						}
					}
				}, true);

				//
				scope.$watch('vs.osciSettings', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.audioBuffer)) {
							scope.setupEvent();
							scope.redraw();
						}
					}
				}, true);


				//
				scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.audioBuffer)) {
							if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
								scope.redraw();
							}
						}
					}
				}, true);


				///////////////
				// bindings

				scope.redraw = function () {
					scope.markupCtx.clearRect(0, 0, scope.canvas1.width, scope.canvas1.height);
					scope.drawSpectro(scope.shs.audioBuffer.getChannelData(scope.vs.osciSettings.curChannel));
				};

				scope.drawSpectro = function (buffer) {
					scope.killSpectroRenderingThread();
					scope.startSpectroRenderingThread(buffer);
				};

				scope.calcSamplesPerPxl = function () {
					return (scope.vs.curViewPort.eS + 1 - scope.vs.curViewPort.sS) / scope.canvas0.width;
				};

				scope.clearAndDrawSpectMarkup = function () {
					scope.markupCtx.clearRect(0, 0, scope.canvas1.width, scope.canvas1.height);
					scope.drawSpectMarkup();
				};

				scope.drawSpectMarkup = function () {
					// draw moving boundary line if moving
					scope.dhs.drawMovingBoundaryLine(scope.markupCtx);
					// draw current viewport selected
					scope.dhs.drawCurViewPortSelected(scope.markupCtx, false);
					// draw min max vals and name of track
					scope.dhs.drawMinMaxAndName(scope.markupCtx, '', scope.vs.spectroSettings.rangeFrom, scope.vs.spectroSettings.rangeTo, 2);
                    // only draw corsshair x line if mouse currently not over canvas
					DrawHelperService.drawCrossHairX(scope.markupCtx, scope.vs.curMouseX);

                };

				scope.killSpectroRenderingThread = function () {
					scope.context.fillStyle = ConfigProviderService.design.color.black;
					scope.context.fillRect(0, 0, scope.canvas0.width, scope.canvas0.height);
					// draw current viewport selected
					scope.dhs.drawCurViewPortSelected(scope.markupCtx, false);
					FontScaleService.drawUndistortedText(scope.context, 'rendering...', ConfigProviderService.design.font.small.size.slice(0, -2) * 0.75, ConfigProviderService.design.font.small.family, 10, 50, ConfigProviderService.design.color.black, true);
					if (scope.primeWorker !== null) {
						scope.primeWorker.kill();
						scope.primeWorker = null;
					}
				};

				scope.setupEvent = function () {
					var imageData = scope.context.createImageData(scope.canvas0.width, scope.canvas0.height);
					scope.primeWorker.says(function (event) {
						if (event.status === undefined) {
							if (scope.calcSamplesPerPxl() === event.samplesPerPxl) {
								var tmp = new Uint8ClampedArray(event.img);
								imageData.data.set(tmp);
								scope.context.putImageData(imageData, 0, 0);
								scope.drawSpectMarkup();
							}
						} else {
							console.error('Error rendering spectrogram:', event.status.message);
						}
					});
				};

				scope.startSpectroRenderingThread = function (buffer) {
					if (buffer.length > 0) {
						scope.primeWorker = new SpectroDrawingWorker();
						var parseData = [];
						var fftN = MathHelperService.calcClosestPowerOf2Gt(scope.shs.audioBuffer.sampleRate * scope.vs.spectroSettings.windowSizeInSecs);
						// fftN must be greater than 512 (leads to better resolution of spectrogram)
						if (fftN < 512) {
							fftN = 512;
						}
						// extract relavant data
						parseData = buffer.subarray(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS);

						var leftPadding = [];
						var rightPadding = [];

						// check if any zero padding at LEFT edge is necessary
						var windowSizeInSamples = scope.shs.audioBuffer.sampleRate * scope.vs.spectroSettings.windowSizeInSecs;
						if (scope.vs.curViewPort.sS < windowSizeInSamples / 2) {
							//should do something here... currently always padding with zeros!
						}
						else {
							leftPadding = buffer.subarray(scope.vs.curViewPort.sS - windowSizeInSamples / 2, scope.vs.curViewPort.sS);
						}
						// check if zero padding at RIGHT edge is necessary
						if (scope.vs.curViewPort.eS + fftN / 2 - 1 >= scope.shs.audioBuffer.length) {
							//should do something here... currently always padding with zeros!
						}
						else {
							rightPadding = buffer.subarray(scope.vs.curViewPort.eS, scope.vs.curViewPort.eS + fftN / 2 - 1);
						}
						// add padding
						var paddedSamples = new Float32Array(leftPadding.length + parseData.length + rightPadding.length);
						paddedSamples.set(leftPadding);
						paddedSamples.set(parseData, leftPadding.length);
						paddedSamples.set(rightPadding, leftPadding.length + parseData.length);

						if (scope.vs.curViewPort.sS >= fftN / 2) {
							// pass in half a window extra at the front and a full window extra at the back so everything can be drawn/calculated this also fixes alignment issue
							parseData = buffer.subarray(scope.vs.curViewPort.sS - fftN / 2, scope.vs.curViewPort.eS + fftN);
						} else {
							// tolerate window/2 alignment issue if at beginning of file
							parseData = buffer.subarray(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS + fftN);
						}
						scope.setupEvent();
						scope.primeWorker.tell({
							'windowSizeInSecs': scope.vs.spectroSettings.windowSizeInSecs,
							'fftN': fftN,
							'alpha': scope.alpha,
							'upperFreq': scope.vs.spectroSettings.rangeTo,
							'lowerFreq': scope.vs.spectroSettings.rangeFrom,
							'samplesPerPxl': scope.calcSamplesPerPxl(),
							'window': scope.vs.spectroSettings.window,
							'imgWidth': scope.canvas0.width,
							'imgHeight': scope.canvas0.height,
							'dynRangeInDB': scope.vs.spectroSettings.dynamicRange,
							'pixelRatio': scope.devicePixelRatio,
							'sampleRate': scope.shs.audioBuffer.sampleRate,
							'transparency': scope.cps.vals.spectrogramSettings.transparency,
							'audioBuffer': paddedSamples,
							'audioBufferChannels': scope.shs.audioBuffer.numberOfChannels,
							'drawHeatMapColors': scope.vs.spectroSettings.drawHeatMapColors,
							'preEmphasisFilterFactor': scope.vs.spectroSettings.preEmphasisFilterFactor,
							'heatMapColorAnchors': scope.vs.spectroSettings.heatMapColorAnchors,
							'invert': scope.vs.spectroSettings.invert
						}, [paddedSamples.buffer]);
					}
				};
			}
		};
	});
