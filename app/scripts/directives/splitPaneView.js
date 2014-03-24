angular.module('emuwebApp')
  .directive('bgSplitter', function ($rootScope, viewState) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        orientation: '@'
      },
      template: '<div class="split-panes {{orientation}}" ng-transclude></div>',
      controller: function ($scope) {
        $scope.panes = [];

        this.addPane = function (pane) {
          if ($scope.panes.length > 1)
            throw 'splitters can only have two panes';
          $scope.panes.push(pane);
          return $scope.panes.length;
        };
      },
      link: function (scope, element, attrs) {
        // create 2D cans area
        var twoDimCans = angular.element('<div class="twoDcanvases" show-twod="!is2dCancasesHidden" ng-show="cps.vals.perspectives[vs.curPerspectiveIdx].twoDcanvases.order.length > 0"></div>');
        var twoDimTopResizer = angular.element('<div class="twoDimCanvasesTopResizer"></div>');
        var twoDimLeftResizer = angular.element('<div class="twoDimCanvasesLeftResizer"></div>');
        var twoDimCornerResizer = angular.element('<div class="twoDimCanvasesCornerResizer"></div>');
        twoDimCans.append(twoDimTopResizer);
        twoDimCans.append(twoDimLeftResizer);
        twoDimCans.append(twoDimCornerResizer);
        var dragTwoDimTopResizer = false;
        var dragTwoDimLeftResizer = false;
        var dragTwoDimCornerResizer = false;

        // create split pane view
        var handler = angular.element('<div class="split-handler"><span></span></div>');
        var pane1 = scope.panes[0];
        var pane2 = scope.panes[1];
        var vertical = scope.orientation == 'vertical';
        var pane1Min = pane1.minSize || 0;
        var pane2Min = pane2.minSize || 0;
        var dragSplitPaneResizer = false;

        var drag = false;

        pane1.elem.after(handler);

        element.append(twoDimCans);

        element.bind('mousemove', function (ev) {
          if (!drag) return;

          var bounds = element[0].getBoundingClientRect();
          var pos = 0;

          if (dragSplitPaneResizer) {

            var height = bounds.bottom - bounds.top;
            pos = ev.clientY - bounds.top;
            // perc = pos/height * 100;
            // console.log(perc);

            if (pos < pane1Min) return;
            if (height - pos < pane2Min) return;

            handler.css('top', pos + 'px');
            pane1.elem.css('height', pos + 'px');
            pane2.elem.css('top', pos + 'px');
            viewState.setdragBarHeight(pos);
          }

          if (dragTwoDimTopResizer) {
            var height = bounds.bottom - bounds.top;
            pos = ev.clientY - bounds.top;
            if (pos <= 10 || height - pos <= 10) {
              return;
            }
            twoDimCans.css('top', pos + 'px');
            var tmp = height - pos;
            twoDimCans.css('height', tmp + 'px');
          }

          if (dragTwoDimLeftResizer) {
            var width = bounds.right - bounds.left;
            pos = ev.clientX - bounds.left;
            if (pos <= 10 || width - pos <= 10) {
              return;
            }
            twoDimCans.css('left', pos + 'px');
            var tmp = width - pos;
            twoDimCans.css('width', tmp + 'px');
          }

          if (dragTwoDimCornerResizer) {
            // do height and top
            var height = bounds.bottom - bounds.top;
            pos = ev.clientY - bounds.top;
            if (pos <= 10 || height - pos <= 10) {
              return;
            }
            twoDimCans.css('top', pos + 'px');
            var tmp = height - pos;
            twoDimCans.css('height', tmp + 'px');

            // do width and left
            var width = bounds.right - bounds.left;
            pos = ev.clientX - bounds.left;
            if (pos <= 10 || width - pos <= 10) {
              return;
            }
            twoDimCans.css('left', pos + 'px');
            var tmp = width - pos;
            twoDimCans.css('width', tmp + 'px');
          }


        });

        handler.bind('mousedown', function (ev) {
          ev.preventDefault();
          drag = true;
          dragSplitPaneResizer = true;
          viewState.setdragBarActive(drag);
          $rootScope.$digest();
        });

        twoDimTopResizer.bind('mousedown', function (ev) {
          ev.preventDefault();
          drag = true;
          dragTwoDimTopResizer = true;
          viewState.setdragBarActive(drag);
          $rootScope.$digest();

        });

        twoDimLeftResizer.bind('mousedown', function (ev) {
          ev.preventDefault();
          drag = true;
          dragTwoDimLeftResizer = true;
          viewState.setdragBarActive(drag);
          $rootScope.$digest();
        });

        twoDimCornerResizer.bind('mousedown', function (ev) {
          ev.preventDefault();
          drag = true;
          dragTwoDimCornerResizer = true;
          viewState.setdragBarActive(drag);
          $rootScope.$digest();
        });

        angular.element(document).bind('mouseup', function (ev) {
          drag = false;
          dragTwoDimTopResizer = false;
          dragTwoDimLeftResizer = false;
          dragTwoDimCornerResizer = false
          viewState.setdragBarActive(drag);
          $rootScope.$digest();
        });
      }
    };
  })
  .directive('bgPane', function () {
    return {
      restrict: 'E',
      require: '^bgSplitter',
      replace: true,
      transclude: true,
      scope: {
        minSize: '='
      },
      template: '<div class="split-pane{{index}}" ng-transclude></div>',
      link: function (scope, element, attrs, bgSplitterCtrl) {
        scope.elem = element;
        scope.index = bgSplitterCtrl.addPane(scope);
      }
    };
  });