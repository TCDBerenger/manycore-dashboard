var genericLayout = function() {
	this.margin	= { top: 10, right: 10, bottom: 20, left: 20 };
	this.height	= 0;
	this.width	= 0;
	this.graph	= {
		layout:	this,
		width: 	function() { return this.layout.width - this.layout.margin.left - this.layout.margin.right; },
		height: function() { return this.layout.height - this.layout.margin.top - this.layout.margin.bottom; },
		top: 	function() { return this.layout.margin.top; },
		right: 	function() { return this.layout.width - this.layout.margin.right; },
		bottom: function() { return this.layout.height - this.layout.margin.bottom; },
		left: 	function() { return this.layout.margin.left; }
	};
};

app.directive('chartBandTick', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartBandTick ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Non repaintable layout
		layout.height = 40;
		layout.margin.top = 0;

		// Data
		var data = scope.data[attrs.profileid];
		var dataList = data.migrations.list;
		var timeStart = +attrs.timestart;			// When the user selection starts
		var timeEnd = +attrs.timeend;				// When the user selection ends (could be before or after timeMax)
		var timeMax = data.info.duration;

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.left(), layout.graph.right()]);

		// Scales - domains
		scaleX.domain([timeStart, timeEnd]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);

		// Draw - ticks
		var tickGroup = svg.append("g").attr("class", "dataset");
		var tickXFunction = function(d) {
			if (isFinite(d)) {
				return scaleX(d);
			} else {
				return scaleX(d.t);
			}
		};
		var tickLines = [];
		dataList.forEach(function(m) {
			tickLines.push(
				tickGroup.append("line")
					.attr("class", "tick")
					.attr("x1", 0).attr("x2", 0) // 🕒 repaintable
					.attr("y1", layout.graph.top()).attr("y2", layout.graph.bottom())
					.attr('stroke', '#797979')
					.attr('stroke-opacity', '0.5')
					.attr('stroke-width', 1)
					.attr('fill', 'none')
				);
		});


		// Draw - axis
		var axisXGroup = svg.append("g")
				.attr("class", "xAxis")
				.attr("transform", "translate(0," + layout.graph.bottom() + ")")
				.call(xAxis);

		// Draw - text
		var labelElement = svg.append("text")
			.attr("x", layout.graph.right())
			.attr("y", layout.graph.bottom())
			.attr("text-anchor", "end")
			.attr("font-size", "14px")
			.text(attrs.title);

		// Redraw
		var repaint = function repaint() {
				// Sizes
				layout.width = container.clientWidth;

				// Scales
				scaleX.rangeRound([layout.graph.left(), layout.graph.right()]);

				// SVG
				svg.attr('width', layout.width);
				tickLines.forEach(function(tick, i) {
					tick.attr("x1", tickXFunction(dataList[i])).attr("x2", tickXFunction(dataList[i]));
				})
				axisXGroup.call(xAxis);
				labelElement.attr("x", layout.graph.right());
			};

		// Redraw - bind
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});

app.directive('chartBandDensity', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartBandTick ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Non repaintable layout
		layout.height = 40;
		layout.margin.top = 0;

		// Data
		var data = scope.data[attrs.profileid];
		var dataList = data.switches;
		var timeStart = +attrs.timestart;			// When the user selection starts
		var timeEnd = +attrs.timeend;				// When the user selection ends (could be before or after timeMax)
		var timeMax = data.info.duration;
		var timeStep = data.info.timeStep;
		var scaleVPrecision = 1000;

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.left(), layout.graph.right()]);
		var scaleV = d3.scale.linear().rangeRound([0, scaleVPrecision]);

		// Scales - domains
		scaleX.domain([timeStart, timeEnd]);
		scaleV.domain([0, 300]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);

		// Draw
		var xBoxWidth = 0;

		// Draw - ticks
		var densityGroup = svg.append("g").attr("class", "dataset");
		var densityXFunction = function(d) {
			return scaleX(d.t);
		};
		var densityVFunction = function(d) {
			return scaleV(d.s | 0) / scaleVPrecision;
		};
		var densityBoxes = [];
		dataList.forEach(function(s) {
			densityBoxes.push(
				densityGroup.append("rect")
					.attr("width", xBoxWidth) // 🕒 repaintable
					.attr("height", layout.graph.height())
					.attr("x", densityXFunction(s)) // 🕒 repaintable
					.attr("y", layout.graph.top())
					.attr("fill", "#797979")
					.attr("fill-opacity", densityVFunction(s))
				);
		});


		// Draw - axis
		var axisXGroup = svg.append("g")
				.attr("class", "xAxis")
				.attr("transform", "translate(0," + layout.graph.bottom() + ")")
				.call(xAxis);

		// Draw - text
		var labelElement = svg.append("text")
			.attr("x", layout.graph.right())
			.attr("y", layout.graph.bottom())
			.attr("text-anchor", "end")
			.attr("font-size", "14px")
			.text(attrs.title);

		// Redraw
		var repaint = function repaint() {
				// Sizes
				layout.width = container.clientWidth;

				// Scales
				scaleX.rangeRound([layout.graph.left(), layout.graph.right()]);
				xBoxWidth = scaleX(data.info.timeStep) - scaleX(0);

				// SVG
				svg.attr('width', layout.width);
				densityBoxes.forEach(function(box, i) {
					box.attr("x", densityXFunction(dataList[i]))
						.attr("width", xBoxWidth)
						.attr("fill-opacity", densityVFunction(dataList[i]))
				})
				axisXGroup.call(xAxis);
				labelElement.attr("x", layout.graph.right());
			};

		// Redraw - bind
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});

