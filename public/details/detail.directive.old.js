app.directive('chartThreadDivergenceWithRealData', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartThreadDivergence ==");

		// Layout
		var container = element[0];
		var layout = {
			margin: { top: 10, right: 10, bottom: 20, left: 40},
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
		var profile = scope.profiles[0];
		var timeStart = +attrs.timestart;			// When the user selection starts
		var timeEnd = +attrs.timeend;				// When the user selection ends (could be before or after timeMax)
		var timeMax = data.info.duration;
		var numberCores = data.info.cores;
		var dataValueMax = numberCores * data.info.timeStep;

		// Fix column layout
		var lastElement = angular.copy(data.times[data.times.length - 1], {});
		lastElement.t = timeMax;
		data.times.push(lastElement);

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.left(), layout.graph.right()]);
		var scaleY = d3.scale.linear().rangeRound([layout.graph.bottom(), layout.graph.top()]);

		// Scales - domains
		scaleY.domain([0, 2 * dataValueMax]);
		scaleX.domain([timeStart, timeEnd]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);
		var yAxis = d3.svg.axis().scale(scaleY).orient("left");


		// Draw
		var scaleYCoreCapacity = scaleY(dataValueMax);
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
				.y0(function(d) { return scaleY(dataValueMax); })
				.y1(function(d) { return scaleY(dataValueMax + d.ys); })
				.interpolate(interpolationMethod);
		var readyArea = readyGroup.append("path")
				.attr("d", readyAreaFunction(data.times)) // 🕒 repaintable
				.attr("fill", "#D28A8D");
		var readyLineFunction = d3.svg.line()
				.x(function(d) { return scaleX(d.t); })
				.y(function(d) { return scaleY(dataValueMax + d.ys); })
				.interpolate(interpolationMethod);
		var readyLine = readyGroup.append("path")
				.attr("stroke", "#B4464B")
				.attr("stroke-width", 2)
				.attr("fill", "none");

		// Draw - running
		var runningGroup = svg.append("g").attr("class", "dataset");
		var runningAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(dataValueMax - d.r); })
				.y1(scaleYCoreCapacity)
				.interpolate(interpolationMethod);
		var runningArea = runningGroup.append("path")
				.attr("d", runningAreaFunction(data.times)) // 🕒 repaintable
				.attr("fill", "#8DD28A");
		var runningLineFunction = d3.svg.line()
				.x(function(d) { return scaleX(d.t); })
				.y(function(d) { return scaleY(dataValueMax - d.r); })
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
				scaleXStep = scaleX(data.info.timeStep);

				// SVG
				svg.attr('width', layout.width);
				axisXGroup.call(xAxis);
				coreElement.attr("width", scaleX(timeMax) - scaleX(timeStart));
				coreLine.attr("x1", scaleX(timeStart)).attr("x2", scaleX(timeMax));
				readyArea.attr("d", readyAreaFunction(data.times));
				readyLine.attr("d", readyLineFunction(data.times));
				runningArea.attr("d", runningAreaFunction(data.times));
				runningLine.attr("d", runningLineFunction(data.times));
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
		var dataList = data[scope.widget.deck[0].cat].list;
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
		var dataList = data[scope.widget.deck[0].cat].frames;
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


