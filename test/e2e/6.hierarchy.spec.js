// tests for Utterence filter
describe('hierarchy', function () {

	browser.get('http://127.0.0.1:9000/');
	// beforeEach it
	beforeEach(function () {
		var elem = element.all(by.id('showHierarchy'));
		browser.actions()
			.mouseMove(elem.get(0))
			.click()
			.perform();
		browser.sleep(200);
	});

	// afterEach it
	afterEach(function () {
		var elem = element.all(by.id('showHierarchy'));
		browser.actions()
			.mouseMove(elem.get(0))
			.click()
			.perform();
		browser.sleep(200);
	});

	it('should rotate hierarchy twice', function () {
		element.all(by.id('modalRotateBtn')).get(0).click();
		browser.sleep(200);
		element.all(by.id('modalRotateBtn')).get(0).click();
		browser.sleep(200);
	});

});
