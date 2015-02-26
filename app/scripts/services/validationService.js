'use strict';

angular.module('emuwebApp')
	.service('Validationservice', function Validationservice($http, $q) {

		//shared service object to be returned
		var sServObj = {};
		var schemasJsos = [];
		var names = ['annotationFileSchema', 'emuwebappConfigSchema', 'DBconfigFileSchema', 'bundleListSchema', 'bundleSchema'];

		/**
		 *
		 */
		sServObj.loadSchemas = function () {
			var proms = [];
			var uri;
			angular.forEach(names, function (n) {
				uri = 'schemaFiles/' + n + '.json';
				proms.push($http.get(uri));
			});
			return $q.all(proms);
		};

		/**
		 *
		 */
		sServObj.setSchemas = function (schemaArr) {
			angular.forEach(schemaArr, function (s) {
				schemasJsos.push({
					name: s.config.url,
					data: s.data
				});
				// add annotationFileSchema to tv4 for de-referencing $ref
				if (s.config.url === 'schemaFiles/annotationFileSchema.json') {
					tv4.addSchema(s.config.url, s.data);
				}
			});
		};

		/**
		 *
		 */
		sServObj.getSchema = function (schemaName) {
			var schema = undefined;
			angular.forEach(schemasJsos, function (s) {
				if (s.name === 'schemaFiles/' + schemaName + '.json') {
					schema = s;
				}
			});
			return schema;
		};

		/**
		 *
		 */
		sServObj.validateJSO = function (schemaName, jso) {
			var schema = sServObj.getSchema(schemaName);

			if (schema !== undefined && tv4.validate(jso, schema.data)) {
				return true;
			} else {
				if (schema === undefined) {
					return 'Schema: ' + schemaName + ' is currently undefined! This is probably due to a misnamed schema file on the server...';
				} else {
					return tv4.error;
				}
			}
		};

		return sServObj;
	});