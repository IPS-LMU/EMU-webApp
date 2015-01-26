'use strict';

angular.module('emuwebApp')
  .directive('dragout', function (DataService, loadedMetaDataService, browserDetector, ConfigProviderService) {
    return {
      restrict: 'A',
      replace:true,
      scope: {
        name: '@'
      },
      link: function (scope, element, attrs) {
        scope.cps = ConfigProviderService;
        var el = element[0];
        var dragIcon = document.createElement('img');
            dragIcon.src = 'img/exportBtn.png';
        var dataString = '';
        
        scope.generateURL = function () {
            return scope.getURL(angular.toJson(DataService.getData(), true));
        };
        
        scope.isActive = function () {
            return (attrs.name === loadedMetaDataService.getCurBndl().name && scope.cps.vals.main.comMode === 'embedded');
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
					this.classList.add('drag');
					var url = scope.generateURL();
					if(browserDetector.isBrowser.Firefox() || browserDetector.isBrowser.Chrome()) {
					    e.dataTransfer.setDragImage(dragIcon, -10, -10);
					    e.dataTransfer.effectAllowed = 'move';
					    e.dataTransfer.setData('DownloadURL', 'application/json:'+attrs.name+'_annot.json:' + url);
					}
                } 
                else {
					console.log('dropping inactive bundles is not allowed');			        
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