'use strict';

angular.module('emuwebApp')
	.service('DragnDropDataService', function DragnDropDataService($q, ConfigProviderService) {
		// shared service object
		var sServObj = {};
		sServObj.convertedBundles = [];
		sServObj.sessionName = 'File(s)';
		sServObj.sessionDefault = '';

		///////////////////////////////
		// public api
		
		sServObj.getBundle = function (name, session) {
		    var defer = $q.defer();
		    var ret = {}
		    angular.forEach(sServObj.convertedBundles, function (bundle, i) {
		        if(bundle.name === name) {
		            defer.resolve({
		                status: 200,
		                data: bundle
		            });
		        }
		    });
		    return defer.promise;
		};
		
		return sServObj;
	});