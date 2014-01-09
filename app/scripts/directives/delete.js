'use strict';

angular.module('emulvcApp')
  .directive('delete', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        var id = scope.this.tier.TierName;

        element.bind('click', function () {
          scope.vs.setcurClickTierName(id);
          scope.dials.open('views/deleteTier.html', 'ModalCtrl', id);
        });

      }
    };
  });