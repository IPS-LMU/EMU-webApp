'use strict';

angular.module('emuwebApp')
	.service('Validationservice', function Validationservice($http) {
		//shared service object to be returned
		var sServObj = {};

		var schemasJsos = [];

		var names = ['annotationFileSchema', 'globalDBschema'];

		/**
		 *
		 */
		sServObj.loadSchemas = function () {

			// sServObj.names.forEach(function (p) {
			console.log(names[0])
			$http.get('schemaFiles/' + names[0] + '.json').then(function (resp) {
				schemasJsos.push({
					name: 'annotationFileSchema',
					data: resp.data
				})
			});
			// })
		};

		sServObj.loadSchemas();

		/**
		 *
		 */
		sServObj.validateJSO = function (schemaName, jso) {

			if (tv4.validate(jso, schemasJsos[0].data)) {
				return true;
			} else {
				return tv4.error;
			}


		};

		return sServObj;
	});