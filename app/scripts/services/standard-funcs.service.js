/**
 * This service holds general helper functions that do not depend on any of the
 * EMU components.
 */

'use strict';

angular.module('emuwebApp')
	.service('StandardFuncsService', function () {

		// shared service object
		var sServObj = {};

		/**
		 * Recursively looks at all properties of a given object and
		 * removes any whose name starts with an underscore
		 *
		 * @param o The object to traverse
		 * @returns nothing
		 */
		sServObj.traverseAndClean = function (o) {
			for (var i in o) {
				if (i.substr(0, 1) === '_') {
					delete o[i];
				}

				if (o[i] !== null && typeof(o[i]) === 'object') {
					// Go one step down in the object tree
					sServObj.traverseAndClean(o[i]);
				}
			}
		};

		/**
		 * Return a reversed copy of an array
		 */
		sServObj.reverseCopy = function (a) {
			var r = angular.copy(a);
			r.reverse();
			return r;
		};

		return sServObj;
	});
	
