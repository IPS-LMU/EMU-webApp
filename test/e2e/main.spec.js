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
		ptor.sleep(200);
		var elem = element.all(by.css('.emuwebapp-levelOuter'));
		expect(elem.count()).toBe(11);
		element(by.id('clear')).click();
		element(by.id('emuwebapp-modal-confirm')).click();
	});

	it('should clear view and open demo1', function() {	
		element(by.id('demoDB')).click();
		element(by.id('demo1')).click();
		var elem = element.all(by.css('.emuwebapp-levelMarkupCanvas'))
		expect(elem.count()).toBe(3);
		element(by.id('clear')).click();	
		element(by.id('emuwebapp-modal-confirm')).click();	
	});	

	it('should clear view and open demo2', function() {
		element(by.id('demoDB')).click();
		element(by.id('demo2')).click(); 
		var elem = element.all(by.css('.emuwebapp-levelMarkupCanvas'))
		expect(elem.count()).toBe(1);
		element(by.id('clear')).click();	
		element(by.id('emuwebapp-modal-confirm')).click();
	});	

	it('should open first demo DB with 2 levels', function () {
		element(by.id('demoDB')).click();
		element(by.id('demo0')).click();
		var elems = element.all(by.repeater('level in dataServ.getLevelData() | levelsFilter track by $index'));
		expect(elems.count()).toBe(2);
	});
});