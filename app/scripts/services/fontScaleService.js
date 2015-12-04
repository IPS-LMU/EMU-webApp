'use strict';

angular.module('emuwebApp')
	.service('fontScaleService', function fontScaleService() {
		// shared service object
		var sServObj = {};
		sServObj.lastTextWidth = null;
		sServObj.spaceTop = 0;
		sServObj.scaleY = 0;
		sServObj.scaleX = 0;

		/**
		 *
		 */
		sServObj.drawUndistortedText = function (ctxOriginal, text, fontPxSize, fontType, x, y, color) {
			sServObj.scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
			sServObj.scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
			ctxOriginal.save();
			ctxOriginal.font = (fontPxSize + 'px' + ' ' + fontType);
			ctxOriginal.scale(sServObj.scaleX, sServObj.scaleY);
			ctxOriginal.fillStyle = color;
			ctxOriginal.fillText(text, x / sServObj.scaleX, (y + fontPxSize + sServObj.spaceTop) / sServObj.scaleY);
			ctxOriginal.scale(1, 1);
			ctxOriginal.restore();
		};

		/**
		 *
		 */

		sServObj.drawUndistortedTextTwoLines = function (ctxOriginal, text, text2, fontPxSize, fontType, x, y, color, alignLeft) {
			sServObj.scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
			sServObj.scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
			ctxOriginal.save();
			ctxOriginal.font = (fontPxSize + 'px' + ' ' + fontType);
			ctxOriginal.fillStyle = color;
			ctxOriginal.scale(sServObj.scaleX, sServObj.scaleY);
			if (alignLeft) {
				ctxOriginal.fillText(text, x / sServObj.scaleX, y + fontPxSize + sServObj.spaceTop);
				ctxOriginal.fillText(text2, x / sServObj.scaleX, y + 2 * (fontPxSize) + sServObj.spaceTop);
			} else {
				var a = ctxOriginal.measureText(text).width;
				var b = ctxOriginal.measureText(text2).width;
				// var c;
				if (a > b) {
					ctxOriginal.fillText(text, x / sServObj.scaleX, y + fontPxSize + sServObj.spaceTop);
					ctxOriginal.fillText(text2, (x + (a - b)) / sServObj.scaleX, y + 2 * (fontPxSize) + sServObj.spaceTop);
				} else {
					ctxOriginal.fillText(text, (x + (b - a)) / sServObj.scaleX, y + fontPxSize + sServObj.spaceTop);
					ctxOriginal.fillText(text2, x / sServObj.scaleX, y + 2 * (fontPxSize) + sServObj.spaceTop);
				}
			}
			ctxOriginal.restore();
		};
		return sServObj;
	});
