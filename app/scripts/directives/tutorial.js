'use strict';

angular.module('emuwebApp')
	.directive('tutorial', function (viewState, Iohandlerservice, ConfigProviderService) {
		return {
			templateUrl: 'views/tutorial.html',
			restrict: 'E',
			scope: { },
			link: function postLink(scope, element, attrs) {
			
			    scope.counter = 0;
			    scope.css = [];
			    scope.vs = viewState;
			    scope.cps = ConfigProviderService;
			    scope.cssDone = {color:'#222'};
			    scope.cssNotDone = {color:'#ddd'};
			    scope.cssActive = {color:'red', 'font-size': '18px'};
			    scope.que = [];

			    
			    scope.$watch('vs.lastKeyCode', function(newValue, oldValue) {
			        if(newValue!==undefined) {
						if(newValue===scope.que[scope.counter]) {
							++scope.counter
						}
			        }
			    });
			    
			    
			    scope.getClass = function (i) {
			        if(i==scope.counter) {
			            return scope.cssActive;
			        } else if(i<scope.counter) {
			            return scope.cssDone;
			        } else {
			            return scope.cssNotDone;
			        }
			    };

				scope.getStrRep = function (id, code) {
				    scope.que[id] = code;
					return ConfigProviderService.getStrRep(code);
				};
			}
		};
	});