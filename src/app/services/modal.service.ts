import * as angular from 'angular';

class ModalService{
	private $q;
	private ArrayHelperService;
	private ViewStateService;

	private isOpen;
	private templateUrl;
	private defer;
	private deferChange;
	private force;
	private dataOut;
	private dataIn;
	private dataExport;

	
	constructor($q, ArrayHelperService, ViewStateService){
		this.$q = $q;
		this.ArrayHelperService = ArrayHelperService;
		this.ViewStateService = ViewStateService;

	}

	public initialize() {
		// TODO: move to constructor
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
	public open(template, param1, param2, force) {
		this.initialize();
		
		if (param1 !== undefined) {
			this.dataIn = param1;
			if (param1.y !== undefined) {
				this.dataIn.chartData = this.ArrayHelperService.convertArrayToXYjsoArray(param1.y);
			}
		}
		if (param2 !== undefined) {
			this.dataExport = param2;
		}
		if (force !== undefined) { // force user to do sth
			this.force = force;
		}
		this.defer = this.$q.defer();
		this.templateUrl = template;
		this.ViewStateService.setState('modalShowing');
		this.isOpen = true;
		return this.defer.promise;
	};
	
	/**
	*
	*/
	public error (msg) {
		this.initialize();
		
		this.dataIn = msg;
		this.templateUrl = 'views/error.html';
		this.ViewStateService.setState('modalShowing');
	};
	
	/**
	*
	*/
	public close() {
		this.ViewStateService.setEditing(false);
		this.ViewStateService.setState(this.ViewStateService.prevState);
		this.isOpen = false;
		if (this.ViewStateService.hierarchyState.isShown()) {
			this.ViewStateService.hierarchyState.toggleHierarchy();
		}
		this.defer.resolve(false);
	};
	
	
	/**
	*
	*/
	public closeAndResolve(status) {
		this.ViewStateService.setEditing(false);
		this.ViewStateService.setState(this.ViewStateService.prevState);
		this.isOpen = false;
		if (this.ViewStateService.hierarchyState.isShown()) {
			this.ViewStateService.hierarchyState.toggleHierarchy();
		}
		this.defer.resolve(status);
	};
	
	
	/**
	*
	*/
	public confirm() {
		this.ViewStateService.setEditing(false);
		this.ViewStateService.setState(this.ViewStateService.prevState);
		this.isOpen = false;
		this.defer.resolve(true);
	};
	
	
	/**
	*
	*/
	public select(idx) {
		this.closeAndResolve(idx);
	};
	
	/**
	*
	*/
	public confirmContent() {
		this.ViewStateService.setEditing(false);
		this.ViewStateService.setState(this.ViewStateService.prevState);
		this.isOpen = false;
		this.defer.resolve(this.dataOut);
	};
	
	/**
	*
	*/
	public getTemplateUrl() {
		return this.templateUrl;
	};
	
	
}

/**
* @ngdoc service
* @name emuwebApp.ModalService
* @description
* # ModalService
* Service in the emuwebApp.
*/
angular.module('emuwebApp')
.service('ModalService', [
	'$q', 
	'ArrayHelperService', 
	'ViewStateService', 
	ModalService
])
