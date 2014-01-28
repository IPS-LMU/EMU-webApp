// simple validation script that uses: https://npmjs.org/package/jsonschema
// make sure that you install it first!

// example usage: node jsonValidator.js instanceOfglobalDBconfig.json schemas/globalDBschema.json

'use strict';

var fs = require('fs');

var Validator = require('jsonschema').Validator;
var v = new Validator();

fs.readFile(process.argv[2], 'utf8', function (instanceErr, instanceData) {

	fs.readFile(process.argv[3], 'utf8', function (globErr, globData) {
		JSON.parse(instanceData)
		var validationErrs = v.validate(JSON.parse(instanceData), JSON.parse(globData)).errors;
		if (validationErrs.length === 0) {
			console.log(process.argv[2] + ' SUCCESSFULLY VALIDATED against: ' + process.argv[3]);
		}else{
			console.log('VALIDATION ERRORS:');
			console.log(validationErrs);
		}
	});
});