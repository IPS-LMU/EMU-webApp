'use strict';

angular.module('emulvcApp')
	.service('fontScaleService', function fontScaleService() {
		// shared service object
		var sServObj = {};
		sServObj.getTextImage = function(ctxOriginal,text,fontPxSize,fontType,color) {
		    var scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
            var scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
		    var img = document.createElement('canvas');
		    var ctx = img.getContext('2d');
		    ctx.font = (fontPxSize + 'px' + ' ' + fontType);
		    ctx.fillStyle = color;
		    ctx.scale(scaleX,scaleY);
		    ctx.fillText(text, 0,15);
		    return img;
		    
		};	
		sServObj.getTextImageTwoLines = function(ctxOriginal,text,text2,fontPxSize,fontType,color) {
		    var scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
            var scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;	
		    var img = document.createElement('canvas');
		    var ctx = img.getContext('2d');
		    ctx.font = (fontPxSize + 'px' + ' ' + fontType);
		    ctx.fillStyle = color;
		    ctx.scale(scaleX,scaleY);
		    ctx.fillText(text, 0,15);
		    ctx.fillText(text2, 0,20+(fontPxSize*scaleY));
		    return img;
		    
		};					
		return sServObj;
	});