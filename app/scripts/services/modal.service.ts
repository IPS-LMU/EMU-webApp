import * as angular from 'angular';

/**
 * @ngdoc service
 * @name emuwebApp.modalService
 * @description
 * # modalService
 * Service in the emuwebApp.
 */
angular.module('emuwebApp')
	.service('modalService', function modalService($q, ArrayHelperService, viewState) {

		this.initialize = function() {
            this.isOpen = false;
            this.templateUrl = '';
            this.defer = undefined;
            this.deferChange = undefined;
            this.force = false;
            this.dataOut = undefined;
            this.dataIn = undefined;
            this.dataExport = undefined;
        };

		/**
		 * open modal normally
		 */
		this.open = function (template, param1, param2, force) {
		    this.initialize();

			if (param1 !== undefined) {
				this.dataIn = param1;
				if (param1.y !== undefined) {
					this.dataIn.chartData = ArrayHelperService.convertArrayToXYjsoArray(param1.y);
				}
			}
			if (param2 !== undefined) {
				this.dataExport = param2;
			}
			if (force !== undefined) { // force user to do sth
				this.force = force;
			}
			this.defer = $q.defer();
			this.templateUrl = template;
			viewState.setState('modalShowing');
			this.isOpen = true;
			return this.defer.promise;
		};

		/**
		 *
		 */
		this.error = function (msg) {
            this.initialize();

			this.dataIn = msg;
			this.templateUrl = 'views/error.html';
			viewState.setState('modalShowing');
		};

		/**
		 *
		 */
		this.close = function () {
			viewState.setEditing(false);
			viewState.setState(viewState.prevState);
			this.isOpen = false;
			if (viewState.hierarchyState.isShown()) {
				viewState.hierarchyState.toggleHierarchy();
			}
			this.defer.resolve(false);
		};


		/**
		 *
		 */
		this.closeAndResolve = function (status) {
			viewState.setEditing(false);
			viewState.setState(viewState.prevState);
			this.isOpen = false;
			this.defer.resolve(status);
		};


		/**
		 *
		 */
		this.confirm = function () {
			viewState.setEditing(false);
			viewState.setState(viewState.prevState);
			this.isOpen = false;
			this.defer.resolve(true);
		};


		/**
		 *
		 */
		this.select = function (idx) {
			this.closeAndResolve(idx);
		};

		/**
		 *
		 */
		this.confirmContent = function () {
			viewState.setEditing(false);
			viewState.setState(viewState.prevState);
			this.isOpen = false;
			this.defer.resolve(this.dataOut);
		};

		/**
		 *
		 */
		this.getTemplateUrl = function () {
			return this.templateUrl;
		};

	});
