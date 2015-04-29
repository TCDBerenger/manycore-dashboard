app.directive('chartThreadDivergence', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartThreadDivergence ==");

		// Layout
		var container = element[0];
		var layout = {
			margin: { top: 10, right: 10, bottom: 20, left: 20},
			height:	container.clientHeight,
			width:	container.clientWidth,
			graph:	{
				width:	function() { return Math.max(1, container.clientWidth - layout.margin.left - layout.margin.right); },
				height:	function() { return Math.max(1, container.clientHeight - layout.margin.top - layout.margin.bottom); },
				top:	function() { return layout.margin.top; },
				right:	function() { return Math.max(1, container.clientWidth - layout.margin.right); },
				bottom:	function() { return Math.max(1, container.clientHeight - layout.margin.bottom); },
				left:	function() { return layout.margin.left; }
			}
		};

		// Data
		var data = scope.data[attrs.profileid];
		var timeStart = +attrs.timestart;			// When the user selection starts
		var timeEnd = +attrs.timeend;				// When the user selection ends (could be before or after timeMax)
		var timeMax = data.stats.duration;
		var numberCores = data.stats.availableCores;
		var dataValueMax = Math.max(numberCores * 2, data.stats.threadsMax);
		// var dataValueMax = Math.max(d3.max(data.cycles.cycles), d3.max(data.cycles.running), d3.max(data.cycles.ready));

		// Fix column layout
		var lastElement = angular.copy(data.states[data.states.length - 1], {});
		lastElement.t = timeMax;
		data.states.push(lastElement);

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.left(), layout.graph.right()]);
		var scaleY = d3.scale.linear().rangeRound([layout.graph.bottom(), layout.graph.top()]);

		// Scales - domains
		scaleY.domain([0, dataValueMax]);
		scaleX.domain([timeStart, timeEnd]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);
		var yAxis = d3.svg.axis().scale(scaleY).orient("left");


		// Draw
		var scaleYNumberCore = scaleY(numberCores);
		var interpolationMethod = "step-after";

		// Draw - core area
		var coreElement = svg.append("rect")
				.attr("width", scaleX(timeMax) - scaleX(timeStart)) // 🕒 repaintable
				.attr("height", scaleY(0) - scaleYNumberCore)
				.attr("x", scaleX(timeStart))
				.attr("y", scaleYNumberCore)
				.style("fill", "rgba(70, 130, 180, .5)")
				.style("fill", "#9ED3FF");

		// Draw - ready
		var readyGroup = svg.append("g").attr("class", "dataset");
		var readyAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(Math.max(numberCores, d.c)); })
				.y1(function(d) { return scaleY(d.rea + Math.max(numberCores, d.c)); })
				.interpolate(interpolationMethod);
		var readyArea = readyGroup.append("path")
				.attr("d", readyAreaFunction(data.states)) // 🕒 repaintable
				.attr("fill", "#D28A8D");

		var readyLineFunction = d3.svg.line()
				.x(function(d) { return scaleX(d.t); })
				.y(function(d) { return scaleY(d.rea + Math.max(numberCores, d.c)); })
				.interpolate(interpolationMethod);
		var readyLine = readyGroup.append("path")
				.attr("stroke", "#B4464B")
				.attr("stroke-width", 2)
				.attr("fill", "none");

		// Draw - running
		var runningGroup = svg.append("g").attr("class", "dataset");
		var runningAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(layout.graph.bottom)
				.y1(function(d) { return scaleY(d.c); })
				.interpolate(interpolationMethod);
		var runningArea = runningGroup.append("path")
				.attr("d", runningAreaFunction(data.states)) // 🕒 repaintable
				.attr("fill", "#8DD28A");
		var runningLineFunction = d3.svg.line()
				.x(function(d) { return scaleX(d.t); })
				.y(function(d) { return scaleY(d.c); })
				.interpolate(interpolationMethod);
		var runningLine = runningGroup.append("path")
				.attr("stroke", "#4BB446")
				.attr("stroke-width", 2)
				.attr("fill", "none");
		
		// Draw - core line
		var coreLine = svg.append("line")
				.attr("class", "line")
				.attr("x1", scaleX(timeStart)).attr("x2", scaleX(timeMax)) // 🕒 repaintable
				.attr("y1", scaleYNumberCore).attr("y2", scaleYNumberCore)
				.attr('stroke', '#4682B4')
				.attr('stroke-width', 4)
				.attr('stroke-dasharray', 5.5)
				.attr('fill', 'none');

		// Draw - axis
		var axisXGroup = svg.append("g")
				.attr("class", "xAxis")
				.attr("transform", "translate(0," + layout.graph.bottom() + ")")
				.call(xAxis);
		var axisYGroup = svg.append("g")
				.attr("class", "xAxis")
				.attr("transform", "translate(" + layout.graph.left() + ",0)")
				.call(yAxis);

		// Redraw
		var repaint = function repaint() {
				// Sizes
				layout.width = container.clientWidth;

				// Scales
				scaleX.rangeRound([layout.graph.left(), layout.graph.right()]);
				scaleXStep = scaleX(data.stats.timeStep);

				// SVG
				svg.attr('width', layout.width);
				axisXGroup.call(xAxis);
				coreElement.attr("width", scaleX(timeMax) - scaleX(timeStart));
				coreLine.attr("x1", scaleX(timeStart)).attr("x2", scaleX(timeMax));
				runningArea.attr("d", runningAreaFunction(data.states));
				readyArea.attr("d", readyAreaFunction(data.states));
				readyLine.attr("d", readyLineFunction(data.states));
				runningLine.attr("d", runningLineFunction(data.states));
			};

		// Redraw - bind
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});

