'use strict';

describe('Factory: browserDetector', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

  /**
   *
   */
  it('should check if mobile', inject(function (browserDetector) {
      expect(browserDetector.isMobileDevice()).toBe(false);
      expect(browserDetector.isDesktopDevice()).toBe(true);
  }));
  
  /**
   *
   */
  it('should check if mobile on mobile', inject(function (browserDetector) {
      setUserAgent(window, 'iPhone');
      expect(browserDetector.isMobileDevice()).toBe(true);
      setUserAgent(window, 'iPad');
      expect(browserDetector.isMobileDevice()).toBe(true);
      setUserAgent(window, 'iPod');
      expect(browserDetector.isMobileDevice()).toBe(true);
      setUserAgent(window, 'Android');
      expect(browserDetector.isMobileDevice()).toBe(true);
      setUserAgent(window, 'BlackBerry');
      expect(browserDetector.isMobileDevice()).toBe(true);
  }));  
  
  
	function setUserAgent(window, userAgent) {
		if (window.navigator.userAgent != userAgent) {
			var userAgentProp = { get: function () { return userAgent; } };
			try {
				Object.defineProperty(window.navigator, 'userAgent', userAgentProp);
			} catch (e) {
				window.navigator = Object.create(navigator, {
					userAgent: userAgentProp
				});
			}
		}
	}  
  
});