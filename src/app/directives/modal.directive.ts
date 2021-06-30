import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('modal', ['$animate', 'ModalService', 
		function ($animate, ModalService) {
		return {
			restrict: 'E',
			template: /*html*/`
			<div id="modalDialog" class="emuwebapp-modal">
				<div ng-if="modal.isOpen">
					<button title="Close" id="modal-close" class="emuwebapp-close-button" ng-click="modal.close()" ng-hide="force">
						<i class="material-icons">cancel</i>
					</button>
					<p class="emuwebapp-modal-inner" ng-include="templateUrl"></p>
				</div>
			</div>
			`,
			replace: true,
			scope: {},
			link: function (scope, element) {
				scope.templateUrl = '';
				scope.modal = ModalService;
				scope.isOpen = false;
				scope.force = false;
				scope.dataIn = '';
				scope.$watch('modal.isOpen', function (newValue) {
					if (newValue !== undefined) {
						scope.templateUrl = ModalService.getTemplateUrl();
						scope.dataIn = ModalService.dataIn;
						scope.force = ModalService.force;
						if (newValue) {
							element[0].classList.add('emuwebapp-modal-open');
						}
						else {
							element[0].classList.remove('emuwebapp-modal-open');
						}
					}
				});
				scope.$watch('modal.templateUrl', function (newValue) {
					if (newValue !== undefined) {
						scope.templateUrl = newValue;
						scope.dataIn = ModalService.dataIn;
						scope.force = ModalService.force;
					}
				});
			}
		};
	}]);