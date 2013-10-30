'use strict';


angular.module('emulvcApp')
	.directive('draggable', ['$rootScope', 'uuid', function($rootScope, uuid) {
	    return {
	        restrict: 'A',
	        link: function(scope, elem, attrs, controller) {
	            var id = angular.element(elem).attr("id");
	            if (!id) {
	                id = uuid.new()
	                angular.element(elem).attr("id", id);
	            }
	            elem.bind("dragstart", function(e) {
	                e.originalEvent.dataTransfer.setData('text', id);
	                angular.element(elem).addClass('dragDragging');
	                $rootScope.$emit("dragStart");
	            });
	            elem.bind("dragend", function(e) {
	                angular.element(elem).removeClass('dragDragging');
	                $rootScope.$emit("dragEnd");
	            });
	        }
    	}
	}]);

angular.module('emulvcApp')
	.directive('dropable', ['$rootScope', 'uuid', function($rootScope, uuid) {
	    return {
	        restrict: 'A',
	        scope: {
	            onDrop: '&'
	        },
	        link: function(scope, elem, attrs, controller) {
	            var id = angular.element(elem).attr("id");
	            if (!id) {
	                id = uuid.new()
	                angular.element(elem).attr("id", id);
	            }      
	            elem.bind("dragover", function(e) {
	              if (e.preventDefault) {
	                e.preventDefault(); // Necessary. Allows us to drop.
	              }
	              e.originalEvent.dataTransfer.dropEffect = 'move';  
	              return false;
	            });
	            elem.bind("dragenter", function(e) {
	              // this / e.target is the current hover target.
	              angular.element(e.target).addClass('dragOver');
	            });
	            elem.bind("dragleave", function(e) {
	              angular.element(e.target).removeClass('dragOver');  // this / e.target is previous target element.
	            });
	            elem.bind("drop", function(e) {
	              if (e.preventDefault) {
	                e.preventDefault(); // Necessary. Allows us to drop.
	              }

	              if (e.stopPropogation) {
	                e.stopPropogation(); // Necessary. Allows us to drop.
	              }
	            	var data = e.originalEvent.dataTransfer.getData("text");
	                var dest = document.getElementById(id);
	                var src = document.getElementById(data);
	                angular.element(e.target).removeClass("dragTarget");
	                angular.element(e.target).removeClass("dragOver");
	                scope.drop(src, dest);	                
	            });
	            $rootScope.$on("dragStart", function() {
	                var el = document.getElementById(id);
	                angular.element(el).addClass("dragTarget");
	            });
	            $rootScope.$on("dragEnd", function() {
	                var el = document.getElementById(id);
	                angular.element(el).removeClass("dragTarget");
	                angular.element(el).removeClass("dragOver");
	            });
	        }
    	}
	}]);