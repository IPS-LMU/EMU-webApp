import * as angular from 'angular';

class DragnDropDataService{
	private convertedBundles;
	private sessionDefault;
	private $q;
	
	constructor($q){
		this.$q = $q;
		this.convertedBundles = [];
		this.sessionDefault = '';
	}
	
	///////////////////////////////
	// public api
	
	public getBundle(name) {
		var defer = this.$q.defer();
		this.convertedBundles.forEach((bundle) => {
			if (bundle.name === name) {
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
	
	public resetToInitState() {
		this.convertedBundles = [];
		this.sessionDefault = '';
	};
	
	public setDefaultSession(name) {
		this.sessionDefault = name;
	};
	
	public getDefaultSession() {
		return this.sessionDefault;
	};
	
}

angular.module('emuwebApp')
.service('DragnDropDataService', ['$q', DragnDropDataService]);
