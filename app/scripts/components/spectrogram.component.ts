import * as angular from 'angular';
import { SpectroDrawingWorker } from '../workers/spectro-drawing.worker';

let SpectrogramComponent = {
    selector: "spectro",
    template: `
    <div class="emuwebapp-timeline">
    <!-- width is now up to 4k -->
    <div class="emuwebapp-timelineCanvasContainer">
        <canvas 
        class="emuwebapp-timelineCanvasMain" 
        width="2048"></canvas>
        
        <canvas 
        class="emuwebapp-timelineCanvasSSFF" 
        width="2048" 
        drawssff 
        ssff-trackname="{{$ctrl.trackName}}"></canvas>
        
        <canvas 
        class="emuwebapp-timelineCanvasMarkup" 
        width="2048" 
        mouse-track-and-correction-tool 
        ssff-trackname="{{$ctrl.trackName}}" 
        bundle-name="{{$ctrl.curBndl.name}}"></canvas>
    </div>
    <!-- <div class="emuwebapp-timelineCanvasButtons">
        <div ng-show="cps.vals.activeButtons.resizePerspectives" class="emuwebapp-level-button" enlarge="{{order}}">
            <img style="cursor: pointer;" src="img/resize.svg" />
        </div>
    </div> -->
    </div>`,
    bindings: {
        trackName: '<',
        spectroSettings: '<',
        osciSettings: '<',
        lastUpdate: '<',
        movingBoundarySample: '<',
        curMouseX: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<',
        viewPortSelectStart: '<',
        viewPortSelectEnd: '<',
        curBndl: '<'
    },
    controller: class SpectrogramController{
        private $element;
        private $timeout;
        private ViewStateService;
        private ConfigProviderService;
        private DrawHelperService;
        private FontScaleService;
        private SoundHandlerService;
        private MathHelperService;
        
        private _inited;

        private primeWorker;
        private alpha;
        private devicePixelRatio;

        private canvas0;
        private canvas1;
        private context;
        private markupCtx;

        constructor($element, $timeout, ViewStateService, ConfigProviderService, DrawHelperService, FontScaleService, SoundHandlerService, MathHelperService){
            this.$element = $element;
            this.$timeout = $timeout;
            this.ViewStateService = ViewStateService;
            this.ConfigProviderService = ConfigProviderService;
            this.DrawHelperService = DrawHelperService;
            this.FontScaleService = FontScaleService;
            this.SoundHandlerService = SoundHandlerService;
            this.MathHelperService = MathHelperService;
            this._inited = false;

    		// Spectro Worker
			this.primeWorker = new SpectroDrawingWorker();

            // default alpha for Window Function
			this.alpha = 0.16;
			this.devicePixelRatio = window.devicePixelRatio || 1;
        }
        $postLink = function(){
            // select the needed DOM elements from the template
            this.canvas0 = this.$element.find('canvas')[0];
            this.canvas1 = this.$element.find('canvas')[this.$element.find('canvas').length - 1];
            this.context = this.canvas0.getContext('2d');
            this.markupCtx = this.canvas1.getContext('2d');
        }

        $onChanges = function (changes) {
            if(this._inited){
                console.log(changes);
                ///////////////
				// watches

				// scope.$watch('vs.bundleListSideBarOpen', function () {
				// 	if (!$.isEmptyObject(this.SoundHandlerService)) {
				// 		if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
				// 			$timeout(scope.clearAndDrawSpectMarkup, ConfigProviderService.design.animation.duration);
				// 		}
				// 	}
				// });

                
                //
                if(changes.viewPortSampleStart || changes.viewPortSampleEnd || changes.curBndl || changes.osciSettings || changes.spectroSettings){
                    if (!$.isEmptyObject(this.SoundHandlerService)) {
                        if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                            if(changes.spectroSettings){
                                this.setupEvent();
                            }
                            this.redraw();
                            this.clearAndDrawSpectMarkup();
                        }
                    }
                }

                //
                if(changes.viewPortSelectStart || changes.viewPortSelectEnd || changes.movingBoundarySample || changes.curMouseX || changes.lastUpdate){
                    if (!$.isEmptyObject(this.SoundHandlerService)) {
                        if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                            this.clearAndDrawSpectMarkup();
                        }
                    }
                }

            }
        }

        $onInit = function() {
            this._inited = true;
        }

        ///////////////
        // bindings

        private redraw() {
            this.markupCtx.clearRect(0, 0, this.canvas1.width, this.canvas1.height);
            this.drawSpectro(this.SoundHandlerService.audioBuffer.getChannelData(this.ViewStateService.osciSettings.curChannel));
        };

        private drawSpectro(buffer) {
            this.killSpectroRenderingThread();
            this.startSpectroRenderingThread(buffer);
        };

        private calcSamplesPerPxl() {
            return (this.ViewStateService.curViewPort.eS + 1 - this.ViewStateService.curViewPort.sS) / this.canvas0.width;
        };

        private clearAndDrawSpectMarkup() {
            this.markupCtx.clearRect(0, 0, this.canvas1.width, this.canvas1.height);
            this.drawSpectMarkup();
        };

        private drawSpectMarkup() {
            // draw moving boundary line if moving
            this.DrawHelperService.drawMovingBoundaryLine(this.markupCtx);
            // draw current viewport selected
            this.DrawHelperService.drawCurViewPortSelected(this.markupCtx, false);
            // draw min max vals and name of track
            this.DrawHelperService.drawMinMaxAndName(this.markupCtx, '', this.ViewStateService.spectroSettings.rangeFrom, this.ViewStateService.spectroSettings.rangeTo, 2);
            // only draw corsshair x line if mouse currently not over canvas
            this.DrawHelperService.drawCrossHairX(this.markupCtx, this.ViewStateService.curMouseX);

        };

        private killSpectroRenderingThread() {
            this.context.fillStyle = this.ConfigProviderService.design.color.black;
            this.context.fillRect(0, 0, this.canvas0.width, this.canvas0.height);
            // draw current viewport selected
            this.DrawHelperService.drawCurViewPortSelected(this.markupCtx, false);
            this.FontScaleService.drawUndistortedText(
                this.context, 
                'rendering...', 
                this.ConfigProviderService.design.font.small.size.slice(0, -2) * 0.75, 
                this.ConfigProviderService.design.font.small.family, 
                10, 
                50, 
                this.ConfigProviderService.design.color.black, true);
            if (this.primeWorker !== null) {
                this.primeWorker.kill();
                this.primeWorker = null;
            }
        };

        private setupEvent() {
            var imageData = this.context.createImageData(this.canvas0.width, this.canvas0.height);
            this.primeWorker.says((event) => {
                if (event.status === undefined) {
                    if (this.calcSamplesPerPxl() === event.samplesPerPxl) {
                        var tmp = new Uint8ClampedArray(event.img);
                        imageData.data.set(tmp);
                        this.context.putImageData(imageData, 0, 0);
                        this.drawSpectMarkup();
                    }
                } else {
                    console.error('Error rendering spectrogram:', event.status.message);
                }
            });
        };

        private startSpectroRenderingThread(buffer) {
            if (buffer.length > 0) {
                this.primeWorker = new SpectroDrawingWorker();
                var parseData = [];
                var fftN = this.MathHelperService.calcClosestPowerOf2Gt(this.SoundHandlerService.audioBuffer.sampleRate * this.ViewStateService.spectroSettings.windowSizeInSecs);
                // fftN must be greater than 512 (leads to better resolution of spectrogram)
                if (fftN < 512) {
                    fftN = 512;
                }
                // extract relavant data
                parseData = buffer.subarray(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);

                var leftPadding = [];
                var rightPadding = [];

                // check if any zero padding at LEFT edge is necessary
                var windowSizeInSamples = this.SoundHandlerService.audioBuffer.sampleRate * this.ViewStateService.spectroSettings.windowSizeInSecs;
                if (this.ViewStateService.curViewPort.sS < windowSizeInSamples / 2) {
                    //should do something here... currently always padding with zeros!
                }
                else {
                    leftPadding = buffer.subarray(this.ViewStateService.curViewPort.sS - windowSizeInSamples / 2, this.ViewStateService.curViewPort.sS);
                }
                // check if zero padding at RIGHT edge is necessary
                if (this.ViewStateService.curViewPort.eS + fftN / 2 - 1 >= this.SoundHandlerService.audioBuffer.length) {
                    //should do something here... currently always padding with zeros!
                }
                else {
                    rightPadding = buffer.subarray(this.ViewStateService.curViewPort.eS, this.ViewStateService.curViewPort.eS + fftN / 2 - 1);
                }
                // add padding
                var paddedSamples = new Float32Array(leftPadding.length + parseData.length + rightPadding.length);
                paddedSamples.set(leftPadding);
                paddedSamples.set(parseData, leftPadding.length);
                paddedSamples.set(rightPadding, leftPadding.length + parseData.length);

                if (this.ViewStateService.curViewPort.sS >= fftN / 2) {
                    // pass in half a window extra at the front and a full window extra at the back so everything can be drawn/calculated this also fixes alignment issue
                    parseData = buffer.subarray(this.ViewStateService.curViewPort.sS - fftN / 2, this.ViewStateService.curViewPort.eS + fftN);
                } else {
                    // tolerate window/2 alignment issue if at beginning of file
                    parseData = buffer.subarray(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS + fftN);
                }
                this.setupEvent();
                this.primeWorker.tell({
                    'windowSizeInSecs': this.ViewStateService.spectroSettings.windowSizeInSecs,
                    'fftN': fftN,
                    'alpha': this.alpha,
                    'upperFreq': this.ViewStateService.spectroSettings.rangeTo,
                    'lowerFreq': this.ViewStateService.spectroSettings.rangeFrom,
                    'samplesPerPxl': this.calcSamplesPerPxl(),
                    'window': this.ViewStateService.spectroSettings.window,
                    'imgWidth': this.canvas0.width,
                    'imgHeight': this.canvas0.height,
                    'dynRangeInDB': this.ViewStateService.spectroSettings.dynamicRange,
                    'pixelRatio': this.devicePixelRatio,
                    'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate,
                    'transparency': this.ConfigProviderService.vals.spectrogramSettings.transparency,
                    'audioBuffer': paddedSamples,
                    'audioBufferChannels': this.SoundHandlerService.audioBuffer.numberOfChannels,
                    'drawHeatMapColors': this.ViewStateService.spectroSettings.drawHeatMapColors,
                    'preEmphasisFilterFactor': this.ViewStateService.spectroSettings.preEmphasisFilterFactor,
                    'heatMapColorAnchors': this.ViewStateService.spectroSettings.heatMapColorAnchors,
                    'invert': this.ViewStateService.spectroSettings.invert
                }, [paddedSamples.buffer]);
            }
    }


}
}

angular.module('emuwebApp')
.component(SpectrogramComponent.selector, SpectrogramComponent);