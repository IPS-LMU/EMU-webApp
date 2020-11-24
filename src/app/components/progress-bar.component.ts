import * as angular from 'angular';

let ProgressBarComponent = {
    selector: "progressBar",
    template: `
    <div>{{$ctrl.txt}}</div>
    `,
    bindings: {
        open: '<',
        txt: '<'
    },
    controller: class ProgressBarController{
        private $element;
        private $animate;

        private _inited = false;
        
        constructor($element, $animate){
            this.$element = $element;
            this.$animate = $animate;
        };
        
        $onInit = function() {
            this._inited = true;
        };
        
        $onChanges = function (changes) {
            if(this._inited){
                if(changes.open){
                    // console.log(changes.open.currentValue);
                    if(changes.open.currentValue){
                        this.$animate.removeClass(this.$element, 'emuwebapp-shrinkHeightTo0px');
                        this.$animate.removeClass(this.$element, 'emuwebapp-animationStopped');
                        this.$animate.addClass(this.$element, 'emuwebapp-expandHeightTo20px');
                        this.$animate.addClass(this.$element, 'emuwebapp-animationRunning');
                    } else {
                        this.$animate.removeClass(this.$element, 'emuwebapp-expandHeightTo20px');
                        this.$animate.removeClass(this.$element, 'emuwebapp-animationRunning');
                        this.$animate.addClass(this.$element, 'emuwebapp-shrinkHeightTo0px');
                        this.$animate.addClass(this.$element, 'emuwebapp-animationStopped');
                    }
                }
            }
        }

    }
}
angular.module('emuwebApp')
.component(ProgressBarComponent.selector, ProgressBarComponent);