'use strict';

angular.module('emuwebApp')
	.directive('twoDimCanvases', function () {
		return {
			templateUrl: 'views/twoDcanvases.html',
			restrict: 'E',
			replace: true,
			transclude: true,
			link: function postLink(scope, element, attrs) {
				// create drag bars
				var topResizer = angular.element('<div class="twoDimCanvasesTopResizer"></div>');
				var leftResizer = angular.element('<div class="twoDimCanvasesLeftResizer"></div>');

				var drag = false;
				var dragTop = false;
				var dragLeft = false;

				element.append(topResizer);
				element.append(leftResizer);

				element.bind('mousemove', function (ev) {
					if (!drag) {
						return;
					}
					var bounds = element[0].getBoundingClientRect();
					var pos = 0;
					if (dragTop) {
						var height = bounds.bottom - bounds.top;
						pos = ev.clientY - bounds.top;
						var newTop = bounds.top + pos;
						console.log(newTop)
						element.css('top', newTop - 44 + 'px');
					}
					if (dragLeft) {
						var height = bounds.bottom - bounds.top;
						pos = ev.clientX - bounds.left;
					}

					topResizer.css('top', pos + 'px');
					leftResizer.css('left', pos + 'px');
					console.log(pos);
					console.log(bounds);
					// element.css('height','calc(100px - ' + pos + 'px)');


				});

				topResizer.bind('mousedown', function (ev) {
					ev.preventDefault();
					drag = true;
					dragTop = true;
				});

				leftResizer.bind('mousedown', function (ev) {
					ev.preventDefault();
					drag = true;
					dragLeft = true;
				});

				angular.element(document).bind('mouseup', function (ev) {
					drag = false;
					dragTop = false;
					dragLeft = false;
				});
			}
		};
	});