'use strict';


angular.module('emulvcApp')
  .directive('submenu', function ($animate) {
    return {
      templateUrl: 'views/leftSubmenu.html',
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
			$('.moveLeftSubmenu').css(transcss);
			element.css(transcss);
        
        
           if(scope.vs.submenuOpen) {
               $animate.addClass(element, '.slideInSubmenu');
               $('.moveLeftSubmenu').addClass('cbp-spmenu-left-toright');
           }
           else {
               $animate.removeClass(element, '.slideInSubmenu');
               $('.moveLeftSubmenu').removeClass('cbp-spmenu-left-toright');
           }
        }, true);
      }
    };
  });

  
// simple animation to add slideLeft class
angular.module('emulvcApp').animation(".slideInSubmenu", function () {
	return {
		addClass: function (element, className) {
			element.addClass('cbp-spmenu-open');
		},
		removeClass: function (element, className) {
			element.removeClass('cbp-spmenu-open');
		}
	}
});