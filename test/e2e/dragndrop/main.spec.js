// tests for Utterence filter 
describe('drag n drop', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');

	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
		browser.manage().logs().get('browser').then(function (browserLog) {
			// expect(browserLog.length).toEqual(0);
			// Uncomment to actually see the log.
			if(browserLog.length !== 0){
				//console.log('log: ' + require('util').inspect(browserLog));
			}
		});
	});


	// afterEach it
	afterEach(function () {
		ptor.sleep(250);
		element(by.id('zoomAllBtn')).click();
	});

	it('should open file dialog', function () {
	    var path = require('path');
	    var fileToUpload1 = '../../../app/testData/oldFormat/msajc003/msajc003.wav';
	    var fileToUpload2 = '../../../app/testData/oldFormat/msajc003/msajc003.TextGrid';
	    var absolutePath1 = path.resolve(__dirname, fileToUpload1);
	    var absolutePath2 = path.resolve(__dirname, fileToUpload2);
		element(by.id('fileDialog')).sendKeys(absolutePath2);
		element(by.id('fileDialog')).sendKeys(absolutePath1);
	});
});	