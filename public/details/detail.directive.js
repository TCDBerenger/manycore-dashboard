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