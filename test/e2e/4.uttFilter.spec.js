// tests for Utterence filter
describe('utterence filter', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');

	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();

	});

	// afterEach it
	afterEach(function () {
		element(by.model('filterText')).clear();
	});

	it('should find only 0 utts searching for asdf', function () {
		var menuOpen = element.all(by.id('submenuOpen'));
		ptor.actions()
			.mouseMove(menuOpen.get(0))
			.click()
			.perform();
		ptor.sleep(500);
		element(by.model('filterText')).sendKeys('asdfghj');
		ptor.sleep(500);
		var elems = element.all(by.id("uttListItem"));
		expect(elems.count()).toBe(0);
	});

	it('should find only 1 utts searching for 003', function () {
		element(by.model('filterText')).sendKeys('003');
		ptor.sleep(500);
		var elems = element.all(by.id("uttListItem"));
		expect(elems.count()).toBe(1);
	});

	it('should find 2 utts searching for 0', function () {
		element(by.model('filterText')).sendKeys('0');
		ptor.sleep(500);
		var elems = element.all(by.id("uttListItem"));
		expect(elems.count()).toBe(2);
	});
});
