// tests for Utterence filter 
describe('spectrogram settings', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');

	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
	});

	// afterEach it
	afterEach(function () {
		// reset to default values
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.rangeFrom')).clear()
		element(by.model('modalVals.rangeFrom')).sendKeys('0');
		element(by.model('modalVals.rangeTo')).clear()
		element(by.model('modalVals.rangeTo')).sendKeys('5000');
		element(by.model('modalVals.dynamicRange')).clear()
		element(by.model('modalVals.dynamicRange')).sendKeys('70');
		element(by.id('dialogSaveButton')).click();
	});



	it('should be able to set view range of spectrogram settings top limit to 8000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.rangeTo')).clear()
		element(by.model('modalVals.rangeTo')).sendKeys('8000');
		element(by.id('dialogSaveButton')).click();
		var ele = by.model('filterText'); 
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	it('should be able to set view range of spectrogram settings bottom limit to 2000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.rangeFrom')).clear()
		element(by.model('modalVals.rangeFrom')).sendKeys('1000');
		element(by.id('dialogSaveButton')).click();
		var ele = by.model('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	it('should be able to set dynamic range to 50', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.dynamicRange')).clear()
		element(by.model('modalVals.dynamicRange')).sendKeys('50');
		element(by.id('dialogSaveButton')).click();
		var ele = by.model('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

	it('should be able to set dynamic range to 90', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.dynamicRange')).clear()
		element(by.model('modalVals.dynamicRange')).sendKeys('90');
		element(by.id('dialogSaveButton')).click();
		var ele = by.model('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
		ptor.sleep(1000);
	});

});