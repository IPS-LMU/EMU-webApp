'use strict';

angular.module('emuwebApp')
	.factory('browserDetector', function () {

		//shared service object to be returned
		var sServObj = {};

		sServObj.isMobile = {
			Android: function () {
				return navigator.userAgent.match(/Android/i);
			},
			BlackBerry: function () {
				return navigator.userAgent.match(/BlackBerry/i);
			},
			iOS: function () {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			},
			Opera: function () {
				return navigator.userAgent.match(/Opera Mini/i);
			},
			Windows: function () {
				return navigator.userAgent.match(/IEMobile/i);
			},
			any: function () {
				return (sServObj.isMobile.Android() ||
				sServObj.isMobile.BlackBerry() ||
				sServObj.isMobile.iOS() ||
				sServObj.isMobile.Opera() ||
				sServObj.isMobile.Windows());
			}
		};

		sServObj.isBrowser = {
			Firefox: function () {
				return navigator.userAgent.match(/Firefox/i);
			},
			Chrome: function () {
				return navigator.userAgent.match(/Chrome/i);
			},
			InternetExplorer: function () {
				return navigator.userAgent.match(/MSIE/i);
			},
			Opera: function () {
				return navigator.userAgent.match(/Opera/i);
			},
			PhantomJS: function () {
				return navigator.userAgent.match(/PhantomJS/i);
			},
			HeadlessChrome: function(){
				return navigator.userAgent.match(/HeadlessChrome/i);
			},
			Safari: function () {
				return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
			},
			any: function () {
				return (sServObj.isBrowser.Firefox() ||
				sServObj.isBrowser.Chrome() ||
				sServObj.isBrowser.InternetExplorer() ||
				sServObj.isBrowser.Opera() ||
				sServObj.isBrowser.Safari() ||
				sServObj.isBrowser.PhantomJS());
			}
		};

		sServObj.isMobileDevice = function () {
			var data = sServObj.isMobile.any();
			if (data === null) {
				return false;
			}
			else {
				if (data.length > 0) {
					return true;
				}
				else {
					return false;
				}
			}
		};

		sServObj.isDesktopDevice = function () {
			var data = sServObj.isBrowser.any();
			if (data === null) {
				return false;
			}
			else {
				if (data.length > 0) {
					return true;
				}
				else {
					return false;
				}
			}
		};

		return sServObj;

	});
