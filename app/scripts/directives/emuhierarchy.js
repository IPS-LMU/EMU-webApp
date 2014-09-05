'use strict';


angular.module('emuwebApp')
  .directive('emuhierarchy', function (viewState, LevelService) {
    return {
      template: '<div class="emuwebapp-hierarchy-container"></div>',
      restrict: 'E',
      scope: {},
      replace: true,
      link: function postLink(scope, element, attrs) {

        console.log(element[0])

        //////////////////////
        // watches 

        // SIC deep watches are really expensive!!!! Should watch something else!!!!!!
        scope.$watch('LevelService.data', function () {
          scope.render();
        }, true);

        //
        //////////////////////

        /////////////////////////////
        // inital d3.js setup stuff

        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          width = parseInt(d3.select(element[0]).style('width'), 10),
          width = width - margin.left - margin.right,
          height = parseInt(d3.select(element[0]).style('height'), 10),
          height = height - margin.top - margin.bottom,
          barHeight = 20,
          percent = d3.format('%');

        console.log(height)

        //Set margins, width, and height
        // var margin = {
        //     top: 0,
        //     right: 0,
        //     bottom: 0,
        //     left: 0
        //   },
        //   width = 500 - margin.left - margin.right,
        //  height = 150 - margin.top - margin.bottom;

        //Create the d3 element and position it based on margins
        var svg = d3.select(element[0])
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // background color
        svg.append("rect")
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("fill", "lightgrey");

        // Create the scales we need for the graph
        var x = d3.scale.linear().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        // Create the axes we need for the graph
        var xAxis = d3.svg.axis()
          .scale(x)
          .tickSize(5)
          .tickSubdivide(true)
          .orient('top');

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('right');

        // line drawing function
        var lineFunc = d3.svg.line()
          .x(function (d) {
            return x(d.x);
          })
          .y(function (d) {
            return y(d.y);
          })
          .interpolate('linear');


        /**
         *
         */
        scope.render = function () {
          var data = [{
            x: 1,
            y: 2
          }, {
            x: 2,
            y: 3
          }];

          x.domain([d3.min(data, function (d) {
            return d.x;
          }), d3.max(data, function (d) {
            return d.x;
          })]);

          y.domain([d3.min(data, function (d) {
            return d.y;
          }), d3.max(data, function (d) {
            return d.y;
          })]);


          //Remove the axes so we can draw updated ones
          svg.selectAll('g.axis').remove();

          //Render X axis
          svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

          //Render Y axis
          svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

          // Render path
          var lines = svg.append('svg:path')
            .attr('d', lineFunc(data))
            .attr('stroke', 'red')
            .attr('stroke-width', 1)
            .attr('fill', 'none');

          // draw threshold SIC SIC SIC... not working yet!
          svg.append('svg:line')
            .attr('x1', 5)
            .attr('y1', 5)
            .attr('x2', 200)
            .attr('y2', 200)
            .attr('class', 'label-line');
        };

        /**
         * SIC... not being called
         */
        scope.resizeHierarchy = function () {
          console.log('###############')
          console.log(width)
        };
      }
    };
  });