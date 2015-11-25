'use strict';


angular.module('emuwebApp')
	.directive('bundleListSideBar', function (HistoryService) {
		return {
			templateUrl: 'views/bundleListSideBar.html',
			restrict: 'E',
			replace: true,
			scope: {},
			link: function postLink(scope, element, attr) {
				scope.history = function (bundle, key, index, type) {
					switch(type) {
						case 'finishedEditing':
							HistoryService.addObjToUndoStack({
								type: 'WEBAPP',
								action: 'FINISHED',
								bundle: bundle,
								key: key,
								index: index
							});	
						break;
						case 'comment':
							HistoryService.addObjToUndoStack({
								type: 'WEBAPP',
								action: 'COMMENT',
								bundle: bundle,
								key: key,
								index: index
							});	
						break;						
					}
				};
			}
		};
	});