function selectOption(selector, item) {
	var selectList, desiredOption;

	selectList = this.findElement(selector);
	selectList.click();

	selectList.findElements(protractor.By.tagName('option'))
		.then(function findMatchingOption(options) {
			options.some(function (option) {
				option.getText().then(function doesOptionMatch(text) {
					if (item === text) {
						desiredOption = option;
						return true;
					}
				});
			});
		})
		.then(function clickOption() {
			if (desiredOption) {
				desiredOption.click();
			}
		});
}

// tests for spectro Settings
describe('E2E: spectrogram settings', function () {

	var ptor;

	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
	});

	// afterEach it
	afterEach(function () {});

	/////////////////////////////////
	// start: test different window functions

	it('should be able to set window Func to BARLETT', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'BARLETT');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
	});

	it('should be able to set window Func to BARLETTHANN', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'BARLETTHANN');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
	});

	it('should be able to set window Func to BLACKMAN', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'BLACKMAN');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
	});

	it('should be able to set window Func to COSINE', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'COSINE');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
	});

	it('should be able to set window Func to HAMMING', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'HAMMING');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
	});

	it('should be able to set window Func to HANN', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'HANN');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
	});

	it('should be able to set window Func to LANCZOS', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'LANCZOS');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
	});

	it('should be able to set window Func to RECTANGULAR', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'RECTANGULAR');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
	});

	it('should be able to set window Func to TRIANGULAR', function () {
		element(by.id('spectSettingsBtn')).click();
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'TRIANGULAR');
		element(by.id('emuwebapp-modal-save')).click();
		ptor.sleep(90);
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
		expect(ptor.isElementPresent(ele)).toBe(true);
	});

	it('should be able to set view range of spectrogram settings bottom limit to 2000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.rangeFrom')).clear();
		element(by.model('modalVals.rangeFrom')).sendKeys('1000');
		element(by.id('emuwebapp-modal-save')).click();
		var ele = by.model('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
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
		expect(ptor.isElementPresent(ele)).toBe(true);
	});

	it('should be able to set dynamic range to 90', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.dynamicRange')).clear();
		element(by.model('modalVals.dynamicRange')).sendKeys('90');
		element(by.id('emuwebapp-modal-save')).click();
		var ele = by.model('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
	});

	// end: test dynamic range
	/////////////////////////////////////

});