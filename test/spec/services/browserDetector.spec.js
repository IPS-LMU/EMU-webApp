'use strict';

describe('Factory: browserDetector', function () {

  var $window;
  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(inject(function(_$window_) {
      $window = _$window_;
  }));

  /**
   *
   */
  it('should check if mobile', inject(function (browserDetector) {
      expect(browserDetector.isMobileDevice()).toBe(false);
  }));
  
  /**
   *
   */
  it('should check if mobile on mobile', inject(function (browserDetector) {
      if(!navigator.userAgent.match(/Chrome/i)){ // check if window.navigator can be set (= read only property in chrome)
        setUserAgent($window, 'iPhone');
        expect(browserDetector.isMobileDevice()).toBe(true);
        setUserAgent($window, 'iPad');
        expect(browserDetector.isMobileDevice()).toBe(true);
        setUserAgent($window, 'iPod');
        expect(browserDetector.isMobileDevice()).toBe(true);
        setUserAgent($window, 'Android');
        expect(browserDetector.isMobileDevice()).toBe(true);
        setUserAgent($window, 'BlackBerry');
        expect(browserDetector.isMobileDevice()).toBe(true);
      }
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