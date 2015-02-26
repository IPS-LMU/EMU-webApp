'use strict';

angular.module('emuwebApp')
	.service('fontScaleService', function fontScaleService() {
		// shared service object
		var sServObj = {};

		sServObj.lastTextWidth = null;
		sServObj.spaceTop = 0;

		/**
		 *
		 */
		sServObj.getTextImage = function (ctxOriginal, text, fontPxSize, fontType, color) {
			var scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
			var scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
			fontPxSize = Math.floor(fontPxSize+2-(scaleY/2));
			var img = document.createElement('canvas');
			img.setAttribute('width',Math.round(scaleX*200));
			img.setAttribute('height',Math.round(scaleY*100));
			var ctx = img.getContext('2d');
			ctx.save();
			ctx.font = (fontPxSize + 'px' + ' ' + fontType);
			ctx.fillStyle = color;
			ctx.scale(scaleX, scaleY);
			ctx.fillText(text, 0, fontPxSize + sServObj.spaceTop);
			sServObj.lastTextWidth = ctx.measureText(text).width * scaleX;

			// draw frame to see size
			ctx.restore();

			// ctx.fillStyle = "red";
			// ctx.strokeStyle = "red";
			// ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
			// ctx.stroke();
			return img;
		};
		/**
		 *
		 */
		sServObj.getLastImageWidth = function () {
			return sServObj.lastTextWidth;
		};

		/**
		 *
		 */
		sServObj.getTextImageTwoLines = function (ctxOriginal, text, text2, fontPxSize, fontType, color, alignLeft) {
			var scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
			var scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
			fontPxSize = Math.floor(fontPxSize+2-(scaleY/2));
			var img = document.createElement('canvas');
			img.setAttribute('width',Math.round(scaleX*200));
			img.setAttribute('height',Math.round(scaleY*100));
			var ctx = img.getContext('2d');

			ctx.save();
			ctx.font = (fontPxSize + 'px' + ' ' + fontType);
			ctx.fillStyle = color;
			ctx.scale(scaleX, scaleY);
			sServObj.lastTextWidth = ctx.measureText(text).width * scaleX;

			if (alignLeft) {
				ctx.fillText(text, 0, fontPxSize + sServObj.spaceTop);
				ctx.fillText(text2, 0, 2 * (fontPxSize) + sServObj.spaceTop);
			} else {
				var a = ctx.measureText(text).width;
				var b = ctx.measureText(text2).width;
				// var c;
				if (a > b) {
					ctx.fillText(text, 0, fontPxSize + sServObj.spaceTop);
					ctx.fillText(text2, (a - b), 2 * (fontPxSize) + sServObj.spaceTop);
				} else {
					ctx.fillText(text, (b - a), fontPxSize + sServObj.spaceTop);
					ctx.fillText(text2, 0, 2 * (fontPxSize) + sServObj.spaceTop);
				}
			}

			// draw frame to see size
			ctx.restore();

			// ctx.fillStyle = 'red';
			// ctx.strokeStyle = 'red';
			// ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
			// ctx.stroke();

			return img;

		};
		return sServObj;
	});