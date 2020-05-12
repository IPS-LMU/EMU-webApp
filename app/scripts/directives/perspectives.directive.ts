import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('perspectives', function () {
		return {
			template: `
			<nav class="emuwebapp-right-menu" ng-show="cps.vals.restrictions.showPerspectivesSidebar" show-menu="vs.getPerspectivesSideBarOpen()">
			<button ng-click="vs.setPerspectivesSideBarOpen(!vs.getPerspectivesSideBarOpen());">
				<i class="material-icons">menu</i>
			  <!-- <img src="img/menu.svg" ="_20px _inverted" /> -->
			</button>
			<h3>Perspectives</h3>
			<ul>
				<li ng-repeat="persp in cps.vals.perspectives" ng-click="changePerspective(persp);" ng-class="getPerspectiveColor(persp);">
					{{persp.name}}
				</li>
			</ul>
		</nav>
		`,
			replace: true,
			restrict: 'E'
		};
	});
