function selectOption(selector, item){
    var selectList, desiredOption;

    selectList = this.findElement(selector);
    selectList.click();

    selectList.findElements(protractor.By.tagName('option'))
        .then(function findMatchingOption(options){
            options.some(function(option){
                option.getText().then(function doesOptionMatch(text){
                    if (item === text){
                        desiredOption = option;
                        return true;
                    }
                });
            });
        })
        .then(function clickOption(){
            if (desiredOption){
                desiredOption.click();
            }
        });
}

// tests for spectro Settings
describe('spectrogram settings', function () {

	var ptor;

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
		// todo : dropdown menu
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('windowLength'), '256');		
		ptor.selectOption(by.id('selWindowInfo'), 'GAUSS');				
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(1250);
	});

	it('should be able to set window Func to BARLETT and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'BARLETT');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});	
	
	it('should be able to set window Func to BARLETTHANN and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'BARLETTHANN');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});	

	it('should be able to set window Func to BLACKMAN and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'BLACKMAN');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});	

	it('should be able to set window Func to COSINE and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'COSINE');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});	

	it('should be able to set window Func to HAMMING and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'HAMMING');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});	

	it('should be able to set window Func to HANN and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'HANN');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});	
	
	it('should be able to set window Func to LANCZOS and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'LANCZOS');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});	

	it('should be able to set window Func to RECTANGULAR and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'RECTANGULAR');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});

	it('should be able to set window Func to TRIANGULAR and window Len to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('selWindowInfo'), 'TRIANGULAR');
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
		ptor.sleep(750);
	});		

	it('should be able to set window Length to 32', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('windowLength'), '32');
		element(by.id('dialogSaveButton')).click();
	});
	
	it('should be able to set window Length to 32', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('windowLength'), '32');
		element(by.id('dialogSaveButton')).click();
	});	

	it('should be able to set window Length to 128', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('windowLength'), '128');
		element(by.id('dialogSaveButton')).click();
	});	
	
	it('should be able to set window Length to 512', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('windowLength'), '512');
		element(by.id('dialogSaveButton')).click();
	});	
	
	it('should be able to set window Length to 1024', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('windowLength'), '1024');
		element(by.id('dialogSaveButton')).click();
	});	
	
	it('should be able to set window Length to 2048', function () {
		element(by.id('spectSettingsBtn')).click();	
		ptor.selectOption = selectOption.bind(ptor);
		ptor.selectOption(by.id('windowLength'), '2048');
		element(by.id('dialogSaveButton')).click();
	});	

	it('should be able to set view range of spectrogram settings top limit to 8000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.rangeTo')).clear()
		element(by.model('modalVals.rangeTo')).sendKeys('8000');
		element(by.id('dialogSaveButton')).click();
		var ele = by.model('filterText'); 
		expect(ptor.isElementPresent(ele)).toBe(true);
	});

	it('should be able to set view range of spectrogram settings bottom limit to 2000 Hz', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.rangeFrom')).clear()
		element(by.model('modalVals.rangeFrom')).sendKeys('1000');
		element(by.id('dialogSaveButton')).click();
		var ele = by.model('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
	});

	it('should be able to set dynamic range to 50', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.dynamicRange')).clear()
		element(by.model('modalVals.dynamicRange')).sendKeys('50');
		element(by.id('dialogSaveButton')).click();
		var ele = by.model('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
	});

	it('should be able to set dynamic range to 90', function () {
		element(by.id('spectSettingsBtn')).click();
		element(by.model('modalVals.dynamicRange')).clear()
		element(by.model('modalVals.dynamicRange')).sendKeys('90');
		element(by.id('dialogSaveButton')).click();
		var ele = by.model('filterText');
		expect(ptor.isElementPresent(ele)).toBe(true);
	});

});