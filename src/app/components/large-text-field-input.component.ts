import * as angular from 'angular';

/**
 * stub class to implement large text input field 
 * above the overview scroll bar at the bottom
 * to make it easier to input/read long texts
 */
let LargeTextFieldInputComponent = {
    selector: "largeTextFieldInput",
    template: /*html*/`
    <div class="emuwebapp-largetextinputfield" ng-show="$ctrl.ViewStateService.largeTextFieldInputFieldVisable" ng-focus="vs.largeTextFieldInputFieldVisable"><textarea ng-model="vs.largeTextFieldInputFieldCurLabel"></textarea></div>
    `,
    bindings: {

    },
    controller: [
        class LargeTextFieldInputController {

        }
    ]
}

angular.module('emuwebApp')
.component(LargeTextFieldInputComponent.selector, LargeTextFieldInputComponent);