app.directive('chartThreadDivergence', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive ==");

		// Layout
		var container = element[0];
		var layout = {
			margin: { top: 10, right: 10, bottom: 10, left: 10},
			height:	container.clientHeight,
			width:	container.clientWidth,
			graph:	{
				width:	function() { return Math.max(1, container.clientWidth - layout.margin.left - layout.margin.right); },
				height:	function() { return Math.max(1, container.clientHeight - layout.margin.top - layout.margin.bottom); },
				top:	function() { return layout.top.bottom; },
				right:	function() { return Math.max(1, container.clientWidth - layout.margin.right); },
				bottom:	function() { return Math.max(1, container.clientHeight - layout.margin.bottom); },
				left:	function() { return layout.top.left; }
			}
		};

		// Data
		var data = scope.data[scope.ids[0]];

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFEEEE");


		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.height(), 0]);
		var scaleY = d3.scale.linear().rangeRound([0, layout.graph.width()]);

		// Scales - domains
		scaleX.domain([0, 16]);
		scaleY.domain([0, 100]);


		// Draw
		console.log(data.frames);

		// Draw - core
		var coreGroup = svg.append("g").attr("class", "dataset");
		var coreElement = coreGroup.append("rect")
				.attr("width", layout.graph.width) // 🕒 repaintable
				.attr("height", scaleX(data.stats.availableCores))
				.attr("x", layout.margin.left)
				.attr("y", layout.graph.bottom() - scaleX(data.stats.availableCores))
				.style("fill", "#4682B4");

/*
		var	valueline = d3.svg.line()
			.x(function(d) { return scaleX(d.d); })
			.y(function(d) { return scaleY(d.i); });
		var coreLine = coreGroup.append("path")
				.attr("class", "line")
				.attr("d", valueline([{i: 0, d: data.stats.availableCores}, {i: 100, d: data.stats.availableCores}]))
				.style("stroke", "#808080");
*/


		// Draw - core

/*
		var timeElements = svg.selectAll('.dataset').data(data.frames).enter()
				.append("g")
				.attr("class", "dataset");
		/*
					.attr("transform", function (d, i) {
						return "translate(" + (i * (layout.boxes.width + layout.boxes.padding)) + ", 0)";
					});
		*/
/*
		var boxElements = timeElements.selectAll('rect').data(function (d) {
				return d.types;
			}).enter()
				.append('rect');

		// Draw rectanges - Y axis
		/*
		boxes.selectAll("rect")
			.data(function (d) {
				return d.types;
			}).enter()
			.append("rect")
				.attr("width", layout.boxes.width)
				.attr("y", function (d) {
					return scaleY(d.y1);
				})
				.attr("height", function (d) {
					return scaleY(d.y0) - scaleY(d.y1);
				})
				.style("fill", function (d) {
					return color(d.name);
				});
		*/


		// Redraw
		var repaint = function repaint() {
				// Sizes
				layout.width = container.clientWidth;

				// SVG
				svg.attr('width', layout.width);
				coreElement.attr('width', layout.graph.width);

				// Scales
			};

		// Redraw bind
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});

app.directive('chartDataStackedbars', function() {

	function chartDataStackedbars_link(scope, element, attributes) {

		// Compute data
		var data = [];
		scope.ids.forEach(function(id, index, array) {
			data.push({
				cycles: scope.data[id].stats.cycles,
				running: scope.data[id].stats.cyclesRunning,
				ready: scope.data[id].stats.cyclesReady
			});
		});


		// Vars - layout
		var color = d3.scale.category20();
		var container = element[0];
		var layout = {
			margin: { top: 20, right: 20, bottom: 30, left: 60},
			boxes: { width: 10, padding: 2 }
		}
		layout.width = layout.boxes.width * scope.ids.length + layout.boxes.padding;
		layout.height = container.clientHeight;

		// Vars - paint
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});

		// Vars - scales
		var scaleY = d3.scale.linear().rangeRound([layout.height, 0]);


		// Map our columns to our colors
		color.domain(d3.keys(data[0]).filter(function (key) {
			return key !== "label";
		}));

		data.forEach(function (d) {
			var y0 = 0;
			d.types = color.domain().map(function (name) {
				return {
					name: name,
					y0: y0,
					y1: y0 += +d[name]
				};
			});
			d.total = d.types[d.types.length - 1].y1;
		});

		// Our Y domain is from zero to our highest total
		scaleY.domain([0, d3.max(data, function (d) {
			return d.total;
		})]);


		// Draw rectanges
		// Draw rectanges - X axis
		var boxes = svg.selectAll(".label")
				.data(data).enter()
				.append("g")
					.attr("transform", function (d, i) {
						return "translate(" + (i * (layout.boxes.width + layout.boxes.padding)) + ", 0)";
					});

		// Draw rectanges - Y axis
		boxes.selectAll("rect")
			.data(function (d) {
				return d.types;
			}).enter()
			.append("rect")
				.attr("width", layout.boxes.width)
				.attr("y", function (d) {
					return scaleY(d.y1);
				})
				.attr("height", function (d) {
					return scaleY(d.y0) - scaleY(d.y1);
				})
				.style("fill", function (d) {
					return color(d.name);
				});

		// Redraw
		/*
		var repaint = function repaint() {
				console.log("repaint");

				// Sizes
				height = container.clientHeight;
				graphHeight = height - layout.margin.top - layout.margin.bottom;

				// SVG
				svg.attr('height', height);
				console.log('width: ' + svg.attr('width') + ', height: ' + svg.attr('height'));

				// Scales
				scaleY.rangeRound([height, 0]);
			};
		// repaint();

		// Redraw bind
		scope.$watch(function() { return container.clientHeight * container.clientWidth; }, repaint);
		*/
	};


	return {
		link: chartDataStackedbars_link,
		restrict: 'E'
	}
});


