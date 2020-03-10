import * as angular from 'angular';

class BrowserDetector{
	
	public isMobile;
	public isBrowser;
	
	constructor(){
		this.isMobile = {
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
				return (this.isMobile.Android() ||
				this.isMobile.BlackBerry() ||
				this.isMobile.iOS() ||
				this.isMobile.Opera() ||
				this.isMobile.Windows());
			}
		};
		
		this.isBrowser = {
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
				return (this.isBrowser.Firefox() ||
				this.isBrowser.Chrome() ||
				this.isBrowser.InternetExplorer() ||
				this.isBrowser.Opera() ||
				this.isBrowser.Safari() ||
				this.isBrowser.PhantomJS());
			}
		};
		
	}
	
	
	public isMobileDevice = function () {
		var data = this.isMobile.any();
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
	
	public isDesktopDevice = function () {
		var data = this.isBrowser.any();
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
	
}

angular.module('emuwebApp')
.service('browserDetector', BrowserDetector);
