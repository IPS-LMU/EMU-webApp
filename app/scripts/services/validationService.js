'use strict';

angular.module('emuwebApp')
	.service('Validationservice', function Validationservice($http) {
		//shared service object to be returned
		var sServObj = {};

		var schemasJsos = [];

		var names = ['annotationFileSchema', 'emuwebappConfigSchema'];

		/**
		 *
		 */
		sServObj.loadSchemas = function () {

			names.forEach(function (n) {
				$http.get('schemaFiles/' + n + '.json').then(function (resp) {
					schemasJsos.push({
						name: n,
						data: resp.data
					})
					console.log(schemasJsos)
				});
			})
		};

		sServObj.loadSchemas();

		/**
		 *
		 */
		sServObj.validateJSO = function (schemaName, jso) {
			console.log(schemaName)
			console.log(jso)
			var schema;
			schemasJsos.forEach(function (s) {
				if(s.name === schemaName){
					schema = s;
				}
			})
			console.log(schema)

			if (tv4.validate(jso, schema.data)) {
				console.log("PASS!!!")
				return true;
			} else {
				return tv4.error;
			}


		};

		return sServObj;
	});