// tests for Utterence filter 
describe('utterence filter', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');
	// load demo
	element(by.id('openDemoDBbtn')).click();

	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
		element(by.input('filterText')).clear();
	});

	// afterEach it
	afterEach(function () {
		element(by.input('filterText')).clear();
	});

	it('should find only 0 utts searching for asdf', function () {
		element(by.input('filterText')).sendKeys('asdf');
		var elems = element.all(by.repeater('utt in uttList | regex:filterText'));
		expect(elems.count()).toBe(0);
	});

	it('should find only 1 utts searching for 003', function () {
		element(by.input('filterText')).sendKeys('003');
		var elems = element.all(by.repeater('utt in uttList | regex:filterText'));
		expect(elems.count()).toBe(1);
	});

	it('should find 3 utts searching for 01', function () {
		element(by.input('filterText')).sendKeys('01');
		var elems = element.all(by.repeater('utt in uttList | regex:filterText'));
		expect(elems.count()).toBe(3);
	});

});