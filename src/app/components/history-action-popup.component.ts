import * as angular from 'angular';

let HistoryActionPopupComponent = {
    selector: "historyActionPopup",
    template: `
    <div ng-bind-html="$ctrl.historyActionTxt">
    test12
    </div>
    `,
    bindings : {
        historyActionTxt: '<'
    },
    controller: class HistoryActionPopupController{
        private $element;
        private ViewStateService;
        private $animate;
        private $timeout;
        private ConfigProviderService;

        private _inited;

        constructor($element, ViewStateService, $animate, $timeout, ConfigProviderService){
            this.$element = $element;
            this.ViewStateService = ViewStateService;
            this.$animate = $animate;
            this.$timeout = $timeout;
            this.ConfigProviderService = ConfigProviderService;

        }

        $postLink = function(){
            
        };
        
        $onChanges = function (changes) {
            //
            if(this._inited){
                //
                if(changes.historyActionTxt){
                    if (this.historyActionTxt !== '') {
                        this.$animate.addClass(this.$element, 'emuwebapp-history-fade').then(() => {
                            this.$timeout(() => {
                                this.$animate.removeClass(this.$element, 'emuwebapp-history-fade').then(() => {
                                    this.$timeout(() => {
                                        this.ViewStateService.historyActionTxt = '';
                                    }, this.ConfigProviderService.design.animation.period);
                                });
                            }, this.ConfigProviderService.design.animation.period);
                        });
                    }
                }
            }
        }

        $onInit = function() {
            this._inited = true;
        };

    }

}

angular.module('emuwebApp')
.component(HistoryActionPopupComponent.selector, HistoryActionPopupComponent);