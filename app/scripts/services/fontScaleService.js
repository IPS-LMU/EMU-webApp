'use strict';

angular.module('emulvcApp')
	.service('fontScaleService', function fontScaleService() {
		// shared service object
		var sServObj = {};
		
		sServObj.lastTextWidth = null;
		
		sServObj.getTextImage = function(ctxOriginal,text,fontPxSize,fontType,color) {
		    var scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
            var scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
		    var img = document.createElement('canvas');
		    var ctx = img.getContext('2d');
		    ctx.font = (fontPxSize + 'px' + ' ' + fontType);
		    ctx.fillStyle = color;
		    ctx.scale(scaleX,scaleY);
		    ctx.fillText(text, 0,15);
		    sServObj.lastTextWidth = ctx.measureText(text).width * scaleX;
		    return img;
		};	
		sServObj.getLastImageWidth = function() {
		    return sServObj.lastTextWidth;
		};			
		sServObj.getTextImageTwoLines = function(ctxOriginal,text,text2,fontPxSize,fontType,color,alignLeft) {
		    var scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
            var scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;	
		    var img = document.createElement('canvas');
		    var ctx = img.getContext('2d');
		    ctx.font = (fontPxSize + 'px' + ' ' + fontType);
		    ctx.fillStyle = color;
		    ctx.scale(scaleX,scaleY);
		    if(alignLeft) {
		        ctx.fillText(text, 0,15);
		        ctx.fillText(text2, 0,20+(fontPxSize));
		    }
		    else {
		        var a = ctx.measureText(text).width;
		        var b = ctx.measureText(text2).width;
		        var c;
		        if(a>b) {
    		        ctx.fillText(text, 0,15);
	    	        ctx.fillText(text2, (a-b),20+(fontPxSize));		    
		        }
		        else {
    		        ctx.fillText(text, (b-a),15);
	    	        ctx.fillText(text2, 0,20+(fontPxSize));		    
		        }
		    }
		    return img;
		    
		};					
		return sServObj;
	});