// in test/e2e/main.spec.js
describe('E2E: main page', function () {

	browser.get('http://127.0.0.1:9000/');
	browser.executeScript('localStorage.setItem("haveShownWelcomeModal", "true");')

	it('should open file dialog', function () {
		var path = require('path');
		var fileToUpload1 = '../../app/testData/oldFormat/msajc003/msajc003.wav';
		var fileToUpload2 = '../../app/testData/oldFormat/msajc003/msajc003.TextGrid';
		var absolutePath1 = path.resolve(__dirname, fileToUpload1);
		var absolutePath2 = path.resolve(__dirname, fileToUpload2);
		element(by.id('fileDialog')).sendKeys(absolutePath2);
		browser.sleep(100);
		element(by.id('fileDialog')).sendKeys(absolutePath1);
		browser.sleep(500);
		var elem = element.all(by.css('.emuwebapp-level'));
		expect(elem.count()).toBe(11);
		element(by.id('clear')).click();
		element(by.id('emuwebapp-modal-confirm')).click();
	});

	it('should open demo1', function() {
		var elem1 = element.all(by.id('demoDB'));
		var elem2 = element.all(by.id('demo0'));
		browser.actions()
			.mouseMove(elem1.get(0))
			.perform();
		browser.sleep(100);
		browser.actions()
			.mouseMove(elem2.get(0))
			.click()
			.perform();
		browser.sleep(1200);
		var elem = element.all(by.css('.emuwebapp-level'));
		expect(elem.count()).toBe(2);
	});



});
