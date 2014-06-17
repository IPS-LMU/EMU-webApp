// in test/e2e/main.spec.js
describe('E2E: main page', function () {

	var ptor;
	browser.get('http://127.0.0.1:9000/');

	describe('E2E: test about modal', function () {
		// body...
		beforeEach(function () {
			ptor = protractor.getInstance();
		});
		
		it('should open first demo DB with 2 levels', function() {
	        // load demo
    		element(by.id('demoDB')).click();
	    	element(by.id('demo0')).click();
    		var elems = element.all(by.repeater('level in levServ.data.levels | levelsFilter'));
	    	expect(elems.count()).toBe(2);
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