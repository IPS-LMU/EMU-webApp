import * as angular from 'angular';

class BrowserDetectorService{
	
	public isMobile;
	public isBrowser;
	
	constructor(){
		this.isMobile = {
			Android: () => {
				return navigator.userAgent.match(/Android/i);
			},
			BlackBerry: () => {
				return navigator.userAgent.match(/BlackBerry/i);
			},
			iOS: () => {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			},
			Opera: () => {
				return navigator.userAgent.match(/Opera Mini/i);
			},
			Windows: () => {
				return navigator.userAgent.match(/IEMobile/i);
			},
			any: () => {
				return (this.isMobile.Android() ||
				this.isMobile.BlackBerry() ||
				this.isMobile.iOS() ||
				this.isMobile.Opera() ||
				this.isMobile.Windows());
			}
		};
		
		this.isBrowser = {
			Firefox: () => {
				return navigator.userAgent.match(/Firefox/i);
			},
			Chrome: () => {
				return navigator.userAgent.match(/Chrome/i);
			},
			InternetExplorer: () => {
				return navigator.userAgent.match(/MSIE/i);
			},
			Opera: () => {
				return navigator.userAgent.match(/Opera/i);
			},
			PhantomJS: () => {
				return navigator.userAgent.match(/PhantomJS/i);
			},
			HeadlessChrome: () => {
				return navigator.userAgent.match(/HeadlessChrome/i);
			},
			Safari: () => {
				return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
			},
			any: () => {
				return (this.isBrowser.Firefox() ||
				this.isBrowser.Chrome() ||
				this.isBrowser.InternetExplorer() ||
				this.isBrowser.Opera() ||
				this.isBrowser.Safari() ||
				this.isBrowser.PhantomJS());
			}
		};
		
	}
	
	
	public isMobileDevice() {
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
	
	public isDesktopDevice () {
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
.service('BrowserDetectorService', BrowserDetectorService);
