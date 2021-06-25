import * as angular from 'angular';
import * as d3 from 'd3';

let LineChartComponent = {
    selector: "lineChart",
    bindings: {
        data: '<',
        threshold: '<'
    },
    controller: [
        `$element`,
        class LineChartController {
            private $element;
            
            private data;
            private threshold;
            private margin;
            private width;
            private height;
            private svg;
            private x;
            private y;
            private xAxis;
            private yAxis;
            private lineFunc;
            
            
            // private _inited;
            
            constructor ($element) {
                this.$element = $element;
                
                // this._inited = false

                this.margin = {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 40
                };
                this.width = 400 - this.margin.left - this.margin.right,
                this.height = 200 - this.margin.top - this.margin.bottom;
                
                //Create the d3 element and position it based on margins
                this.svg = d3.select(this.$element[0])
                .append('svg')
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
                
                // Create the scales we need for the graph
                this.x = d3.scaleLinear().range([0, this.width]);
                this.y = d3.scaleLinear().range([this.height, 0]);
                
                // Create the axes we need for the graph
                // this.xAxis = d3.svg.axis()
                //     .scale(this.x)
                //     .tickSize(5)
                //     .tickSubdivide(true);
                
                // new d3 syntax                    
                this.xAxis =  d3.axisBottom(this.x)
                .tickSize(5);
                
                // this.yAxis = d3.svg.axis()
                //     .scale(this.y)
                //     .orient('left');
                
                // new d3 syntax
                this.yAxis = d3.axisLeft(this.y);
                
                // line drawing function
                this.lineFunc = d3.line()
                .x((d) => {
                    return this.x(d.x);
                })
                .y((d) => {
                    return this.y(d.y);
                })
                .curve(d3.curveLinear);


            }
            $postLink () {
                
                
            }
            $onChanges (changes) {
                // if(this._inited){
                if(changes.data || changes.threshold){
                    this.render();
                }
                // }
            }
            $onInit () {
                // this._inited = true;
            };
            
            private render() {
                // Set our scale's domains
                // x.domain(data.map(function (d) {
                // 	return d.name;
                // }));
                
                // y.domain([0, d3.max(data, function (d) {
                // 	return d.count;
                // })]);
                this.x.domain([d3.min(this.data, (d) => {
                    return d.x;
                }), d3.max(this.data, (d) => {
                    return d.x;
                })]);
                
                this.y.domain([d3.min(this.data, (d) => {
                    return d.y;
                }), d3.max(this.data, (d) => {
                    return d.y;
                })]);
                
                
                // Remove the axes so we can draw updated ones
                this.svg.selectAll('g.axis').remove();
                
                // Render X axis
                this.svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(this.xAxis);
                
                // Render Y axis
                this.svg.append('g')
                .attr('class', 'y axis')
                .call(this.yAxis);
                
                // Render path
                this.svg.append('svg:path')
                .attr('d', this.lineFunc(this.data))
                .attr('stroke', 'red')
                .attr('stroke-width', 1)
                .attr('fill', 'none');
                
                // draw threshold SIC SIC SIC... not working yet!
                // this.svg.append('svg:line')
                // .attr('x1', 5)
                // .attr('y1', 5)
                // .attr('x2', 200)
                // .attr('y2', 200)
                // .attr('class', 'label-line');
                
                this.svg.append('line')
                .attr('x1', this.x(this.threshold))
                .attr('y1', 0)
                .attr('x2', this.x(this.threshold))
                .attr('y2', this.height)
                .attr('stroke', 'steelblue')
                .attr('class', 'verticalLine');
                
                // Create or update the bar data
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
                
            }
            
        }
    ]
}

angular.module('emuwebApp')
.component(LineChartComponent.selector, LineChartComponent);