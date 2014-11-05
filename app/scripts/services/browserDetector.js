'use strict';

angular.module('emuwebApp')
  .factory('browserDetector', function () {

    //shared service object to be returned
    var sServObj = {};
    
    sServObj.isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function() {
			return (sServObj.isMobile.Android() || 
			        sServObj.isMobile.BlackBerry() || 
			        sServObj.isMobile.iOS() || 
			        sServObj.isMobile.Opera() || 
			        sServObj.isMobile.Windows());
		}
	}; 
	
    sServObj.isBrowser = {
		Firefox: function() {
			return navigator.userAgent.match(/Firefox/i);
		},
		Chrome: function() {
			return navigator.userAgent.match(/Chrome/i);
		},
		InternetExplorer: function() {
			return navigator.userAgent.match(/MSIE/i);
		},
		Opera: function() {
			return navigator.userAgent.match(/Opera/i);
		},
		any: function() {
			return (sServObj.isBrowser.Firefox() || 
			        sServObj.isBrowser.Chrome() || 
			        sServObj.InternetExplorer.iOS() || 
			        sServObj.Opera.Opera());
		},
		other: function() {
			return !(sServObj.isBrowser.Firefox() || 
			        sServObj.isBrowser.Chrome() || 
			        sServObj.InternetExplorer.iOS() || 
			        sServObj.Opera.Opera());
		}
	};
	
    sServObj.mobile = function () {
        return sServObj.isMobile.any();
    };

    sServObj.known = function () {
        return sServObj.isBrowser.any();
    };
    
    return sServObj;

  });
