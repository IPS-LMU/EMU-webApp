
// tests for spectro Settings
describe('E2E: spectrogram settings', function () {


	/////////////////////////////////
	// start: test different window functions

	it('should be able to set window Func to BARLETT', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="BARTLETT"]').click();
		element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	it('should be able to set window Func to BARLETTHANN', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="BARTLETTHANN"]').click();
        element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	it('should be able to set window Func to BLACKMAN', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="BLACKMAN"]').click();
        element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	it('should be able to set window Func to COSINE', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="COSINE"]').click();
        element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	it('should be able to set window Func to HAMMING', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="HAMMING"]').click();
        element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	it('should be able to set window Func to HANN', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="HANN"]').click();
        element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	it('should be able to set window Func to LANCZOS', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="LANCZOS"]').click();
		element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	it('should be able to set window Func to RECTANGULAR', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="RECTANGULAR"]').click();
        element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	it('should be able to set window Func to TRIANGULAR', function () {
		element(by.id('spectSettingsBtn')).click();
        var select = element(by.model('selWindowInfo.name'));
        select.$('[label="TRIANGULAR"]').click();
        element(by.id('emuwebapp-modal-save')).click();
		browser.sleep(90);
	});

	// end: test different window functions
	///////////////////////////////

	/////////////////////////////////
	// start: test different window sizes

	it('should be able to set window size to 0.001', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.windowSizeInSecs')).clear();
		element(by.model('modalVals.windowSizeInSecs')).sendKeys('0.001');
		element(by.id('emuwebapp-modal-save')).click();
	});

	it('should be able to set window size to 0.005', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.windowSizeInSecs')).clear();
		element(by.model('modalVals.windowSizeInSecs')).sendKeys('0.005');
		element(by.id('emuwebapp-modal-save')).click();
	});

	it('should be able to set window size to 0.1', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.windowSizeInSecs')).clear();
		element(by.model('modalVals.windowSizeInSecs')).sendKeys('0.1');
		element(by.id('emuwebapp-modal-save')).click();
	});

	// end: test different window sizes
	//////////////////////////////////////

	//////////////////////////////////////
	// start: test rangeTo/rangeFrom
	it('should be able to set view range of spectrogram settings top limit to 8000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.rangeTo')).clear();
		element(by.model('modalVals.rangeTo')).sendKeys('8000');
		element(by.id('emuwebapp-modal-save')).click();
		var ele = by.model('filterText');
		expect(browser.isElementPresent(ele)).toBe(true);
	});

	it('should be able to set view range of spectrogram settings bottom limit to 2000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.rangeFrom')).clear();
		element(by.model('modalVals.rangeFrom')).sendKeys('1000');
		element(by.id('emuwebapp-modal-save')).click();
		var ele = by.model('filterText');
		expect(browser.isElementPresent(ele)).toBe(true);
	});
	// end: test rangeTo/rangeFrom
	/////////////////////////////////////

	/////////////////////////////////////
	// start: test dynamic range
	it('should be able to set dynamic range to 50', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.dynamicRange')).clear();
		element(by.model('modalVals.dynamicRange')).sendKeys('50');
		element(by.id('emuwebapp-modal-save')).click();
		var ele = by.model('filterText');
		expect(browser.isElementPresent(ele)).toBe(true);
	});

	it('should be able to set dynamic range to 90', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.dynamicRange')).clear();
		element(by.model('modalVals.dynamicRange')).sendKeys('90');
		element(by.id('emuwebapp-modal-save')).click();
		var ele = by.model('filterText');
		expect(browser.isElementPresent(ele)).toBe(true);
	});

	// end: test dynamic range
	/////////////////////////////////////

});