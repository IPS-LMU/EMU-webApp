import * as angular from 'angular';
import { version } from "../../../package.json";

let NewVersionHintComponent = {
    selector: "newVersionHint",
    template: `
    <div class="emuwebapp-aboutHint">
    <button class="emuwebapp-aboutHint-hidden" ng-click="$ctrl.aboutBtnOverlayClick()"></button>
    Welcome to the EMU-webApp Version {{version}}
    <div class="emuwebapp-aboutHint-arrow">click here for more information ⇧</div>
    </div>
    `,
    bindings: {
        aboutBtnOverlayClick: '&'
    },
    controller: class NewVersionHintComponent{
        constructor(){
        }
        $postLink (){
        };
    }

}

angular.module('emuwebApp')
    .component(NewVersionHintComponent.selector, NewVersionHintComponent);