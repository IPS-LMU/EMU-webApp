import * as angular from 'angular';

let ProgressBarComponent = {
    selector: "progressBar",
    template: `
    <div>{{$ctrl.txt}}</div>
    `,
    bindings: {
        txt: '<'
    },
    controller: class ProgressBarController{
        private $element;
        private $animate;
        
        constructor($element, $animate){
            this.$element = $element;
            this.$animate = $animate;
        };
        
        $onInit = function() {
			this.$animate.removeClass(this.$element, 'emuwebapp-shrinkHeightTo0px');
			this.$animate.removeClass(this.$element, 'emuwebapp-animationStopped');
			this.$animate.addClass(this.$element, 'emuwebapp-expandHeightTo20px');
			this.$animate.addClass(this.$element, 'emuwebapp-animationRunning');
        };
        
        $onDestroy = function() {
            this.$animate.removeClass(this.$element, 'emuwebapp-expandHeightTo20px');
            this.$animate.removeClass(this.$element, 'emuwebapp-animationRunning');
            this.$animate.addClass(this.$element, 'emuwebapp-shrinkHeightTo0px');
            this.$animate.addClass(this.$element, 'emuwebapp-animationStopped');
        }

    }
}
angular.module('emuwebApp')
.component(ProgressBarComponent.selector, ProgressBarComponent);