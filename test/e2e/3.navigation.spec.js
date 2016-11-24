// tests for Utterence filter
describe('navigation', function () {
	var i;

	browser.get('http://127.0.0.1:9000/');

	// beforeEach it
	// beforeEach(function () {
	// 	// browser = protractor.getInstance();
	// 	browser.manage().logs().get('browser').then(function (browserLog) {
	// 		// expect(browserLog.length).toEqual(0);
	// 		// Uncomment to actually see the log.
	// 		if(browserLog.length !== 0){
	// 			//console.log('log: ' + require('util').inspect(browserLog));
	// 		}
	// 	});
	// });


	// afterEach it
	afterEach(function () {
		element(by.id('zoomAllBtn')).click();
	});

	it('should load about modal', function () {
		expect(browser.isElementPresent(by.id('aboutBtn'))).toBe(true);
		element(by.id('aboutBtn')).click();
		var heading = browser.findElement(protractor.By.id('modalHeading'));
		expect(heading.getText()).toEqual('EMU-webApp Help');
		element(by.id('modalCancelBtn')).click('EMU-webApp');
	});

	/* disabled

	it('should have 2 bundles', function () {
		var elems = element.all(by.repeater("(key, value) in lmds.getBundleList() | groupBy: 'session'"));
		expect(elems.count()).toBe(2);
	});*/

	it('should load utterance msajc010', function () {
		element.all(by.css('.emuwebapp-bundle-item')).get(0).click();
		element(by.model('filterText')).sendKeys('');
		expect(browser.isElementPresent(by.id('Phonetic'))).toBe(true);
		expect(browser.isElementPresent(by.id('Tone'))).toBe(true);
	});

	it('should close submenu with button', function () {
		element(by.id('submenuOpen')).click();
	});

	it('should open & close submenu with shortcuts', function () {
		browser.actions().sendKeys('o').perform();
        browser.actions().sendKeys('o').perform();
	});

	it('should open & close right submenu with shortcuts', function () {
		browser.actions().keyDown(protractor.Key.SHIFT).sendKeys('o').keyUp(protractor.Key.SHIFT).perform();
		browser.actions().keyDown(protractor.Key.SHIFT).sendKeys('o').keyUp(protractor.Key.SHIFT).perform();
	});

	it('should change loaded timeline view', function () {
		browser.actions().keyDown(protractor.Key.SHIFT).sendKeys('o').keyUp(protractor.Key.SHIFT).perform();
		browser.sleep(600);
		element.all(by.css('.emuwebapp-perspLi')).get(0).click();
		browser.sleep(1200);
	});

	it('should change loaded timeline view back to orig', function () {
		browser.actions().keyDown(protractor.Key.SHIFT).sendKeys('o').keyUp(protractor.Key.SHIFT).perform();
		browser.sleep(600);
		element.all(by.css('.emuwebapp-perspLi')).get(0).click();
		browser.sleep(1200);
	});

	it('should test all resize buttons', function () {
		var elem = element.all(by.id('emuwebapp-level-button-resize'));
		expect(elem.count()).toBe(2);
		for (i = 0; i < 2; i++) {
			var button = elem.get(i);
			button.click();
			button.click();
		}
	});

	it('should test contour correction', function () {
		for (i = 0; i < 2; i++) {
			element(by.id('zoomInBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(1);

		// on first
		browser.actions().sendKeys('1').perform();
        browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -61,
				y: -20
			})
			.keyDown(protractor.Key.SHIFT)
			.mouseMove({
				x: 1,
				y: 1
			})
			.mouseMove({
				x: 1,
				y: 1
			})
			.mouseMove({
				x: 1,
				y: 1
			})
			.mouseMove({
				x: 2,
				y: 1
			})
			.mouseMove({
				x: 2,
				y: 1
			})
			.mouseMove({
				x: 3,
				y: 1
			})
			.mouseMove({
				x: 2,
				y: 1
			})
			.mouseMove({
				x: 2,
				y: 1
			})
			.mouseMove({
				x: 1,
				y: 1
			})
			.mouseMove({
				x: 1,
				y: 1
			})
			.keyUp(protractor.Key.SHIFT)
			.perform();


		// on second
		browser.actions().sendKeys('2').perform();
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: 61,
				y: 20
			})
			.keyDown(protractor.Key.SHIFT)
			.mouseMove({
				x: -6,
				y: -2
			})
			.mouseMove({
				x: -5,
				y: -2
			})
			.mouseMove({
				x: -4,
				y: -2
			})
			.mouseMove({
				x: -3,
				y: -2
			})
			.mouseMove({
				x: -2,
				y: -2
			})
			.mouseMove({
				x: -1,
				y: -2
			})
			.mouseMove({
				x: -2,
				y: -2
			})
			.mouseMove({
				x: -3,
				y: -2
			})
			.mouseMove({
				x: -4,
				y: -2
			})
			.mouseMove({
				x: -5,
				y: -2
			})
			.mouseMove({
				x: -6,
				y: -2
			})
			.keyUp(protractor.Key.SHIFT)
			.perform();

	});

	it('should undo last 2 changes', function () {
		var elem = element.all(by.css('.emuwebapp-main'));
		browser.actions()
			.mouseMove(elem.get(0))
			.click()
			.perform();
		browser.actions().sendKeys('z').perform();

		browser.actions().sendKeys('z').perform();

	});

	it('should move dividing pane up and down', function () {
		var elem = element.all(by.css('.emuwebapp-split-handler'));
		expect(elem.count()).toBe(1);
		browser.actions()
			.mouseMove(elem.get(0))
			.click()
			.mouseDown()
			.mouseMove({
				x: 0,
				y: 90
			})
			.mouseUp()
			.perform();

        browser.actions()
			.mouseMove(elem.get(0))
			.click()
			.mouseDown()
			.mouseMove({
				x: 0,
				y: -180
			})
			.mouseUp()
			.perform();

        browser.actions()
			.mouseMove(elem.get(0))
			.click()
			.mouseDown()
			.mouseMove({
				x: 0,
				y: 90
			})
			.mouseUp()
			.perform();
	});

	it('should tab in both directions with arrow keys and tab (shift tab)', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
		}
		for (i = 0; i < 3; i++) {
			element(by.id('zoomRightBtn')).click();
		}
    var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.mouseMove( { x: -200, y: 0 }).click()
			.click()
			.perform();
		for (i = 0; i < 3; i++) {
		        browser.actions().sendKeys(protractor.Key.TAB).perform();
		 }
		    for (i = 0; i < 3; i++) {
		        browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		 }
		    for (i = 0; i < 3; i++) {
		        browser.actions().keyDown(protractor.Key.SHIFT).sendKeys(protractor.Key.TAB).keyUp(protractor.Key.SHIFT).perform();
		 }
		    for (i = 0; i < 3; i++) {
		        browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform();
		 }
	});

	it('should move around with zoom (with shortcuts)', function () {
		for (i = 0; i < 5; i++) {
			browser.actions().sendKeys('w').perform();
		}

		for (i = 0; i < 5; i++) {
			browser.actions().sendKeys('a').perform();
		}

		for (i = 0; i < 5; i++) {
			browser.actions().sendKeys('d').perform();
		}

		for (i = 0; i < 5; i++) {
			browser.actions().sendKeys('s').perform();
		}
	});

	it('should move around with zoom (with navigationbar)', function () {
		for (i = 0; i < 3; i++) {
			browser.actions().sendKeys('w').perform();
		}
		var elem = element.all(by.css('.emuwebapp-preview-canvas-markup'));
		expect(elem.count()).toBe(1);
		browser.actions()
			.mouseMove(elem.get(0))
			.click()
			.mouseDown()
			.mouseMove({
				x: -200,
				y: 0
			})
			.mouseUp()
			.perform();

		browser.actions()
			.mouseMove(elem.get(0))
			.mouseMove({
				x: -200,
				y: 0
			})
			.click()
			.mouseDown()
			.mouseMove({
				x: 50,
				y: 0
			})
			.mouseUp()
			.perform();

		browser.actions()
			.mouseMove(elem.get(0))
			.mouseMove({
				x: -150,
				y: 0
			})
			.click()
			.mouseDown()
			.mouseMove({
				x: 50,
				y: 0
			})
			.mouseUp()
			.perform();

		browser.actions()
			.mouseMove(elem.get(0))
			.mouseMove({
				x: -100,
				y: 0
			})
			.click()
			.mouseDown()
			.mouseMove({
				x: 50,
				y: 0
			})
			.mouseUp()
			.perform();

		browser.actions()
			.mouseMove(elem.get(0))
			.mouseMove({
				x: -50,
				y: 0
			})
			.click()
			.mouseDown()
			.mouseMove({
				x: 50,
				y: 0
			})
			.mouseUp()
			.perform();
	});

	it('should move around with zoom', function () {
		for (i = 0; i < 5; i++) {
			element(by.id('zoomInBtn')).click();
		}

		for (i = 0; i < 5; i++) {
			element(by.id('zoomLeftBtn')).click();
		}

		for (i = 0; i < 5; i++) {
			element(by.id('zoomRightBtn')).click();
		}

		for (i = 0; i < 5; i++) {
			element(by.id('zoomOutBtn')).click();
		}
	});

	it('should overzoom to check boundaries for in and out', function () {
		for (i = 0; i < 30; i++) {
			element(by.id('zoomInBtn')).click();
		}

		for (i = 0; i < 30; i++) {
			element(by.id('zoomOutBtn')).click();
		}
	});

	it('should overzoom to check boundaries for left and right', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
		}

		for (i = 0; i < 30; i++) {
			element(by.id('zoomLeftBtn')).click();
		}

		for (i = 0; i < 40; i++) {
			element(by.id('zoomRightBtn')).click();
		}
	});


	it('should move a boundary on SEGMENT level', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.click()
			.keyDown(protractor.Key.SHIFT)
			.mouseMove({
				x: -80,
				y: 0
			})
			.keyUp(protractor.Key.SHIFT)
			.perform();
	});

	it('should move a segment on SEGMENT level', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.click()
			.keyDown(protractor.Key.ALT)
			.mouseMove({
				x: -100,
				y: 0
			})
			.keyUp(protractor.Key.ALT)
			.perform();
	});

	it('should move a element on EVENT level', function () {
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(1);
		browser.actions()
			.mouseMove(elem)
			.click()
			.mouseMove({
				x: -30,
				y: 0
			})
			.keyDown(protractor.Key.SHIFT)
			.mouseMove({
				x: -100,
				y: 0
			})
			.keyUp(protractor.Key.SHIFT)
			.perform();
	});

	it('should open, rename and save on SEGMENT', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.doubleClick()
			.perform();
		var area = by.css('.emuwebapp-label-edit');
		expect(browser.isElementPresent(area)).toBe(true);
		element(by.css('.emuwebapp-label-edit')).sendKeys('TEST');
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
	});

	it('should insert a new boundary on SEGMENT (should work)', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -50,
				y: 0
			})
			.click()
			.perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
	});

	it('should insert a new segment on SEGMENT level', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -80,
				y: 0
			})
			.mouseDown()
			.mouseMove({
				x: 15,
				y: 0
			})
			.mouseUp()
			.perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
	});

	it('should insert a new element on EVENT level', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(1);
		browser.actions()
			.mouseMove(elem)
			.click()
			.perform();
		elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -50,
				y: 0
			})
			.click()
			.perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
	});

	it('should open, rename and save on EVENT', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(1);
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -50,
				y: 0
			})
			.doubleClick()
			.perform();
		var area = by.css('.emuwebapp-label-edit');
		expect(browser.isElementPresent(area)).toBe(true);
		element(by.css('.emuwebapp-label-edit')).sendKeys('testElem');
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
	});

	it('should delete new element from EVENT level', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(1);
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -50,
				y: 0
			})
			.sendKeys(protractor.Key.BACK_SPACE)
			.perform();
	});


	it('should delete segment boundary from SEGMENT level', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -50,
				y: 0
			})
			.click()
			.perform();
		browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
	});

	it('should delete segment from SEGMENT level', function () {
		for (i = 0; i < 3; i++) {
			element(by.id('zoomInBtn')).click();
			element(by.id('zoomRightBtn')).click();
		}
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -50,
				y: 0
			})
			.click()
			.perform();
		browser.actions().keyDown(protractor.Key.SHIFT).sendKeys(protractor.Key.BACK_SPACE).keyUp(protractor.Key.SHIFT).perform();
	});

	it('should undo last 10 changes', function () {
		for (i = 0; i < 10; i++) {
			browser.actions().sendKeys('z').perform();

		}
	});

	it('should select a range in the viewport', function () {
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions()
			.mouseMove(elem)
			.mouseMove({
				x: -250,
				y: 0
			})
			.mouseDown()
			.mouseMove({
				x: 250,
				y: 0
			})
			.mouseUp()
			.perform();
	});

	it('should zoom in to the selected viewing range', function () {
		element(by.id('zoomSelBtn')).click();
	});

	it('should play sound in selected viewport', function () {
		var elem = element.all(by.css('.emuwebapp-level-markup')).get(0);
		browser.actions().mouseMove(elem).mouseMove({
			x: -250,
			y: 0
		}).mouseDown().mouseMove({
			x: 250,
			y: 0
		}).mouseUp().perform();
		element(by.id('playSelBtn')).click();
		browser.sleep(200);
	});

	it('should play sound in zoomed viewport', function () {
		element(by.id('zoomInBtn')).click();
		element(by.id('zoomInBtn')).click();
		element(by.id('zoomLeftBtn')).click();
		element(by.id('playViewBtn')).click();
		browser.sleep(900);
	});

	it('should play complete sound', function () {
		element(by.id('playAllBtn')).click();
		browser.sleep(2950);
	});


});
