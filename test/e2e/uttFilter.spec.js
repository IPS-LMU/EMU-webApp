// tests for Utterence filter 
describe('utterence filter', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');


	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
		element(by.model('filterText')).clear();
	});
	

	// afterEach it
	afterEach(function () {
		element(by.model('filterText')).clear();
	});

	it('should find only 0 utts searching for asdf', function () {
		element(by.model('filterText')).sendKeys('asdf');
		var elems = element.all(by.repeater('bundle in bundleList | regex:filterText'));
		expect(elems.count()).toBe(0);
	});

	it('should find only 1 utts searching for 003', function () {
		element(by.model('filterText')).sendKeys('0');
		var elems = element.all(by.repeater('bundle in bundleList | regex:filterText'));
		expect(elems.count()).toBe(2);
	});

	it('should find 3 utts searching for 01', function () {
		element(by.model('filterText')).sendKeys('03');
		var elems = element.all(by.repeater('bundle in bundleList | regex:filterText'));
		expect(elems.count()).toBe(1);
	});

});