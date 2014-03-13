'use strict';

angular.module('emuwebApp')
  .directive('horizSplitter', function () {
    return {
      template: '<div class="horizSplitter"></div>',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs, $document) {
        // element.text('this is the horizSplitter directive');

        var startX = 0,
          startY = 0,
          x = 0,
          y = 0;
        var isDragging = false;

        // element.css({
        //   position: 'relative',
        //   border: '1px solid red',
        //   backgroundColor: 'lightgrey',
        //   cursor: 'pointer'
        // });

        element.on('mousedown', function (event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          // startY = event.pageY - y;
          console.log(startY);
          isDragging = true;

        });

        element.on('mouseup', function (event) {
          // Prevent default dragging of selected content
          isDragging = false;

        });


        element.on('mousemove', function mousemove(event) {
          if (isDragging) {
            console.log('###############')
            console.log(event)
            console.log(event.clientY)
            console.log(event.pageY)
            y = event.pageY - startY;
            element.css({
              top: event.pageY-44 + 'px',
              // left: x + 'px'
            });
          }
        });

        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }

      }
    };
  });