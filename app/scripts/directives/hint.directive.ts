import * as angular from 'angular';
import { version } from "../../../package.json";

angular.module('emuwebApp')
	.directive('hint', function ($timeout) {
		return {
			templateUrl: 'views/hint.html',
			replace: true,
			restrict: 'E',
			link: function postLink(scope) {
				scope.version = version;				
				$timeout(function() {
					scope.internalVars.showAboutHint = !scope.internalVars.showAboutHint
				}, 3000)
				scope.hideMe = function () {
					scope.internalVars.showAboutHint = !scope.internalVars.showAboutHint;
					scope.aboutBtnClick();
				};

			}
		};
	});
