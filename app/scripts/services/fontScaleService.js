'use strict';

angular.module('emulvcApp')
	.service('fontScaleService', function fontScaleService() {
		// shared service object
		var sServObj = {};
		
		sServObj.lastTextWidth = null;
		sServObj.spaceTop = 5;
		
		sServObj.getTextImage = function(ctxOriginal,text,fontPxSize,fontType,color) {
		    var scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
            var scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
		    var img = document.createElement('canvas');
		    var ctx = img.getContext('2d');
		    ctx.font = (fontPxSize + 'px' + ' ' + fontType);
		    ctx.fillStyle = color;
		    ctx.scale(scaleX,scaleY);
		    ctx.fillText(text, 0,fontPxSize+sServObj.spaceTop);
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
		    sServObj.lastTextWidth = ctx.measureText(text).width * scaleX;
		    if(alignLeft) {
		        ctx.fillText(text, 0,fontPxSize+sServObj.spaceTop);
		        ctx.fillText(text2, 0,2*(fontPxSize)+sServObj.spaceTop);
		    }
		    else {
		        var a = ctx.measureText(text).width;
		        var b = ctx.measureText(text2).width;
		        var c;
		        if(a>b) {
    		        ctx.fillText(text, 0,fontPxSize+sServObj.spaceTop);
	    	        ctx.fillText(text2, (a-b),2*(fontPxSize)+sServObj.spaceTop);		    
		        }
		        else {
    		        ctx.fillText(text, (b-a),fontPxSize+sServObj.spaceTop);
	    	        ctx.fillText(text2, 0,2*(fontPxSize)+sServObj.spaceTop);		    
		        }
		    }
		    return img;
		    
		};					
		return sServObj;
	});