'use strict';

angular.module('emulvcApp')
  .directive('save', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        var id = scope.this.tier.TierName;

        element.bind('click', function () {
          scope.vs.setcurClickTierName(id);
          scope.dials.open('views/export.html', 'ModalCtrl', JSON.stringify(scope.this.tier));
        });

      }
    };
  });