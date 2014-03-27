'use strict';


angular.module('emuwebApp')
.directive('bundleListSideBar', function ($animate) {
	return {
		templateUrl: 'views/bundleListSideBar.html',
		restrict: 'E',
		link: function postLink(scope, element, attr) {

			scope.$watch('vs.submenuOpen', function () {

				var dotMs = scope.vs.getTransitionTime();

				var transcss = {
					'-webkit-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
					'-moz-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
					'-ms-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
					'-o-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
					'transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out'
				};

				// alert("sdfsdf")
				element.css(transcss);
            $('#mainWindow').css(transcss);            
            if(scope.vs.submenuOpen) {

               $animate.addClass($('#mainWindow'), '.slideInBody');
               $animate.addClass(element, '.slideInSubmenu');
           }
           else {
           		$animate.removeClass($('#mainWindow'), '.slideInBody');

               $animate.removeClass(element, '.slideInSubmenu');
           }
       }, true);
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