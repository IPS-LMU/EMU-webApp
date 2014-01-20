// in test/e2e/main.spec.js
describe('E2E: Utterence filter', function () {

	var ptor;

	beforeEach(function () {
		browser.get('http://127.0.0.1:9000/');
		ptor = protractor.getInstance();
		// load demo
		element(by.id('openDemoDBbtn')).click();
	});

	it('should find only 1 utt searching for 003', function () {
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