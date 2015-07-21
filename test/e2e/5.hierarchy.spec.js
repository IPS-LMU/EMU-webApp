// tests for Utterence filter
describe('hierarchy', function () {

	var ptor;

	browser.get('http://127.0.0.1:9000/');
	// beforeEach it
	beforeEach(function () {
		ptor = protractor.getInstance();
		var elem = element.all(by.id('showHierarchy'));
		ptor.actions()
			.mouseMove(elem.get(0))
			.click()
			.perform();
		ptor.sleep(200);
	});

	// afterEach it
	afterEach(function () {
		var elem = element.all(by.id('showHierarchy'));
		ptor.actions()
			.mouseMove(elem.get(0))
			.click()
			.perform();
		ptor.sleep(200);
	});

	it('should rotate hierarchy twice', function () {
		element.all(by.id('modalRotateBtn')).get(0).click();
		ptor.sleep(200);
		element.all(by.id('modalRotateBtn')).get(0).click();
		ptor.sleep(200);
	});

});
