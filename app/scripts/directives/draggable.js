'use strict';

angular.module('emuwebApp')
  .directive('draggable', function (DataService, loadedMetaDataService) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var el = element[0];
        
        
        scope.generateURL = function (name) {
            return scope.getURL(angular.toJson(DataService.getData(), true));
        };
        
        scope.getURL = function (data) {
		    var objURL;
		    if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
		        objURL = webkitURL.createObjectURL(scope.getBlob(data));
		    } else {
		        objURL = URL.createObjectURL(scope.getBlob(data));
		    }
		    return objURL;     
        };
        
        scope.getBlob = function (data) {
		    var blob;
		    try {
		        blob = new Blob([data], {type: 'text/plain'});
		    } catch (e) { // Backwards-compatibility
		        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
		        blob = new BlobBuilder();
		        blob.append(data);
		        blob = blob.getBlob();
		    }
		    return blob;        
        };
        
 
         el.addEventListener(
            'mousedown',
            function(e) {
				if (attrs.name === loadedMetaDataService.getCurBndl().name) {
					el.draggable = true;
				}
				else {
					el.draggable = false;
				} 
                return false;
            },
            false
        );
 
        
        el.addEventListener(
            'dragstart',
			function(e) {
			    var url = scope.generateURL();
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('DownloadURL', attrs.url + url);
                this.classList.add('drag');
                return false;
            },
            false
        );

        el.addEventListener(
            'dragend',
            function(e) {
                this.classList.remove('drag');
                return false;
            },
            false
        );
        
      }
    };
  });