/*
app.directive('chartDataGeneric', function() {

	function link(scope, element, attributes) {
		// Build data
		var data = [];
		for (var i = 0; i < scope.profiles.length; i++) {
			data.push({
				label: scope.profiles[i].label,
				cycles: scope.data[scope.profiles[0].id].stats.cycles,
				running: scope.data[scope.profiles[0].id].stats.cyclesRunning,
				ready: scope.data[scope.profiles[0].id].stats.cyclesReady
			});
			data.push({
				label: 'Fake',
				cycles: scope.data[scope.profiles[0].id].stats.cycles * 0.9,
				running: scope.data[scope.profiles[0].id].stats.cyclesRunning  * 1000,
				ready: scope.data[scope.profiles[0].id].stats.cyclesReady * 0.7
			});
		};
		console.log(data);

		// Vars - layout
		var width, height, graphWidth, graphHeight, minSize;
		var color = d3.scale.category10();
		var el = element[0];
		var layout = {
			margin: { top: 20, right: 20, bottom: 30, left: 60}
		}

		// Vars - paint
		var pie = d3.layout.pie().sort(null);
		var arc = d3.svg.arc();
		var svg = d3.select(el).append('svg')
				//.style("background", "red");
		var g = svg.append('g');




// Set our margins
var margin = {
	top: 20,
	right: 20,
	bottom: 30,
	left: 60
},
width = 250 - margin.left - margin.right,
    height = el.clientHeight - margin.top - margin.bottom;

    	// Scales
    	var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    	var y = d3.scale.linear().rangeRound([height, 0]);

    	// Axis
    	var xAxis = d3.svg.axis()
    		.scale(x)
    		.orient("bottom");
    	var yAxis = d3.svg.axis()
    		.scale(y)
    		.orient("left");
    		//.tickFormat(d3.format(".2s"));

    	// Map our columns to our colors
    	color.domain(d3.keys(data[0]).filter(function (key) {
    		return key !== "label";
    	}));

    	data.forEach(function (d) {
    		var y0 = 0;
    		d.types = color.domain().map(function (name) {
    			return {
    				name: name,
    				y0: y0,
    				y1: y0 += +d[name]
    			};
    		});
    		d.total = d.types[d.types.length - 1].y1;
    	});

    	// Our X domain is our set of years
    	x.domain(data.map(function (d) {
    		return d.label;
    	}));

    	// Our Y domain is from zero to our highest total
    	y.domain([0, d3.max(data, function (d) {
    		return d.total;
    	})]);


		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);



// Now we actually generate rectangles for all of our data values:

var label = svg.selectAll(".label")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function (d) {
    return "translate(" + x(d.label) + ",0)";
});

label.selectAll("rect")
    .data(function (d) {
    return d.types;
})
    .enter().append("rect")
    .attr("width", x.rangeBand())
    .attr("y", function (d) {
    return y(d.y1);
})
    .attr("height", function (d) {
    return y(d.y0) - y(d.y1);
})
    .style("fill", function (d) {
    return color(d.name);
});

// Finally, we add a legend:

var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
    return "translate(0," + i * 20 + ")";
});

legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
    return d;
});



		// Redraw
		var repaint = function repaint() {
				// Sizes
				height = el.clientHeight;
				width = el.clientWidth;
				graphHeight = height - layout.margin.top - layout.margin.bottom;
				graphWidth = 250 - layout.margin.left - layout.margin.right,

				// SVG
				svg.attr({width: width, height: height});
				g.attr('transform', 'translate(' + layout.margin.left + "," + layout.margin.top + ')');

				// Scales
				x.rangeRoundBands([0, graphWidth], .1);
				y.rangeRound([graphHeight, 0]);
			};
		repaint();

		// Redraw bind
		scope.$watch(function() { return el.clientHeight * el.clientWidth; }, repaint);

	};


	return {
		link: link,
		restrict: 'E'
	}
});

*/

/*

app.directive('chartGeneric', function() {

	function link(scope, element, attributes) {
		// Build data
		var data = [
				scope.data[scope.profiles[0].id].stats.cycles,
				scope.data[scope.profiles[0].id].stats.cyclesRunning,
				scope.data[scope.profiles[0].id].stats.cyclesReady
			];
		console.log(data);

		// Vars - layout
		var width, height, minSize;
		var color = d3.scale.category10()
		var el = element[0];

		// Vars - paint
		var pie = d3.layout.pie().sort(null);
		var arc = d3.svg.arc();
		var svg = d3.select(el).append('svg');
		var g = svg.append('g');

		// add the <path>s for each arc slice
		var arcs = g.selectAll('path').data(pie(data))
			.enter().append('path')
				.style('stroke', 'white')
				.attr('fill', function(d, i){ return color(i) });

		// Redraw
		var repaint = function repaint() {
				height = el.clientHeight;
				width = el.clientWidth;
				minSize = Math.min(width, height);
				arc.outerRadius(minSize / 2 * 0.9).innerRadius(minSize / 2 * 0.5);
				svg.attr({width: width, height: height});
				g.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
				arcs.attr('d', arc);
			}
		repaint();

		// Redraw bind
		scope.$watch(function() { return el.clientHeight * el.clientWidth; }, repaint);
	}

	return {
		link: link,
		restrict: 'E'
	}
});
*/