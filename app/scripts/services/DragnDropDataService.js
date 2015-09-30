'use strict';

angular.module('emuwebApp')
	.service('DragnDropDataService', function DragnDropDataService($q, ConfigProviderService, modalService) {
		// shared service object
		var sServObj = {};
		sServObj.convertedBundles = [];
		sServObj.sessionDefault = '';

		///////////////////////////////
		// public api

		sServObj.getBundle = function (name, session) {
		    var defer = $q.defer();
		    var ret = {}
		    angular.forEach(sServObj.convertedBundles, function (bundle, i) {
		        if(bundle.name === name) {
							  var bc = angular.copy(bundle);
								delete bc.name;
		            defer.resolve({
		                status: 200,
		                data: bc
		            });
		        }
		    });
		    return defer.promise;
		};

		sServObj.resetToInitState = function () {
		    sServObj.convertedBundles = [];
		    sServObj.sessionDefault = '';
		};

		sServObj.setDefaultSession = function (name) {
		    sServObj.sessionDefault = name;
		};

		sServObj.getDefaultSession = function () {
		    return sServObj.sessionDefault;
		};

		return sServObj;
	});
