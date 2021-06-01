import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

let OsciOverviewComponent = {
    selector: "osciOverview",
    template: `
    <div class="emuwebapp-preview">
    <canvas 
    width="4096" 
    height="128" 
    class="emuwebapp-preview-canvas" 
    ng-style="$ctrl.backgroundCanvas" 
    id="PreviewCanvas"></canvas>
    <canvas 
    width="4096" 
    height="128" 
    class="emuwebapp-preview-canvas-markup" 
    id="PreviewCanvas" 
    previewtrack></canvas>
    </div>
    `,
    bindings: {
        curChannel: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<',
        curBndl: '<'
    },
    controller: [
        '$scope', 
        '$element', 
        'ViewStateService', 
        'SoundHandlerService', 
        'DrawHelperService', 
        'ConfigProviderService',
        class OsciOverviewComponent{
        private $scope;
        private $element;
        private ViewStateService;
        private SoundHandlerService;
        private DrawHelperService;
        private ConfigProviderService;

        private canvas;
        private markupCanvas;
        private backgroundCanvas;
        private startSample;
        private envelopeHasBeenDrawn;
        private curBndl;
        private _inited;

        constructor(
            $scope, 
            $element, 
            ViewStateService, 
            SoundHandlerService, 
            DrawHelperService, 
            ConfigProviderService
            ){
            this.$scope = $scope;
            this.$element = $element;
            this.ViewStateService =ViewStateService;
            this.SoundHandlerService = SoundHandlerService;
            this.DrawHelperService = DrawHelperService;
            this.ConfigProviderService = ConfigProviderService;

		    this.backgroundCanvas = {
				'background': '#000',
				'border': '1px solid gray',
				'width': '100%',
				'height': '100%'
			};

            this.startSample = -1;

            this.envelopeHasBeenDrawn = false;
            this._inited = false;
        }
        
        $postLink (){
            this.canvas = this.$element.find('canvas')[0];
            this.markupCanvas = this.$element.find('canvas')[1];

            				///////////////
				// bindings

				this.$element.bind('click', (x) => {
					if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
						var width = this.ViewStateService.curViewPort.eS - this.ViewStateService.curViewPort.sS;
						this.startSample = this.ViewStateService.getX(x) * (this.SoundHandlerService.audioBuffer.length / x.originalEvent.target.width);
						if (this.startSample - (width / 2) < 0) {
							this.startSample = Math.ceil(width / 2);
						}
						else if (this.startSample + (width / 2) > this.SoundHandlerService.audioBuffer.length) {
							this.startSample = Math.floor(this.SoundHandlerService.audioBuffer.length - (width / 2));
						}
						if (!this.ViewStateService.isEditing()) {
							this.$scope.$apply(() => {
								this.ViewStateService.setViewPort(this.startSample - (width / 2), this.startSample + (width / 2));
							});
						}
					}
				});

				//
				this.$element.bind('mousedown', (x) => {
					if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
						this.startSample = this.ViewStateService.getX(x) * (this.SoundHandlerService.audioBuffer.length / x.originalEvent.target.width);
					}
				});

				//
				this.$element.bind('mousemove', (x) => {
					var mbutton = 0;
					if (x.buttons === undefined) {
						mbutton = x.which;
					} else {
						mbutton = x.buttons;
					}
					switch (mbutton) {
						case 1:
							if (this.startSample !== -1) {
								var width = this.ViewStateService.curViewPort.eS - this.ViewStateService.curViewPort.sS;
								this.startSample = this.ViewStateService.getX(x) * (this.SoundHandlerService.audioBuffer.length / x.originalEvent.target.width)
								if (!this.ViewStateService.isEditing()) {
									this.$scope.$apply(() => {
										this.ViewStateService.setViewPort((this.startSample - (width / 2)), (this.startSample + (width / 2)));
									});
								}
							}
							break;
					}
				});

				//
				this.$element.bind('mouseup', () => {
					this.startSample = -1;
				});

				//
				this.$element.bind('mouseout', () => {
					this.startSample = -1;
				});


        }

        $onChanges (changes) {
            //
            if(this._inited){
                //
                if(changes.curChannel || changes.viewPortSampleStart || changes.viewPortSampleEnd){
                    this.drawPreview();
                }
                //
                if(changes.curBndl){
                    this.envelopeHasBeenDrawn = false;
                    this.backgroundCanvas = {
                        'background': styles.colorBlack,
                        'border': '1px solid gray',
                        'width': '100%',
                        'height': '100%'
                    };
                    this.drawPreview();
                    //clear on empty bundle name
					if (Object.keys(this.curBndl).length === 0 && this.curBndl.constructor === Object) {
						var ctx = this.canvas.getContext('2d');
						var ctxMarkup = this.markupCanvas.getContext('2d');
						ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
						ctxMarkup.clearRect(0, 0, this.canvas.width, this.canvas.height);
					}
                }
            }
        };
        $onInit () {
            this._inited = true;
        };
        /**
         *
         */
        private drawPreview () {
            if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                if (!this.envelopeHasBeenDrawn) {
                    this.envelopeHasBeenDrawn = true;
                    this.DrawHelperService.freshRedrawDrawOsciOnCanvas(this.canvas, 0, this.SoundHandlerService.audioBuffer.length, true);
                    this.drawVpOsciMarkup();
                } else {
                    this.drawVpOsciMarkup();
                }
            }
        };

        /**
         * draws markup of osci according to
         * the information that is specified in
         * the viewport
         */
        private drawVpOsciMarkup () {
            var ctx = this.markupCanvas.getContext('2d');
            var posS = (this.markupCanvas.width / this.SoundHandlerService.audioBuffer.length) * this.ViewStateService.curViewPort.sS;
            var posE = (this.markupCanvas.width / this.SoundHandlerService.audioBuffer.length) * this.ViewStateService.curViewPort.eS;

            ctx.clearRect(0, 0, this.markupCanvas.width, this.markupCanvas.height);
            ctx.fillStyle = styles.colorTransparentLightGrey;
            ctx.fillRect(posS, 0, posE - posS, this.markupCanvas.height);
            ctx.strokeStyle = styles.colorWhite;
            ctx.beginPath();
            ctx.moveTo(posS, 0);
            ctx.lineTo(posS, this.markupCanvas.height);
            ctx.moveTo(posE, 0);
            ctx.lineTo(posE, this.markupCanvas.height);
            ctx.closePath();
            ctx.stroke();
        };
    }]
}

angular.module('emuwebApp')
.component(OsciOverviewComponent.selector, OsciOverviewComponent);