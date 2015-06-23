// in test/e2e/main.spec.js
describe('E2E: main page', function () {

	var ptor;
	browser.get('http://127.0.0.1:9000/');

	// body...
	beforeEach(function () {
		ptor = protractor.getInstance();
	});

	it('should open file dialog', function () {
		var path = require('path');
		var fileToUpload1 = '../../app/testData/oldFormat/msajc003/msajc003.wav';
		var fileToUpload2 = '../../app/testData/oldFormat/msajc003/msajc003.TextGrid';
		var absolutePath1 = path.resolve(__dirname, fileToUpload1);
		var absolutePath2 = path.resolve(__dirname, fileToUpload2);
		element(by.id('fileDialog')).sendKeys(absolutePath2);
		element(by.id('fileDialog')).sendKeys(absolutePath1);
		ptor.sleep(600);
		var elem = element.all(by.css('emuwebapp-level-container'));
		expect(elem.count()).toBe(11);
		element(by.id('clear')).click();
		element(by.id('emuwebapp-modal-confirm')).click();
	});

	it('should open demo1', function() {
		var elem1 = element.all(by.id('demoDB'));
		var elem2 = element.all(by.id('demo0'));
		ptor.actions()
			.mouseMove(elem1.get(0))
			.perform();
		ptor.sleep(100);
		ptor.actions()
			.mouseMove(elem2.get(0))
			.click()
			.perform();
		ptor.sleep(600);
		var elems = element.all(by.css('emuwebapp-level-container'));
		expect(elems.count()).toBe(2);
	});



});
