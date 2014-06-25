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
	    ptor.sleep(250);
	});		
	
	it('should open & close submenu with shortcuts', function() {
	    ptor.actions().sendKeys('o').perform();
	    ptor.sleep(500);
	    ptor.actions().sendKeys('o').perform();
	    ptor.sleep(500);
	});		
	
	it('should zoom in and out three timeline canvases', function() {
	    var elem1 = element.all(by.css('.emuwebapp-levelResizeBtn')).get(0);
	    var elem2 = element.all(by.css('.emuwebapp-levelResizeBtn')).get(1);
	    var elem3 = element.all(by.css('.emuwebapp-levelResizeBtn')).get(2);
	    elem1.click();
	    ptor.sleep(250);
	    elem1.click();
	    ptor.sleep(250);
	    elem2.click();
	    ptor.sleep(250);
	    elem2.click();
	    ptor.sleep(250);
	    elem3.click();
	    ptor.sleep(250);
	    elem3.click();
	    ptor.sleep(250);	    	    
	});	
	
	it('should move dividing pane up and down', function() {
	    var elem = element.all(by.css('.emuwebapp-split-handler')).get(0);
		ptor.actions()
		    .mouseMove(elem)
		    .click()		    
		    .mouseDown()
		    .mouseMove({ x: 0, y:90 })
		    .mouseUp()
		.perform();
	    ptor.sleep(250);
		ptor.actions()
		    .mouseMove(elem)
		    .click()		    
		    .mouseDown()
		    .mouseMove({ x: 0, y:-180 })
		    .mouseUp()
		.perform();
	    ptor.sleep(250);
		ptor.actions()
		    .mouseMove(elem)
		    .click()		    
		    .mouseDown()
		    .mouseMove({ x: 0, y:90 })
		    .mouseUp()
		.perform();
	    ptor.sleep(250);	    	    
	    
	});			
	
	it('should move around with zoom (with shortcuts)', function () {
		for (var i = 0; i < 5; i++) {
			ptor.actions().sendKeys('w').perform();
		}

		for (var i = 0; i < 5; i++) {
			ptor.actions().sendKeys('a').perform();
		}

		for (var i = 0; i < 5; i++) {
			ptor.actions().sendKeys('d').perform();
		}

		for (var i = 0; i < 5; i++) {
			ptor.actions().sendKeys('s').perform();
		}
	});	
	
	it('should move around with zoom (with navigationbar)', function () {
		for (var i = 0; i < 3; i++) {
			ptor.actions().sendKeys('w').perform();
		}
		var elem = element.all(by.css('.emuwebapp-previewMarkupCanvas')).get(0);
		ptor.actions()
		    .mouseMove(elem)
		    .click()		    
		    .mouseDown()
		    .mouseMove({ x: -100, y:0 })
		    .mouseUp()
		.perform();
	    ptor.sleep(250);
		ptor.actions()
		    .mouseMove(elem)
		    .click()		    
		    .mouseDown()
		    .mouseMove({ x: 200, y:0 })
		    .mouseUp()
		.perform();
	    ptor.sleep(250);	    
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
	});
	
		
	it('should tab in both directions', function() {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
		};
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomRightBtn')).click();
		};		
	    ptor.actions().mouseMove(element(by.id('Phonetic'))).mouseMove( { x: -200, y: 0 }).click().perform();
	    for (var i = 0; i < 4; i++) {
	        ptor.actions().sendKeys(protractor.Key.TAB).perform();
	        ptor.sleep(200);
		};		    
	    for (var i = 0; i < 4; i++) {
	        ptor.actions().keyDown(protractor.Key.SHIFT).sendKeys(protractor.Key.TAB).keyUp(protractor.Key.SHIFT).perform();
	        ptor.sleep(200);
		};		    
	});		

	it('should move a boundary on SEGMENT tier', function() {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		};	
		var elem = element.all(by.css('.emuwebapp-levelMarkupCanvas')).get(0);
		ptor.actions()
		    .mouseMove(elem)
		    .click()		    
		    .keyDown(protractor.Key.SHIFT)
		    .mouseMove({ x: -80, y:0 })
		    .keyUp(protractor.Key.SHIFT)
		.perform();
	    ptor.sleep(250);
	    ptor.actions().sendKeys('z').perform();	
	    ptor.sleep(250);
	});	
	
	it('should move a segment on SEGMENT tier', function() {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		};	
		var elem = element.all(by.css('.emuwebapp-levelMarkupCanvas')).get(0);
		ptor.actions()
		    .mouseMove(elem)
		    .click()
		    .keyDown(protractor.Key.ALT)
		    .mouseMove({ x: -100, y:0 })
		    .keyUp(protractor.Key.ALT)
		.perform();
	    ptor.sleep(500);
	});		
	
	it('should move a element on EVENT tier', function() {
		var elem = element.all(by.css('.emuwebapp-levelMarkupCanvas')).get(1);
		ptor.actions()
		    .mouseMove(elem)
		    .click()	
		    .mouseMove({ x: -30, y:0 })	    
		    .keyDown(protractor.Key.SHIFT)
		    .mouseMove({ x: -100, y:0 })
		    .keyUp(protractor.Key.SHIFT)
		.perform();
	    ptor.sleep(250);
	});			
	
	it('should open, rename and save on SEGMENT', function() {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		};
		var elem = element.all(by.css('.emuwebapp-levelMarkupCanvas')).get(0);
		ptor.actions()
		    .mouseMove(elem)
	        .doubleClick()
	    .perform();
	    var area = by.css('.emuwebapp-labelEdit'); 
	    expect(ptor.isElementPresent(area)).toBe(true);
	    element(by.css('.emuwebapp-labelEdit')).sendKeys('TEST');
	    ptor.actions().sendKeys(protractor.Key.ENTER).perform();
	    ptor.sleep(250);
	});
	
	it('should insert a new boundary on SEGMENT tier', function() {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		};
		var elem = element.all(by.css('.emuwebapp-timelineCanvasMarkup')).get(0);
		ptor.actions()
		    .mouseMove(elem)
		    .mouseMove({ x: -50, y:0 })	  
		    .click()
	    .perform();
	    ptor.actions().sendKeys(protractor.Key.ENTER).perform();
	    ptor.sleep(250);
	});	
	
	it('should insert a new segment on SEGMENT tier', function() {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		};
		var elem = element.all(by.css('.emuwebapp-timelineCanvasMarkup')).get(0);
	   ptor.actions()
	       .mouseMove(elem)
	       .mouseMove({ x: -25, y: 0 })
	       .mouseDown()
	       .mouseMove({ x: 25, y: 0 })
	       .mouseUp()
	    .perform();
	    ptor.actions().sendKeys(protractor.Key.ENTER).perform();
	    ptor.sleep(250);
	});	
	
	it('should insert a new element on EVENT tier', function() {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		};
		var elem = element.all(by.css('.emuwebapp-levelMarkupCanvas')).get(1);
		ptor.actions()
		    .mouseMove(elem)
		    .click()	
		.perform();		
		var elem = element.all(by.css('.emuwebapp-timelineCanvasMarkup')).get(0);
		ptor.actions()
		    .mouseMove(elem)
		    .mouseMove({ x: -50, y:0 })	  
		    .click()
	    .perform();
	    ptor.actions().sendKeys(protractor.Key.ENTER).perform();
	    ptor.sleep(250);
	});	
			
	it('should open, rename and save on EVENT', function() {
		for (var i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		};		
		var elem = element.all(by.css('.emuwebapp-levelMarkupCanvas')).get(1);
		ptor.actions()
		    .mouseMove(elem)
		    .mouseMove({ x: -50, y:0 })	
	        .doubleClick()
	    .perform();
	    var area = by.css('.emuwebapp-labelEdit'); 
	    expect(ptor.isElementPresent(area)).toBe(true);
	    element(by.css('.emuwebapp-labelEdit')).sendKeys('testElem');
	    ptor.actions().sendKeys(protractor.Key.ENTER).perform();
	    ptor.sleep(250);
	});	
	
	it('should undo last 5 changes', function() {
		var elem = element.all(by.css('.emuwebapp')).get(0);
		ptor.actions()
		    .mouseMove(elem)
		    .click()
	    .perform();
		for (var i = 0; i < 5; i++) {
			ptor.actions().sendKeys('z').perform();	
			ptor.sleep(250);
		};					
	});			
	
	it('should select a range in the viewport', function() {
	   var elem = element.all(by.css('.emuwebapp-timelineCanvasMarkup')).get(0);
	   ptor.actions()
	       .mouseMove(elem)
	       .mouseMove({ x: -250, y: 0 })
	       .mouseDown()
	       .mouseMove({ x: 250, y: 0 })
	       .mouseUp()
	    .perform();
	   ptor.sleep(800);
	});	
	
	it('should zoom in to the selected viewing range', function() {
	   element(by.id('zoomSelBtn')).click();
	});			
	
	it('should play sound in selected viewport', function() {
	   var elem = element.all(by.css('.emuwebapp-timelineCanvasMarkup')).get(0);
	   ptor.actions().mouseMove(elem).mouseMove({ x: -250, y: 0 }).mouseDown().mouseMove({ x: 250, y: 0 }).mouseUp().perform();
	   element(by.id('playSelBtn')).click();
	   ptor.sleep(900);
	});	
	
	it('should play sound in zoomed viewport', function() {
	   element(by.id('zoomInBtn')).click();	
	   element(by.id('zoomInBtn')).click();	
	   element(by.id('zoomLeftBtn')).click();	
	   element(by.id('playViewBtn')).click();
	   ptor.sleep(900);
	});		

	it('should play complete sound', function () {
		element(by.id('playAllBtn')).click();
		ptor.sleep(2950);
	});	




	
	

});