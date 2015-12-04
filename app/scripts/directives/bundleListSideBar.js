'use strict';


angular.module('emuwebApp')
	.directive('bundleListSideBar', function (HistoryService) {
		return {
			templateUrl: 'views/bundleListSideBar.html',
			restrict: 'E',
			replace: true,
			scope: {},
			link: function postLink(scope, element, attr) {
				scope.comment = '';
				scope.finishedEditing = function (finished, key, index) {
					HistoryService.addObjToUndoStack({
						type: 'WEBAPP',
						action: 'FINISHED',
						finished: finished,
						key: key,
						index: index
					});	
				};
				scope.updateHistory = function (bundle, key, index) {
					HistoryService.updateCurChangeObj({
						type: 'WEBAPP',
						action: 'COMMENT',
						initial: scope.comment,
						comment: bundle.comment,
						key: key,
						index: index
					});
				};	
				scope.endHistory = function () {
					HistoryService.addCurChangeObjToUndoStack();
				};			
				scope.startHistory = function (bundle) {
					scope.comment = bundle.comment;
				};			

			}
		};
	});