'use strict';


angular.module('emuwebApp')
	.directive('bundleListSideBar', function ($animate, viewState) {
		return {
			templateUrl: 'views/bundleListSideBar.html',
			restrict: 'E',
			replace: true,
			// scope:{},
			link: function postLink(scope, element, attr) {

				////////////////
				//watches

				scope.$watch('vs.submenuOpen', function () {
					// scope.updateCSS();
					if (scope.vs.submenuOpen) {
						$animate.removeClass(element, 'emuwebapp-shrinkWidthTo0px');
						$animate.addClass(element, 'emuwebapp-expandWidthTo240px');
					} else {

						$animate.addClass(element, 'emuwebapp-shrinkWidthTo0px');
						// $animate.removeClass(element, 'expandWidthTo240px');
					}
				}, true);

				//
				/////////////////

				// scope.$watch('vs.submenuOpen', function () {

				// // 	if (scope.vs.submenuOpen) {

				// // 		// $animate.removeClass(element, 'shrinkWidthTo0px');
				// // 		// $animate.addClass(element, 'expandWidthTo200px');

				// // 	} else {
				// // 		// $animate.removeClass(element, 'expandWidthTo200px');
				// // 		// $animate.addClass(element, 'shrinkWidthTo0px');
				// // 	}
				// // }, true);

				// 	var dotMs = scope.vs.getTransitionTime();

				// 	var transcss = {
				// 		'-webkit-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
				// 		'-moz-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
				// 		'-ms-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
				// 		'-o-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
				// 		'transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out'
				// 	};

				// 	// alert("sdfsdf")
				// 	element.css(transcss);
				// 	$('#mainWindow').css(transcss);
				// 	if (scope.vs.submenuOpen) {

				// 		$animate.addClass($('#mainWindow'), '.slideInBody');
				// 		$animate.addClass(element, '.slideInSubmenu');
				// 	} else {
				// 		$animate.removeClass($('#mainWindow'), '.slideInBody');

				// 		$animate.removeClass(element, '.slideInSubmenu');
				// 	}
				// }, true);
			}
		};
	});

// simple animation to add slideLeft class
angular.module('emuwebApp').animation(".slideInSubmenu", function () {
	return {
		addClass: function (element, className) {
			element.addClass('cbp-spmenu-open');
		},
		removeClass: function (element, className) {
			element.removeClass('cbp-spmenu-open');
		}
	}
});

// simple animation to add slideLeft class
angular.module('emuwebApp').animation(".slideInBody", function () {
	return {
		addClass: function (element, className) {
			element.addClass('cbp-spmenu-left-toright');
		},
		removeClass: function (element, className) {
			element.removeClass('cbp-spmenu-left-toright');
		}
	}
});