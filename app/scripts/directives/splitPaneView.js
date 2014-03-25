angular.module('emuwebApp')
  .directive('bgSplitter', function ($rootScope, viewState) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        showTwoDimCans: '@',
        twoDimTrackName: '@'
      },
      template: '<div class="split-panes vertical" ng-transclude></div>',
      controller: function ($scope) {
        $scope.panes = [];
        $scope.bottomRightResizePane;

        this.addPane = function (pane) {
          if ($scope.panes.length > 1)
            throw 'splitters can only have two panes';
          $scope.panes.push(pane);
          return $scope.panes.length;
        };
        this.setBottomRightResizePane = function (pane) {
          console.log("asdfasf")
          $scope.bottomRightResizePane = pane;
        };
      },
      link: function (scope, element, attrs) {

        var dragBottomRightResizePaneTopResizer = false;
        var dragBottomRightResizePaneLeftResizer = false;
        var dragBottomRightResizePaneCornerResizer = false;

        // create split pane view
        var handler = angular.element('<div class="split-handler"><span></span></div>');
        var pane1 = scope.panes[0];
        var pane2 = scope.panes[1];
        var pane3 = scope.bottomRightResizePane;

        var pane1Min = pane1.minSize || 0;
        var pane2Min = pane2.minSize || 0;
        var dragSplitPaneResizer = false;

        var drag = false;

        pane1.elem.after(handler);

        // element.append(twoDimCans);

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

          if (dragBottomRightResizePaneTopResizer) {
            var height = bounds.bottom - bounds.top;
            pos = ev.clientY - bounds.top;
            if (pos <= 10 || height - pos <= 10) {
              return;
            }
            pane3.elem.css('top', pos + 'px');
            var tmp = height - pos;
            pane3.elem.css('height', tmp + 'px');
          }

          if (dragBottomRightResizePaneLeftResizer) {
            var width = bounds.right - bounds.left;
            pos = ev.clientX - bounds.left;
            if (pos <= 10 || width - pos <= 10) {
              return;
            }
            pane3.elem.css('left', pos + 'px');
            var tmp = width - pos;
            pane3.elem.css('width', tmp + 'px');
          }

          if (dragBottomRightResizePaneCornerResizer) {
            // do height and top
            var height = bounds.bottom - bounds.top;
            pos = ev.clientY - bounds.top;
            if (pos <= 10 || height - pos <= 10) {
              return;
            }
            pane3.elem.css('top', pos + 'px');
            var tmp = height - pos;
            pane3.elem.css('height', tmp + 'px');

            // do width and left
            var width = bounds.right - bounds.left;
            pos = ev.clientX - bounds.left;
            if (pos <= 10 || width - pos <= 10) {
              return;
            }
            pane3.elem.css('left', pos + 'px');
            var tmp = width - pos;
            pane3.elem.css('width', tmp + 'px');
          }


        });

        handler.bind('mousedown', function (ev) {
          ev.preventDefault();
          drag = true;
          dragSplitPaneResizer = true;
          viewState.setdragBarActive(drag);
          $rootScope.$digest();
        });

        if (scope.showTwoDimCans === "true") {
          pane3.elem.bind('mousedown', function (ev) {
            ev.preventDefault();
            drag = true;
            dragBottomRightResizePaneTopResizer = true;
            viewState.setdragBarActive(drag);
            $rootScope.$digest();

          });

          pane3.elem.bind('mousedown', function (ev) {
            ev.preventDefault();
            drag = true;
            dragBottomRightResizePaneLeftResizer = true;
            viewState.setdragBarActive(drag);
            $rootScope.$digest();
          });

          pane3.elem.bind('mousedown', function (ev) {
            ev.preventDefault();
            drag = true;
            dragBottomRightResizePaneCornerResizer = true;
            viewState.setdragBarActive(drag);
            $rootScope.$digest();
          });
        }

        angular.element(document).bind('mouseup', function (ev) {
          drag = false;
          dragSplitPaneResizer = false;

          dragBottomRightResizePaneTopResizer = false;
          dragBottomRightResizePaneLeftResizer = false;
          dragBottomRightResizePaneCornerResizer = false
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
        minSize: '=',
        type: '@'
      },
      template: '<div class="{{typeclass}}" ng-transclude></div>',

      link: function (scope, element, attrs, bgSplitterCtrl) {
        var newElement;
        if (scope.type !== "bottomRightResizePane") {
          scope.elem = element;
          scope.index = bgSplitterCtrl.addPane(scope);
          scope.typeclass = 'split-pane' + scope.index;

        } else {
          // element.toggleClass('alert-box alert')
          // var twoDimCans = angular.element('<div class="bottomRightResizePane"></div>');
          var bottomRightResizePaneTopResizer = angular.element('<div class="bottomRightResizePaneTopResizer"></div>');
          var bottomRightResizePaneLeftResizer = angular.element('<div class="bottomRightResizePaneLeftResizer"></div>');
          var bottomRightResizePaneCornerResizer = angular.element('<div class="bottomRightResizePaneCornerResizer"></div>');
          element.prepend(bottomRightResizePaneLeftResizer);
          element.prepend(bottomRightResizePaneTopResizer);
          element.prepend(bottomRightResizePaneCornerResizer);

          // element.append(twoDimCans);

          scope.elem = element;
          scope.index = 3;
          scope.typeclass = 'bottomRightResizePane';
          bgSplitterCtrl.setBottomRightResizePane(scope);
        }
      }
    };
  });