app.directive('chartStats', function() {

	function chartDataStackedbars_link(scope, element, attrs, controller) {
		console.log("== directive == chartStats ==");

		// Data - set
		var ids = scope.ids;
		var set = scope.chartSets[attrs.set];

		// Data - Copy
		var data = [];
		var dataValueSumMax = 0;
		var dataElement, dataPreviousValue, dataValueSum;
		ids.forEach(function(id) {
			dataElement = [];
			dataValueSum = 0;
			dataPreviousValue = 0;
			set.forEach(function(element) {
				dataValueSum += scope.data[id].stats[element.cat][element.attr];
				dataElement.push({
					attr: element.attr,
					previous: dataPreviousValue,
					value: scope.data[id].stats[element.cat][element.attr]
				});
				dataPreviousValue += scope.data[id].stats[element.cat][element.attr];
			});
			dataValueSumMax = Math.max(dataValueSum, dataValueSumMax);
			data.push(dataElement);
		});


		// Vars - layout
		var color = d3.scale.category20();
		var container = element[0];
		var layout = {
			boxes: { width: 10, padding: 2 },
			lineHeight: 33
		};
		layout.width = layout.boxes.width * ids.length + layout.boxes.padding;
		layout.height = layout.lineHeight * set.length;

		// Vars - paint
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});

		// Vars - scales
		var scaleY = d3.scale.linear()
				.rangeRound([0, layout.height])
				.domain([0, dataValueSumMax]);


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
				return d;
			}).enter()
			.append("rect")
				.attr("width", layout.boxes.width)
				.attr("y", function (d) {
					return layout.height - scaleY(d.previous) - scaleY(d.value);
				})
				.attr("height", function (d) {
					return scaleY(d.value);
				})
				.style("fill", function (d, i, j) {
					return set[i].color;
				});
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
				cycles: scope.data[scope.profiles[0].id].stats.cycles.cycles,
				running: scope.data[scope.profiles[0].id].stats.cycles.running,
				ready: scope.data[scope.profiles[0].id].stats.cycles.ready
			});
			data.push({
				label: 'Fake',
				cycles: scope.data[scope.profiles[0].id].stats.cycles.cycles * 0.9,
				running: scope.data[scope.profiles[0].id].stats.cycles.running  * 1000,
				ready: scope.data[scope.profiles[0].id].stats.cycles.ready * 0.7
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
				scope.data[scope.profiles[0].id].stats.cycles.cycles,
				scope.data[scope.profiles[0].id].stats.cycles.running,
				scope.data[scope.profiles[0].id].stats.cycles.ready
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