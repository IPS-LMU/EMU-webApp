'use strict';

angular.module('emuwebApp')
	.service('Validationservice', function Validationservice($http) {
		//shared service object to be returned
		var sServObj = {};

		var schemas = [];

		var paths = ['schemaFiles/annotationFileSchema.json', 'globalDBschema.json'];

		/**
		 *
		 */
		sServObj.loadSchemas = function () {

			// sServObj.paths.forEach(function (p) {
			console.log(paths[0])
			$http.get(paths[0]).then(function (resp) {
				console.log(resp.data)
				schemas.push({
					name: 'annotationFileSchema',
					data: resp.data
				})
			});
			// })
		};

		sServObj.loadSchemas();

		return sServObj;
	});