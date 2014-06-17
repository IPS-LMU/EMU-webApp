// tests for Utterence filter 
describe('navigation', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');
	
	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
	});	
	

	// afterEach it
	afterEach(function () {
		element(by.id('zoomAllBtn')).click();
	});	
	

	it('should have 2 bundles', function() {
	    var elems = element.all(by.repeater('bundle in bundleList | regex:filterText'));
	    expect(elems.count()).toBe(2);
	});
	
	it('should close submenu', function() {
	    element(by.id('submenuOpen')).click();
	});	

	
	it('should select a range in the viewport', function() {
	   ptor.actions().dragAndDrop($(".emuwebapp-timelineCanvasMarkup")[0] , { x: 40, y: 40 }).perform();
	   ptor.sleep(1000);
	});	
	
	it('should open label rename div', function() {
	   ptor.actions().mouseMove(element(by.id('Phonetic'))).doubleClick().perform();
	   ptor.sleep(1000);
	});		
	
	it('should zoom in to the selected viewing range', function() {
	   element(by.id('zoomSelBtn')).click();
	});		

	it('should zoom out to default view', function() {
	   element(by.id('zoomAllBtn')).click();
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