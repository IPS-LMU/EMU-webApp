import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('previewtrack', function (ViewStateService, SoundHandlerService) {
		return {
			restrict: 'A',
			scope: {},
			link: function (scope, element) {

				var startPCM = -1;

				///////////////
				// bindings


				element.bind('click', function (x) {
					if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
						var width = ViewStateService.curViewPort.eS - ViewStateService.curViewPort.sS;
						startPCM = ViewStateService.getX(x) * (SoundHandlerService.audioBuffer.length / x.originalEvent.target.width);
						if (startPCM - (width / 2) < 0) {
							startPCM = Math.ceil(width / 2);
						}
						else if (startPCM + (width / 2) > SoundHandlerService.audioBuffer.length) {
							startPCM = Math.floor(SoundHandlerService.audioBuffer.length - (width / 2));
						}
						if (!ViewStateService.isEditing()) {
							scope.$apply(function () {
								ViewStateService.setViewPort(startPCM - (width / 2), startPCM + (width / 2));
							});
						}
					}
				});

				//
				element.bind('mousedown', function (x) {
					if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
						startPCM = ViewStateService.getX(x) * (SoundHandlerService.audioBuffer.length / x.originalEvent.target.width);
					}
				});

				//
				element.bind('mousemove', function (x) {
					var mbutton = 0;
					if (x.buttons === undefined) {
						mbutton = x.which;
					} else {
						mbutton = x.buttons;
					}
					switch (mbutton) {
						case 1:
							if (startPCM !== -1) {
								var width = ViewStateService.curViewPort.eS - ViewStateService.curViewPort.sS;
								startPCM = ViewStateService.getX(x) * (SoundHandlerService.audioBuffer.length / x.originalEvent.target.width);
								if (!ViewStateService.isEditing()) {
									scope.$apply(function () {
										ViewStateService.setViewPort((startPCM - (width / 2)), (startPCM + (width / 2)));
									});
								}
							}
							break;
					}
				});

				//
				element.bind('mouseup', function () {
					startPCM = -1;
				});

				//
				element.bind('mouseout', function () {
					startPCM = -1;
				});
			}
		};
	});
