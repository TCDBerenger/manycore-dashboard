var genericLayout = function() {
	this.margin		= { top: 10, right: 10, bottom: 20, left: 20 };
	this.height		= 0;
	this.width		= 0;
	this.graph		= {
		layout:	this,
		width: 	function() { return this.layout.width - this.layout.margin.left - this.layout.margin.right; },
		height: function() { return this.layout.height - this.layout.margin.top - this.layout.margin.bottom; },
		top: 	function() { return this.layout.margin.top; },
		right: 	function() { return this.layout.width - this.layout.margin.right; },
		bottom: function() { return this.layout.height - this.layout.margin.bottom; },
		left: 	function() { return this.layout.margin.left; }
	};
};

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
		var deck = scope.widget.deck;
		var meta = {
			autoscale:	(attrs.autoscale === 'true' || attrs.autoscale === 'yes' || attrs.autoscale === '' || attrs.autoscale === 'autoscale'),
			graduate:	(attrs.graduate) ? +attrs.graduate : 1,		// Divide the value with graduate color
			begin:		+attrs.begin,								// When the user selection starts
			end:		+attrs.end,									// When the user selection ends (could be before or after timeMax)
			max:		(attrs.max) ? +attrs.max : NaN,				// Maximum possible value (cf. focus for divide this value)
			focus:		(attrs.focus) ? +attrs.focus : 1,			// Focusing data (divide factor)
			halfLimit:	(attrs.graduate) ? +attrs.graduate == 1 : true,
		}

		// Hack for color band
		if (meta.graduate > 1) {
			preferedHeight = preferedHeight / 2;
			layout.height = preferedHeight;
		}

		// Data
		var profileID = +attrs.profileid;
		var profileIndex = scope.ids.indexOf(profileID);
		var data = scope.data[profileID];
		var dataList = data[deck[0].cat].list;
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
						.attr('stroke', '#000000')
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
				var valueMaxPixel = valueMax * tLength;
				scaleV.domain([0, valueMaxPixel]);				// a pixel could display (valueMax * tLength) maximum switches

				// Limits
				if (meta.halfLimit) {
					limitGroup.attr("transform", null);
					halfLimitLine
						.attr("x1", layout.graph.left())
						.attr("x2", layout.graph.right())
						.attr("y1", scaleV(valueMaxPixel / 2))
						.attr("y2", scaleV(valueMaxPixel / 2));
					halfLimitText
						.attr("y", scaleV(valueMaxPixel / 2));
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
						.attr('stroke', '#797979')
						.attr('stroke-width', 1)
						.attr('fill', 'none');

					// Check overflox
					higherV = Math.min(higherV, scaleV(e_count));
				};

				// Treat overflow
				if (meta.autoscale && higherV < layout.graph.top()) {
					var yOverflow = layout.graph.top() - higherV;
					console.log("need to repaint", yOverflow);

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

app.directive('chartThreadLifetime', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartThreadLifetime ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Non repaintable layout
		layout.margin.top = 0;

		// Data
		var data = scope.data[attrs.profileid];
		var dataList = data.lifetimes.list
		var timeStart = +attrs.timestart;			// When the user selection starts
		var timeEnd = +attrs.timeend;				// When the user selection ends (could be before or after timeMax)
		var timeMin = 0;
		var timeMax = data.info.duration;
		var threadCount = data.info.threadCount;
		var colors = [scope.widget.deck[0].color, scope.widget.deck[0].color2];


		// Compute layout
		layout.lines			= { size: 4, padding: 2 };
		layout.section			= { height: 20, pad: 18 };
		layout.height			= layout.margin.top + layout.margin.bottom + 2 * layout.section.height + threadCount * layout.lines.size + (threadCount + 1) * layout.lines.padding;
		layout.graph.height		= function() { return this.layout.height - this.layout.margin.top - this.layout.margin.bottom - 2 * this.layout.section.height; };
		layout.graph.top		= function() { return this.layout.margin.top + this.layout.section.height; };
		layout.graph.bottom		= function() { return this.layout.height - this.layout.margin.bottom - this.layout.section.height; };

		// Container
		d3.select(container).style('height', layout.height + 'px');

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.left(), layout.graph.right()]);

		// Scales - domains
		scaleX.domain([timeStart, timeEnd]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);

		// Draw - groups
		var startGroup = svg.append("g")
				.attr("class", "starts")
				.attr("transform", "translate(0," + ((layout.section.height / 2) + layout.margin.top + 5) + ")");
		var endGroup = svg.append("g")
				.attr("class", "ends")
				.attr("transform", "translate(0," + (layout.graph.bottom() + (layout.section.height / 2) + layout.margin.bottom) + ")");
		var threadGroup = svg.append("g");
		var outlineGroup = svg.append("g");

		// Draw data
		var sections = [
			{ group: startGroup,	property: 's', text: "⊕"},
			{ group: endGroup,		property: 'e', text: "⊖"}
		];

		// Draw - lines/box
		var outlineTop = outlineGroup.append("line")
			.attr("class", "outline")
			.attr("x1", layout.graph.left()).attr("x2", layout.graph.right()) // 🕒 repaintable
			.attr("y1", layout.graph.top()).attr("y2", layout.graph.top())
			.attr('stroke', '#000000')
			.attr('stroke-width', 1)
			.attr('fill', 'none');

		// Draw - threads
		var threadGroups = [];
		var threadElements, threadBlocks, previousTime, color_i;
		dataList.forEach(function(t, i, a) {
			threadElements = threadGroup.append("g")
				.attr("transform", "translate(0," + (layout.graph.top() + (i + .5) * layout.lines.size + (i + 1) * layout.lines.padding) + ")");

			threadBlocks = [];
			previousTime = t.s;
			color_i = 0;

			t.m.forEach(function(m) {
				threadBlocks.push(
					threadElements.append("line")
						.attr("class", "thread")
						.attr("x1", scaleX(previousTime)).attr("x2", scaleX(m)) // 🕒 repaintable
						.attr("y1", 0).attr("y2", 0)
						.attr('stroke', colors[color_i])
						.attr('stroke-width', layout.lines.size)
						.attr('fill', 'none')
					);
				previousTime = m;
				color_i = ++color_i % 2;
			});
			threadBlocks.push(
				threadElements.append("line")
					.attr("class", "thread")
					.attr("x1", scaleX(previousTime)).attr("x2", scaleX(t.e)) // 🕒 repaintable
					.attr("y1", 0).attr("y2", 0)
					.attr('stroke', colors[color_i])
					.attr('stroke-width', layout.lines.size)
					.attr('fill', 'none')
				);

			threadGroups.push(threadBlocks);
		});

		// Draw - axis
		var axisXGroup = svg.append("g")
				.attr("class", "xAxis")
				.attr("transform", "translate(0," + layout.graph.bottom() + ")")
				.call(xAxis);

		// Draw - text
		var labelElement = svg.append("text")
			.attr("x", layout.graph.right())
			.attr("y", layout.graph.top())
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
				outlineTop.attr("x2", layout.graph.right());
				axisXGroup.call(xAxis);
				labelElement.attr("x", layout.graph.right());

				// Threads
				var maxJ;
				threadGroups.forEach(function(g, i) {
					maxJ = dataList[i].m.length;
					g.forEach(function(b, j) {
						if (j == 0) // start
							b.attr("x1", scaleX(dataList[i].s)).attr("x2", scaleX(dataList[i].m[0]));
						else if (j == maxJ) // end
							b.attr("x1", scaleX(dataList[i].m[j - 1])).attr("x2", scaleX(dataList[i].e));
						else
							b.attr("x1", scaleX(dataList[i].m[j - 1])).attr("x2", scaleX(dataList[i].m[j]));
					});
				});


				// Draw - starts
				sections.forEach(function(section) {
					section.group.selectAll("*").remove();
					var i = 0;
					var j, m_count, text;
					while (i < dataList.length) {
						previousStart = scaleX(dataList[i][section.property]);

						// Count how many at the "same" time "pad" frame
						m_count = 1;
						j = i + 1;
						while (j < dataList.length && scaleX(dataList[j][section.property]) <= previousStart + layout.section.pad) {
							m_count++;
							j++;
						}

						if (m_count <= 1) {
							text = section.text;
						} else {
							text = section.text + m_count;
						}

						// Add
						section.group.append("text")
							.attr("x", scaleX(dataList[i][section.property]))
							.attr("y", 0)
							.attr("text-anchor", "middle")
							.attr("font-size", "14px")
							.text(text);

						// Move to next step
						i += m_count;
					};
				});


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
		var deck = scope.widget.deck;

		// Data - Copy
		var data = [];
		var dataValueSumMax = 0;
		var dataElement, dataPreviousValue, dataValueSum;
		ids.forEach(function(id) {
			dataElement = [];
			dataValueSum = 0;
			dataPreviousValue = 0;
			deck.forEach(function(element) {
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
		layout.height = layout.lineHeight * deck.length;

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
					return deck[i].color;
				});
	};


	return {
		link: chartDataStackedbars_link,
		restrict: 'E'
	}
});