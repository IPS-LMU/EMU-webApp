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
			        console.log(newValue);
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
					var str;
					switch (code) {
					case 8:
						str = 'BACKSPACE';
						break;
					case 9:
						str = 'TAB';
						break;
					case 13:
						str = 'ENTER';
						break;
					case 16:
						str = 'SHIFT';
						break;
					case 18:
						str = 'ALT';
						break;
					case 32:
						str = 'SPACE';
						break;
					case 37:
						str = '←';
						break;
					case 39:
						str = '→';
						break;
					case 38:
						str = '↑';
						break;
					case 40:
						str = '↓';
						break;
					case 42:
						str = '+';
						break;
					case 43:
						str = '+';
						break;								
					case 45:
						str = '-';
						break;
					case 95:
						str = '-';
						break;				
					default:
						str = String.fromCharCode(code);
					}
					return str;
				};
			}
		};
	});