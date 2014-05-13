'use strict';

angular.module('emuwebApp')
	.service('Validationservice', function Validationservice($http) {
		//shared service object to be returned
		var sServObj = {};

		var schemasJsos = [];

		var names = ['annotationFileSchema', 'emuwebappConfigSchema', 'DBconfigFileSchema'];

		/**
		 *
		 */
		sServObj.loadSchemas = function () {

			angular.forEach(names, function (n) {
				$http.get('schemaFiles/' + n + '.json').then(function (resp) {
					schemasJsos.push({
						name: n,
						data: resp.data
					},function (err) {
						console.error('Unable to load schemas!');
						console.error(err);
					});
				});
			});
		};

		sServObj.loadSchemas();

		/**
		 *
		 */
		sServObj.validateJSO = function (schemaName, jso) {
			var schema;
			angular.forEach(schemasJsos, function (s) {
				if(s.name === schemaName){
					schema = s;
				}
			});

			if (tv4.validate(jso, schema.data)) {
				return true;
			} else {
				return tv4.error;
			}


		};

		return sServObj;
	});