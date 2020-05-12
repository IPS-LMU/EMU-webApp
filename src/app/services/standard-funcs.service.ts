import * as angular from 'angular';

class StandardFuncsService{
	constructor(){}
	
	/**
	* Recursively looks at all properties of a given object and
	* removes any whose name starts with an underscore
	*
	* @param o The object to traverse
	* @returns nothing
	*/
	public traverseAndClean(o) {
		for (var i in o) {
			if (i.substr(0, 1) === '_') {
				delete o[i];
			}
			
			if (o[i] !== null && typeof(o[i]) === 'object') {
				// Go one step down in the object tree
				this.traverseAndClean(o[i]);
			}
		}
	};
	
	/**
	* Return a reversed copy of an array
	*/
	public reverseCopy(a) {
		var r = angular.copy(a);
		r.reverse();
		return r;
	};
	
	
}

/**
* This service holds general helper functions that do not depend on any of the
* EMU components.
*/

angular.module('emuwebApp')
.service('StandardFuncsService', StandardFuncsService);

