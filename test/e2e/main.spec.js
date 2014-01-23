// in test/e2e/main.spec.js
describe('E2E: main page', function () {

	var ptor;
	browser.get('http://127.0.0.1:9000/');

	describe('E2E: test about modal', function () {
		// body...
		beforeEach(function () {
			ptor = protractor.getInstance();
		});

		it('should load about modal', function () {
		    expect(ptor.isElementPresent(by.id('aboutBtn'))).toBe(true);
			element(by.id('aboutBtn')).click();
			heading = ptor.findElement(protractor.By.id('modalHeading'));
			// console.log('#########################')
			// console.log(heading.getText())
			expect(heading.getText()).toEqual('EMU-webApp');
			element(by.id('modalCancelBtn')).click('EMU-webApp');
		});
	})
});