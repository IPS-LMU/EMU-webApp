'use strict';

var fs = require('fs');
var os = require('os');

var Validator = require('jsonschema').Validator;
var v = new Validator();

fs.readFile('schema.json', 'utf8', function (schemaErr, schemaData) {
	if (!schemaErr) {
		fs.readFile('globalDBconfig.json', 'utf8', function (err, instanceData) {
			console.log(schemaData);
			console.log(instanceData);

			console.log(v.validate(JSON.parse(instanceData), JSON.parse(instanceData)));

		});
	} else {
		console.log('Error reading schema');
		console.log(schemaErr);
	}

});