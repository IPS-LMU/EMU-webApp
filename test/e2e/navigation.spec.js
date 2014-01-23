// tests for Utterence filter 
describe('navigation', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');
	// load demo
	element(by.id('openDemoDBbtn')).click();

	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
	});
	
	it('should have 7 utterances', function() {
	    var elems = element.all(by.repeater('utt in uttList | regex:filterText'));
	    expect(elems.count()).toBe(7);
	});
	
	it('should close left submenu', function() {
	    // expect to be open on load
	    expect(element(by.id('TimelineCtrl')).getAttribute('class')).toMatch(/cbp-spmenu-left-toright/);
	    // close the left submenu
	    element(by.id('submenuOpen')).click();
	    // expect to be closed
	    expect(element(by.id('TimelineCtrl')).getAttribute('class')).toMatch(/cbp-spmenu-left-toleft/);
	});	
	
	it('should open right submenu', function() {
	    // open the right submenu
	    element(by.id('rightSideMenuOpenBtn')).click();
	    // expect to be open
	    expect(element(by.id('TimelineCtrl')).getAttribute('class')).toMatch(/cbp-spmenu-right-toright/);
	});
	
	it('should close right submenu', function() {
	    // open the right submenu
	    element(by.id('rightSideMenuOpenBtn')).click();
	    // expect to be closed
	    expect(element(by.id('TimelineCtrl')).getAttribute('class')).toMatch(/cbp-spmenu-right-toleft/);
	});

	
	it('should select a range in the viewport', function() {
	   var handle = $(".OsciMarkupCanvas")
	   ptor.actions().dragAndDrop(handle.find(), {x:-250, y:0}).perform();
	   
	});	


	it('should overzoom to check boundaries for in and out', function () {
		for (var i = 0; i < 30; i++) {
			element(by.id('zoomInBtn')).click();
		};

		for (var i = 0; i < 30; i++) {
			element(by.id('zoomOutBtn')).click();
		};
	});

	it('should overzoom to check boundaries for left and right', function () {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
		};

		for (var i = 0; i < 30; i++) {
			element(by.id('zoomLeftBtn')).click();
		};
		
		for (var i = 0; i < 40; i++) {
			element(by.id('zoomRightBtn')).click();
		};

		element(by.id('zoomAllBtn')).click();
	});



	it('should move around with zoom', function () {
		for (var i = 0; i < 5; i++) {
			element(by.id('zoomInBtn')).click();
		}

		for (var i = 0; i < 5; i++) {
			element(by.id('zoomLeftBtn')).click();
		}

		for (var i = 0; i < 5; i++) {
			element(by.id('zoomRightBtn')).click();
		}

		for (var i = 0; i < 5; i++) {
			element(by.id('zoomOutBtn')).click();
		}
	});

	it('should move around with zoom', function () {
		element(by.id('playViewBtn')).click();
	});

});