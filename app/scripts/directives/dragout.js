'use strict';

angular.module('emuwebApp')
  .directive('dragout', function (DataService, loadedMetaDataService) {
    return {
      restrict: 'A',
      replace:true,
      scope: {
        name: '@'
      },
      link: function (scope, element, attrs) {
        var el = element[0];
        
        scope.generateURL = function (name) {
            return scope.getURL(angular.toJson(DataService.getData(), true));
        };
        
        scope.isActive = function () {
            return (scope.name === loadedMetaDataService.getCurBndl().name);
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
            'dragstart',
			function(e) {
				if(scope.isActive()) {		
					var dragIcon = document.createElement('img');
					dragIcon.src = 'img/saveBtn.png';
					e.dataTransfer.setDragImage(dragIcon, 10, 10);			        
					var url = scope.generateURL();
					e.dataTransfer.effectAllowed = 'move';
					e.dataTransfer.setData('DownloadURL', 'application/json:'+attrs.name+'_annot.json:' + url);
					this.classList.add('drag');
                } 
                else {
					var dragIcon = document.createElement('img');
					e.dataTransfer.setDragImage(dragIcon, 10, 10);			        
                }
                return false;
            },
            false
        );

        el.addEventListener(
            'dragend',
            function(e) {
                if(scope.isActive()) {	
                    this.classList.remove('drag');
                }
                return false;
            },
            false
        );

        el.addEventListener(
            'mousedown',
            function(e) {
                if(scope.isActive()) {	
                    el.setAttribute('draggable', true);
                }
                else {
                    el.setAttribute('draggable', false);
                    el.removeAttribute('dragable');
                }
            },
            false
        );
        
      }
    };
  });