app.directive('chartHistoband', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartHistoband ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Non repaintable layout
		var preferedHeight = 80;
		layout.height = preferedHeight;
		layout.margin.top = 0;

		// Attributes
		var deck = scope.widget.deck.axis;
		var meta = new genericMeta(attrs);
		meta.halfLimit = true;

		// Data
		var profileID = +attrs.profileid;
		var profileIndex = scope.ids.indexOf(profileID);
		var data = scope.data[profileID];
		var dataList = data[scope.widget.deck.data[0].cat].list;
		var title = scope.profiles[profileIndex].label;
		var timeMax = data.info.duration;
		var valueMax = meta.max / meta.focus;

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.left(), layout.graph.right()]);
		var scaleV = d3.scale.linear();

		// Scales - domains
		scaleX.domain([meta.begin, meta.end]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);

		// Draw
		var tickGroup = svg.append("g").attr("class", "dataset");
		if (meta.halfLimit)
			var limitGroup = svg.append("g").attr("class", "limit");

		
		// Draw - limit
		if (meta.halfLimit) {
				var halfLimitLine = limitGroup.append("line")
						.attr("class", "line")
						.attr('stroke', deck.limit.color)
						.attr('stroke-width', 1)
						.attr('stroke-dasharray', 5.5)
						.attr('fill', 'none');
				var halfLimitText = limitGroup.append("text")
						.attr("x", layout.graph.left() - 2)
						.attr("text-anchor", "end")
						.attr("alignment-baseline", "middle")
						.attr("font-size", "10px")
						.text((100 / meta.focus / 2) + ' %');
		}

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
			.text(title);

		// Redraw
		var repaint = function repaint() {
				// Sizes
				layout.height = preferedHeight;
				layout.width = container.clientWidth;

				// Scales
				scaleX.rangeRound([layout.graph.left(), layout.graph.right()]);
				scaleV.rangeRound([layout.graph.bottom(), layout.graph.top()]);

				// Overflow
				var higherV = layout.graph.top();

				// Container
				d3.select(container).style('height', layout.height + 'px');

				// SVG
				svg.attr({width: layout.width, height: layout.height});
				axisXGroup
					.attr("transform", "translate(0," + layout.graph.bottom() + ")")
					.call(xAxis);
				labelElement
					.attr("x", layout.graph.right())
					.attr("y", layout.graph.bottom());

				// Scales
				var xLength = layout.graph.width();
				var tLength = (meta.end - meta.begin) / xLength;		// a pixel equals (tLength) ms
				var eLength = dataList.length;
				var valueMaxByPixel = valueMax * tLength;
				scaleV.domain([0, valueMaxByPixel]);				// a pixel could display (valueMax * tLength) maximum switches

				// Limits
				if (meta.halfLimit) {
					limitGroup.attr("transform", null);
					halfLimitLine
						.attr("x1", layout.graph.left())
						.attr("x2", layout.graph.right())
						.attr("y1", scaleV(valueMaxByPixel / 2))
						.attr("y2", scaleV(valueMaxByPixel / 2));
					halfLimitText
						.attr("y", scaleV(valueMaxByPixel / 2));
				}

				// Ticks
				tickGroup.selectAll("*").remove();
				tickGroup.attr("transform", null);
				var e_index = 0;									// TODO find the first index
				var e, e_count;
				var vZero = scaleV(0);
				var xLeft = layout.graph.left() + 1;
				for (var x = 0; x < xLength; x++) {

					// Count the relative event in the "pixel" frame time
					e_count = 0;
					if (e_index < eLength) {
						e = dataList[e_index];
						while (e_index < eLength && e < tLength * (x + 1)) {
							e_index++;
							e_count++;
							e = dataList[e_index];
						}
					}

					tickGroup.append("line")
						.attr("class", "tick")
						.attr("x1", xLeft + x).attr("x2", xLeft + x)
						.attr("y1", vZero).attr("y2", scaleV(e_count))
						.attr('stroke', deck.x.color)
						.attr('stroke-width', 1)
						.attr('fill', 'none');

					// Check overflox
					higherV = Math.min(higherV, scaleV(e_count));
				};

				// Treat overflow
				if (meta.autoscale && higherV < layout.graph.top()) {
					var yOverflow = layout.graph.top() - higherV;
					console.log("need to repaint with overflow", yOverflow);

					// Layout
					layout.height += yOverflow;

					// Container
					d3.select(container).style('height', layout.height + 'px');

					// SVG
					svg.attr('height', layout.height);
					axisXGroup.attr("transform", "translate(0," + layout.graph.bottom() + ")");
					tickGroup.attr("transform", "translate(0," + yOverflow + ")");
					labelElement.attr("y", layout.graph.bottom());

					// Limits
					if (meta.halfLimit) {
						limitGroup.attr("transform", "translate(0," + yOverflow + ")");
					}
				}

			};

		// Redraw - bind
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});

