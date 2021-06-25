import * as angular from 'angular';
import * as d3 from 'd3';


/**
 * @ngdoc directive
 * @name emuWebApp.directive:lineChart
 * @description
 * # lineChart
 */
angular.module('emuwebApp')
	.directive('lineChart', function () {
		return {
			restrict: 'E',
			scope: {
				data: '=',
				threshold: '='
			},
			link: function postLink(scope, element) {
				//////////////////////
				// watches 
				scope.$watch('data', () => {
					scope.render(scope.data);
				}, true);
				//////////////////////


				//Set margins, width, and height
				var margin = {
						top: 20,
						right: 20,
						bottom: 20,
						left: 40
					},
					width = 400 - margin.left - margin.right,
					height = 200 - margin.top - margin.bottom;

				//Create the d3 element and position it based on margins
				var svg = d3.select(element[0])
					.append('svg')
					.attr('width', width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom)
					.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

				//Create the scales we need for the graph
				var x = d3.scaleLinear().range([0, width]);
				var y = d3.scaleLinear().range([height, 0]);

				//Create the axes we need for the graph
				var xAxis = d3.svg.axis()
					.scale(x)
					.tickSize(5)
					.tickSubdivide(true);

				var yAxis = d3.svg.axis()
					.scale(y)
					.orient('left');

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
				scope.render = function (data) {

					//Set our scale's domains
					// x.domain(data.map(function (d) {
					// 	return d.name;
					// }));

					// y.domain([0, d3.max(data, function (d) {
					// 	return d.count;
					// })]);
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
					svg.append('svg:path')
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

					svg.append('line')
						// .attr('transform', 'translate(100, 50)')
						.attr({
							'x1': x(scope.threshold),
							'y1': 0,
							'x2': x(scope.threshold),
							'y2': height
						})
						.attr('stroke', 'steelblue')
						.attr('class', 'verticalLine');

					//Create or update the bar data
					// var bars = svg.selectAll('.bar').data(data);
					// bars.enter()
					// 	.append('rect')
					// 	.attr('class', 'bar')
					// 	.attr('x', function (d) {
					// 		return x(d.name);
					// 	})
					// 	.attr('width', x.rangeBand());

					//Animate bars
					// bars
					// 	.transition()
					// 	.duration(1000)
					// 	.attr('height', function (d) {
					// 		return height - y(d.count);
					// 	})
					// 	.attr('y', function (d) {
					// 		return y(d.count);
					// 	})
				};


			}
		};
	});