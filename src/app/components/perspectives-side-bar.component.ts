import * as angular from 'angular';

let PerspectivesSideBarComponent = {
    selector: "perspectivesSideBar",
    template: /*html*/`
    <nav class="emuwebapp-right-menu" ng-show="$ctrl.ConfigProviderService.vals.restrictions.showPerspectivesSidebar">
    <button ng-click="$ctrl.ViewStateService.setPerspectivesSideBarOpen(!$ctrl.ViewStateService.getPerspectivesSideBarOpen()); $ctrl.toggleShow();">
        <i class="material-icons">menu</i>
      <!-- <img src="img/menu.svg" ="_20px _inverted" /> -->
    </button>
    <h3>Perspectives</h3>
    <ul>
        <li ng-repeat="persp in $ctrl.ConfigProviderService.vals.perspectives" ng-click="$ctrl.changePerspective(persp); $ctrl.toggleShow();" ng-class="$ctrl.getPerspectiveColor(persp);">
            {{persp.name}}
        </li>
    </ul>
    </nav>
    `,
    bindings: {

    },
    controller: [
        '$element', 
        '$animate', 
        'ConfigProviderService', 
        'ViewStateService',
        class PerspectivesSideBarController{
        private $element;
        private $animate;
        private ConfigProviderService;
        private ViewStateService;

        private _inited;

        constructor(
            $element, 
            $animate, 
            ConfigProviderService, 
            ViewStateService
            ){
            this.$element = $element;
            this.$animate = $animate;
            this.ConfigProviderService = ConfigProviderService;
            this.ViewStateService = ViewStateService;

            this._inited = false;
        }

        $postLink (){            
        };
        
        $onChanges (changes) {
            //
            if(this._inited){}
        }
        $onInit () {
            this._inited = true;
        };

        /**
		 * function used to change perspective
		 * @param persp json object of current perspective containing name attribute
		 */
		private changePerspective (persp) {

			var newIdx;
			for (var i = 0; i < this.ConfigProviderService.vals.perspectives.length; i++) {
				if (persp.name === this.ConfigProviderService.vals.perspectives[i].name) {
					newIdx = i;
				}
			}
			this.ViewStateService.switchPerspective(newIdx, this.ConfigProviderService.vals.perspectives);
			// close perspectivesSideBar
			this.ViewStateService.setPerspectivesSideBarOpen(!this.ViewStateService.getPerspectivesSideBarOpen());
		};

		/**
		 * function to get color of current perspecitve in ul
		 * @param persp json object of current perspective containing name attribute
		 */
		private getPerspectiveColor (persp) {
			var cl;
			if (this.ViewStateService.curPerspectiveIdx === -1 || persp.name === this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].name) {
				cl = 'emuwebapp-curSelPerspLi';
			} else {
				cl = 'emuwebapp-perspLi';
			}
			return cl;
        };

        private toggleShow (){
            // console.log("toggleshow")
            if(this.ViewStateService.getPerspectivesSideBarOpen()){
                this.$animate.addClass(this.$element.find('nav')[0], 'emuwebapp-expandWidthTo200px');
                this.$animate.removeClass(this.$element.find('nav')[0], 'emuwebapp-shrinkWidthTo0px');
            } else {
                this.$animate.removeClass(this.$element.find('nav')[0], 'emuwebapp-expandWidthTo200px');
                this.$animate.addClass(this.$element.find('nav')[0], 'emuwebapp-shrinkWidthTo0px');
            }
        }
    }]
}

angular.module('emuwebApp')
.component(PerspectivesSideBarComponent.selector, PerspectivesSideBarComponent);