app.directive('chartThreadDivergence', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartThreadDivergence ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Non repaintable layout
		layout.height = container.clientHeight;

		var layout = {
			margin: { top: 10, right: 10, bottom: 20, left: 20},
			height:	container.clientHeight,
			width:	container.clientWidth,
			graph:	{
				width:	function() { return Math.max(1, layout.width - layout.margin.left - layout.margin.right); },
				height:	function() { return Math.max(1, layout.height - layout.margin.top - layout.margin.bottom); },
				top:	function() { return layout.margin.top; },
				right:	function() { return Math.max(1, layout.width - layout.margin.right); },
				bottom:	function() { return Math.max(1, layout.height - layout.margin.bottom); },
				left:	function() { return layout.margin.left; }
			}
		};

		// Data
		var data = scope.data[attrs.profileid];
		var timeStart = +attrs.timestart;			// When the user selection starts
		var timeEnd = +attrs.timeend;				// When the user selection ends (could be before or after timeMax)
		var timeMax = data.info.duration;
		var numberCores = data.info.cores;
		var dataValueMax = Math.max(numberCores * 2, data.info.threadCount);

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
		var scaleYCoreCapacity = scaleY(numberCores);
		var interpolationMethod = "step-after";

		// Draw - core area
		var coreElement = svg.append("rect")
				.attr("width", scaleX(timeMax) - scaleX(timeStart)) // 🕒 repaintable
				.attr("height", scaleY(0) - scaleYCoreCapacity)
				.attr("x", scaleX(timeStart))
				.attr("y", scaleYCoreCapacity)
				.style("fill", "rgba(70, 130, 180, .5)")
				.style("fill", "#9ED3FF");

		// Draw - ready
		var readyGroup = svg.append("g").attr("class", "dataset");
		var readyAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(Math.max(numberCores, d.r)); })
				.y1(function(d) { return scaleY(d.ys + Math.max(numberCores, d.r)); })
				.interpolate(interpolationMethod);
		var readyArea = readyGroup.append("path")
				.attr("d", readyAreaFunction(data.states)) // 🕒 repaintable
				.attr("fill", "#D28A8D");
		var readyLineFunction = d3.svg.line()
				.x(function(d) { return scaleX(d.t); })
				.y(function(d) { return scaleY(d.ys + Math.max(numberCores, d.r)); })
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
				.y1(function(d) { return scaleY(d.r); })
				.interpolate(interpolationMethod);
		var runningArea = runningGroup.append("path")
				.attr("d", runningAreaFunction(data.states)) // 🕒 repaintable
				.attr("fill", "#8DD28A");
		var runningLineFunction = d3.svg.line()
				.x(function(d) { return scaleX(d.t); })
				.y(function(d) { return scaleY(d.r); })
				.interpolate(interpolationMethod);
		var runningLine = runningGroup.append("path")
				.attr("stroke", "#4BB446")
				.attr("stroke-width", 2)
				.attr("fill", "none");
		
		// Draw - core line
		var coreLine = svg.append("line")
				.attr("class", "line")
				.attr("x1", scaleX(timeStart)).attr("x2", scaleX(timeMax)) // 🕒 repaintable
				.attr("y1", scaleYCoreCapacity).attr("y2", scaleYCoreCapacity)
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

		// Draw - text
		var labelElement = svg.append("text")
			.attr("x", layout.graph.right)
			.attr("y", layout.graph.top() + 30)
			.attr("text-anchor", "end")
			.attr("font-size", "14px")
			.text(attrs.title);

		// Redraw
		var repaint = function repaint() {
				// Sizes
				layout.width = container.clientWidth;

				// Scales
				scaleX.rangeRound([layout.graph.left(), layout.graph.right()]);

				// SVG
				svg.attr('width', layout.width);
				axisXGroup.call(xAxis);
				coreElement.attr("width", scaleX(timeMax) - scaleX(timeStart));
				coreLine.attr("x1", scaleX(timeStart)).attr("x2", scaleX(timeMax));
				runningArea.attr("d", runningAreaFunction(data.states));
				readyArea.attr("d", readyAreaFunction(data.states));
				readyLine.attr("d", readyLineFunction(data.states));
				runningLine.attr("d", runningLineFunction(data.states));
				labelElement.attr("x", layout.graph.right);
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