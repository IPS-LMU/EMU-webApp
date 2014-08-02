'use strict';

angular.module('emuwebApp')
	.service('Validationservice', function Validationservice($http, $q) {
		//shared service object to be returned
		var sServObj = {};

		var schemasJsos = [];

		var names = ['annotationFileSchema', 'emuwebappConfigSchema', 'DBconfigFileSchema','bundleListSchema'];

		/**
		 *
		 */
		sServObj.loadSchemas = function () {
			var proms = [];

			angular.forEach(names, function (n) {
				proms.push($http.get('schemaFiles/' + n + '.json'));
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
			});
		};

		//.then(function (resp) {
		// schemasJsos.push({
		// 	name: n,
		// 	data: resp.data
		// }, function (err) {
		// 	console.error('Unable to load schemas!');
		// 	console.error(err);
		// });

		/**
		 *
		 */
		sServObj.validateJSO = function (schemaName, jso) {
			var schema;
			angular.forEach(schemasJsos, function (s) {
				if (s.name === 'schemaFiles/' + schemaName + '.json') {
					schema = s;
				}
			});

			if (schema !== undefined && tv4.validate(jso, schema.data)) {
				return true;
			} else {
				if (schema === undefined) {
					return 'Schema: ' + schemaName + ' is currently undefined! This is probably due to a misnamed schema file on the server...'
				} else {
					return tv4.error;
				}
			}


		};

		return sServObj;
	});