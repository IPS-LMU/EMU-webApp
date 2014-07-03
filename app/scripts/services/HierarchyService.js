'use strict';

angular.module('emuwebApp')
	.service('HierarchyService', function (ConfigProviderService) {
		// shared service object
		var sServObj = {};

		// Recursively find all paths through the level hierarchy
		// This is done bottom-up because there is no explicit root element in the levelDefinitions
		sServObj.findPaths = function (startNode, path) {
			if (typeof path === 'undefined') {
				var path = [startNode];
			} else {
				path = path.concat([startNode]);
			}

			// Find all parents
			var parents = [];
			for (var i = 0; i<ConfigProviderService.curDbConfig.linkDefinitions.length; ++i) {
				if (ConfigProviderService.curDbConfig.linkDefinitions[i].sublevelName === startNode) {
					parents.push (ConfigProviderService.curDbConfig.linkDefinitions[i].superlevelName);
				}
			}

			// If we have no more parents, we're at the end of the
			// path and thus returning it
			if (parents.length === 0) {
				return [path];
			}
			
			// If, on the other hand, there are parents, we start
			// recursion to find all paths
			var paths = [];
			for (var i = 0; i<parents.length; ++i) {
				paths = paths.concat(sServObj.findPaths(parents[i], path));
			}

			return paths;
		};

		return sServObj;
	});

