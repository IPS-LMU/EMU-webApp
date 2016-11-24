// tests for Utterence filter
describe('utterence filter', function () {

	browser.get('http://127.0.0.1:9000/');

	// afterEach it
	afterEach(function () {
		element(by.model('filterText')).clear();
	});

	it('should find only 0 utts searching for asdf', function () {
		var menuOpen = element.all(by.id('submenuOpen'));
		browser.actions()
			.mouseMove(menuOpen.get(0))
			.click()
			.perform();
		browser.sleep(500);
		element(by.model('filterText')).sendKeys('asdfghj');
		browser.sleep(500);
		var elems = element.all(by.id("uttListItem"));
		expect(elems.count()).toBe(0);
	});

	it('should find only 1 utts searching for 003', function () {
		element(by.model('filterText')).sendKeys('003');
		browser.sleep(500);
		var elems = element.all(by.id("uttListItem"));
		expect(elems.count()).toBe(1);
	});

	it('should find 2 utts searching for 0', function () {
		element(by.model('filterText')).sendKeys('0');
		browser.sleep(500);
		var elems = element.all(by.id("uttListItem"));
		expect(elems.count()).toBe(2);
	});
});
