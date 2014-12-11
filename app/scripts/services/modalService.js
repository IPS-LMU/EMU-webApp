'use strict';

/**
 * @ngdoc service
 * @name emuwebApp.modalService
 * @description
 * # modalService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('modalService', function modalService(viewState) {

		// shared service object
		var sServObj = {};
		
		sServObj.isOpen = false;
		sServObj.templateUrl = '';
		sServObj.templateController = '';
		
		/**
		 *
		 */
		sServObj.open = function (template, controller) {
    		sServObj.templateUrl = template;
    		sServObj.templateController = controller;		    
			viewState.setState('modalShowing');
			sServObj.isOpen = true;
		};
		
		/**
		 *
		 */
		sServObj.close = function () {
			viewState.setEditing(false);
			viewState.setState(viewState.prevState);
			sServObj.isOpen = false;
		};	
		
		/**
		 *
		 */
		sServObj.getTemplateUrl = function () {
			return sServObj.templateUrl;
		};	
		
		/**
		 *
		 */
		sServObj.getController = function () {
			return sServObj.templateController;
		};		

		return sServObj;
	});