// tests for Utterence filter 
describe('spectrogram settings', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');
	// load demo
	element(by.id('openDemoDBbtn')).click();

	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
	});

	// afterEach it
	afterEach(function () {
		// reset to default values
		element(by.id('spectSettingsBtn')).click();
		element(by.input('modalVals.rangeFrom')).clear()
		element(by.input('modalVals.rangeFrom')).sendKeys('0');
		element(by.input('modalVals.rangeTo')).clear()
		element(by.input('modalVals.rangeTo')).sendKeys('5000');
		element(by.input('modalVals.windowLength')).clear()
		element(by.input('modalVals.windowLength')).sendKeys('256');
		element(by.input('modalVals.dynamicRange')).clear()
		element(by.input('modalVals.dynamicRange')).sendKeys('70');
		element(by.id('dialogSaveButton')).click();
	});



	it('should be able to set view range of spectrogram settings top limit to 8000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.input('modalVals.rangeTo')).clear()
		element(by.input('modalVals.rangeTo')).sendKeys('8000');
		element(by.id('dialogSaveButton')).click();
		var ele = by.input('filterText'); // see if filtertext input filed exists SIC... but maybe not so bad
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	it('should be able to set view range of spectrogram settings bottom limit to 2000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.input('modalVals.rangeFrom')).clear()
		element(by.input('modalVals.rangeFrom')).sendKeys('1000');
		element(by.id('dialogSaveButton')).click();
		var ele = by.input('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	it('should be able to set window length to 512 Samples', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.input('modalVals.windowLength')).clear()
		element(by.input('modalVals.windowLength')).sendKeys('512');
		element(by.id('dialogSaveButton')).click();
		var ele = by.input('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	it('should be able to set window length to 128 Samples', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.input('modalVals.windowLength')).clear()
		element(by.input('modalVals.windowLength')).sendKeys('128');
		element(by.id('dialogSaveButton')).click();
		var ele = by.input('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	it('should be able to set dynamic range to 50', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.input('modalVals.dynamicRange')).clear()
		element(by.input('modalVals.dynamicRange')).sendKeys('50');
		element(by.id('dialogSaveButton')).click();
		var ele = by.input('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	it('should be able to set dynamic range to 90', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.input('modalVals.dynamicRange')).clear()
		element(by.input('modalVals.dynamicRange')).sendKeys('90');
		element(by.id('dialogSaveButton')).click();
		var ele = by.input('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	// it('should be able window function to BARLETT', function () {
	// 	element(by.id('spectSettingsBtn')).click();

	// 	// element(by.input('selWindowInfo.name')).click();
	// 	// element(by.css('option[value=0]')).click();

	// 	// element(by.id('dialogSaveButton')).click();
	// 	// var ele = by.input('filterText');
	// 	// expect(ptor.isElementPresent(ele)).toBe(true);
	// });



});