app.directive('chartColoroband', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartColoroband ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Non repaintable layout
		layout.height = 40;
		layout.margin.top = 0;

		// Attributes
		var deck = scope.widget.deck.axis;
		var meta = new genericMeta(attrs);

		// Data
		var profileID = +attrs.profileid;
		var profileIndex = scope.ids.indexOf(profileID);
		var data = scope.data[profileID];
		var dataList = data[scope.widget.deck.data[0].cat].list;
		var title = scope.profiles[profileIndex].label;
		var timeMax = data.info.duration;
		var valueMax = meta.max / meta.focus;
		var maxColorIndex = deck.x.colors.length - 1;

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.left(), layout.graph.right()]);
		var scaleV = d3.scale.linear();

		// Scales - domains
		scaleX.domain([meta.begin, meta.end]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);

		// Draw
		var tickGroup = svg.append("g").attr("class", "dataset");

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
			.text(title);

		// Redraw
		var repaint = function repaint() {
				// Sizes
				layout.width = container.clientWidth;

				// Scales
				scaleX.rangeRound([layout.graph.left(), layout.graph.right()]);
				scaleV.rangeRound([layout.graph.bottom(), layout.graph.top()]);

				// Container
				d3.select(container).style('height', layout.height + 'px');

				// SVG
				svg.attr({width: layout.width, height: layout.height});
				axisXGroup
					.attr("transform", "translate(0," + layout.graph.bottom() + ")")
					.call(xAxis);
				labelElement
					.attr("x", layout.graph.right())
					.attr("y", layout.graph.bottom());

				// Scales
				var xLength = layout.graph.width();
				var tLength = (meta.end - meta.begin) / xLength;		// a pixel equals (tLength) ms
				var eLength = dataList.length;
				var valueMaxByPixel = valueMax * tLength;
				var valueMaxByPixelByColor = valueMaxByPixel / 2;
				scaleV.domain([0, valueMaxByPixelByColor]);			// a pixel could display (valueMax * tLength / 2) maximum switches by colour (for targeting 4 colours)

				// Ticks
				tickGroup.selectAll("*").remove();
				tickGroup.attr("transform", null);
				var e_index = 0;									// TODO find the first index
				var e, e_count, e_color_index, e_color;
				var vZero = scaleV(0);
				var vMaxColor = scaleV(valueMaxByPixelByColor);
				var xLeft = layout.graph.left() + 1;
				for (var x = 0; x < xLength; x++) {

					// Count the relative event in the "pixel" frame time
					e_count = 0;
					if (e_index < eLength) {
						e = dataList[e_index];
						while (e_index < eLength && e < tLength * (x + 1)) {
							e_index++;
							e_count++;
							e = dataList[e_index];
						}
					}

					e_color_index = Math.min(maxColorIndex, Math.floor(e_count / valueMaxByPixelByColor));
					e_count = e_count - e_color_index * valueMaxByPixelByColor;
					e_color = deck.x.colors[e_color_index];

					tickGroup.append("line")
						.attr("class", "tick")
						.attr("x1", xLeft + x).attr("x2", xLeft + x)
						.attr("y1", vZero).attr("y2", scaleV(e_count))
						.attr('stroke', e_color)
						.attr('stroke-width', 1)
						.attr('fill', 'none');

					tickGroup.append("line")
						.attr("class", "tick")
						.attr("x1", xLeft + x).attr("x2", xLeft + x)
						.attr("y1", scaleV(e_count)).attr("y2", vMaxColor)
						.attr('stroke', deck.x.colors[e_color_index - 1])
						.attr('stroke-width', 1)
						.attr('fill', 'none');
				};
			};

		// Redraw - bind
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});