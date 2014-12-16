'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.modalService
 * @description
 * # modalService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('modalService', function modalService($q, viewState) {

		// shared service object
		var sServObj = {};
		
		sServObj.isOpen = false;
		sServObj.templateUrl = '';
		sServObj.defer = undefined; 
		sServObj.dataOut = undefined; 
		sServObj.dataIn = undefined; 
		sServObj.dataExport = undefined; 
		
		/**
		 *
		 */
		sServObj.open = function (template, param1, param2) {
		    if(param1!==undefined) {
		        sServObj.dataIn = param1;
		    }
		    if(param2!==undefined) {
		        sServObj.dataExport = param2;
		    }
		    sServObj.defer = $q.defer(); 
    		sServObj.templateUrl = template;
			viewState.setState('modalShowing');
			sServObj.isOpen = true;
			return sServObj.defer.promise;
		};
		
		
		/**
		 *
		 */
		sServObj.error = function (msg) {
		    sServObj.dataIn = msg;
    		sServObj.templateUrl = 'views/error.html';
			viewState.setState('modalShowing');
		};
		
		/**
		 *
		 */
		sServObj.close = function () {
			viewState.setEditing(false);
			viewState.setState(viewState.prevState);
			sServObj.isOpen = false;
			sServObj.defer.resolve(false);
		};
		
		
		/**
		 *
		 */
		sServObj.confirm = function () {
			viewState.setEditing(false);
			viewState.setState(viewState.prevState);
			sServObj.isOpen = false;
			sServObj.defer.resolve(true);
		};	
		
		/**
		 *
		 */
		sServObj.confirmContent = function () {
			viewState.setEditing(false);
			viewState.setState(viewState.prevState);
			sServObj.isOpen = false;
			sServObj.defer.resolve(sServObj.dataOut);
		};
		
		/**
		 *
		 */
		sServObj.getTemplateUrl = function () {
			return sServObj.templateUrl;
		};	
	

		return sServObj;
	});