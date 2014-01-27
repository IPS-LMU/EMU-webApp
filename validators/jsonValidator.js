'use strict';

var fs = require('fs');
var os = require('os');

var Validator = require('jsonschema').Validator;
var v = new Validator();



fs.readFile(process.argv[2], 'utf8', function (instanceErr, instanceData) {

	fs.readFile('schemas/levelDefinitionSchema.json', 'utf8', function (levErr, levData) {
		var curJson = JSON.parse(levData);
		v.addSchema(curJson, curJson.id);

		fs.readFile('schemas/attributeDefinitionSchema.json', 'utf8', function (attErr, attData) {
			var curJson = JSON.parse(attData);
			v.addSchema(curJson, curJson.id);

			fs.readFile('schemas/constaintDefinitionSchema.json', 'utf8', function (conErr, conData) {
				var curJson = JSON.parse(conData);
				v.addSchema(curJson, curJson.id);

				fs.readFile('schemas/globalDBschema.json', 'utf8', function (globErr, globData) {
					console.log(v.validate(JSON.parse(instanceData), JSON.parse(globData)).errors);
				});
			});
		});
	});

});