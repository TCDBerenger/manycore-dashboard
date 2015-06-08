/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/
/**
 * Layout (old)
 */
var genericLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	this.margin		= { top: 10, right: 10, bottom: 20, left: 20 };
	this.height		= 0;
	this.width		= 0;
	this.graph		= {
		width: 	function() { return self.width - self.margin.left - self.margin.right; },
		height: function() { return self.height - self.margin.top - self.margin.bottom; },
		top: 	function() { return self.margin.top; },
		right: 	function() { return self.width - self.margin.right; },
		bottom: function() { return self.height - self.margin.bottom; },
		left: 	function() { return self.margin.left; }
	};
	this.innerGraph	= {
		width: 	this.graph.width,
		height: this.graph.height,
		top: 	this.graph.top,
		right: 	this.graph.right,
		bottom: this.graph.bottom,
		left: 	this.graph.left
	};
};

/**
 * Meta (parameters) (old)
 */
var genericMeta = function(attributes) {
	this.begin	= +attributes.begin;	// When the user selection starts
	this.end	= +attributes.end;		// When the user selection ends (could be before or after timeMax)
	if (attributes.hasOwnProperty('focus'))	this.focus		= +attributes.focus;		// Focusing data (divide factor)
	this.autoscale		= (attributes.autoscale === 'true' || attributes.autoscale === 'yes' || attributes.autoscale === '' || attributes.autoscale === 'autoscale')
	this.graduate		= (attributes.graduate) ? +attributes.graduate : 1	// Divide the value with graduate color
	this.max			= (attributes.max) ? +attributes.max : NaN			// Maximum possible value (cf. focus for divide this value)
};



/**********************************************************/
/*														  */
/*	Directives											  */
/*														  */
/**********************************************************/

/**
 * Cache misses
 */
app.directive('chartCacheMisses', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartCacheMisses ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Attributes
		var deck = scope.widget.deck.axis;
		var meta = new genericMeta(attrs);

		// Non repaintable layout
		layout.height = container.clientHeight;

		// Data
		var data = scope.data[attrs.profileid];
		var dataList = data.locality;
		var colors = deck.x.colors;

		// Fix column layout
		var lastElement = angular.copy(dataList[dataList.length - 1], {});
		lastElement.t = data.info.duration;
		dataList.push(lastElement);

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.graph.left(), layout.graph.right()]);
		var scaleY = d3.scale.linear().rangeRound([layout.graph.bottom(), layout.graph.top()]);

		// Scales - domains
		scaleY.domain([0, 100]);
		scaleX.domain([meta.begin, meta.end]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);
		var yAxis = d3.svg.axis().scale(scaleY).orient("left");

		// Function bloc - tlb
		var tlbFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(100 - d.ipc); })
				.y1(function(d) { return scaleY(100 - d.ipc - d.tlb); })
				.interpolate(interpolationMethod);

		// Function bloc - l1
		var l1Function = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(100 - d.ipc - d.tlb); })
				.y1(function(d) { return scaleY(100 - d.ipc - d.tlb - d.l1); })
				.interpolate(interpolationMethod);


		// Draw
		var scaleY0 = scaleY(0);
		var scaleY100 = scaleY(100);
		var interpolationMethod = "step-after";
		var dataGroup = svg.append("g").attr("class", "dataset");

		// Function bloc
		var ipcFunction = d3.svg.area().x(function(d) { return scaleX(d.t); }).interpolate(interpolationMethod)
				.y0(scaleY100) // d.hpf + d.l3 + d.l2 + d.l1 + d.tlb + d.ipc
				.y1(function(d) { return scaleY(d.hpf + d.l3 + d.l2 + d.l1 + d.tlb); })
		var tlbFunction = d3.svg.area().x(function(d) { return scaleX(d.t); }).interpolate(interpolationMethod)
				.y0(function(d) { return scaleY(d.hpf + d.l3 + d.l2 + d.l1 + d.tlb); })
				.y1(function(d) { return scaleY(d.hpf + d.l3 + d.l2 + d.l1); });
		var l1Function = d3.svg.area().x(function(d) { return scaleX(d.t); }).interpolate(interpolationMethod)
				.y0(function(d) { return scaleY(d.hpf + d.l3 + d.l2 + d.l1); })
				.y1(function(d) { return scaleY(d.hpf + d.l3 + d.l2); });
		var l2Function = d3.svg.area().x(function(d) { return scaleX(d.t); }).interpolate(interpolationMethod)
				.y0(function(d) { return scaleY(d.hpf + d.l3 + d.l2); })
				.y1(function(d) { return scaleY(d.hpf + d.l3); });
		var l3Function = d3.svg.area().x(function(d) { return scaleX(d.t); }).interpolate(interpolationMethod)
				.y0(function(d) { return scaleY(d.hpf + d.l3); })
				.y1(function(d) { return scaleY(d.hpf); });
		var hpfFunction = d3.svg.area().x(function(d) { return scaleX(d.t); }).interpolate(interpolationMethod)
				.y0(function(d) { return scaleY(d.hpf); })
				.y1(scaleY0);

		// Draw - blocks
		var ipcElement = dataGroup.append("path").attr("fill", colors[0]);
		var tlbElement = dataGroup.append("path").attr("fill", colors[1]);
		var l1Element = dataGroup.append("path").attr("fill", colors[2]);
		var l2Element = dataGroup.append("path").attr("fill", colors[3]);
		var l3Element = dataGroup.append("path").attr("fill", colors[4]);
		var hpfElement = dataGroup.append("path").attr("fill", colors[5]);

		// Draw - axis
		var axisXGroup = svg.append("g")
				.attr("class", "xAxis")
				.attr("transform", "translate(0," + layout.graph.bottom() + ")");
		var axisYGroup = svg.append("g")
				.attr("class", "xAxis")
				.attr("transform", "translate(" + layout.graph.left() + ",0)")
				.call(yAxis);

		// Draw - text
		var labelElement = svg.append("text")
			.attr("y", layout.graph.top() + 30)
			.attr("text-anchor", "end")
			.attr("font-size", "14px")
			.text(attrs.title);

		// Redraw
		var redraw = function redraw() {
				// Sizes
				layout.width = container.clientWidth;

				// Scales
				scaleX.rangeRound([layout.graph.left(), layout.graph.right()]);

				// SVG
				svg.attr('width', layout.width);
				axisXGroup.call(xAxis);
				ipcElement.attr("d", ipcFunction(dataList));
				tlbElement.attr("d", tlbFunction(dataList));
				l1Element.attr("d", l1Function(dataList));
				l2Element.attr("d", l2Function(dataList));
				l3Element.attr("d", l3Function(dataList));
				hpfElement.attr("d", hpfFunction(dataList));
				labelElement.attr("x", layout.graph.right);
			};

		// Redraw - bind
		scope.$watch(function() { return container.clientWidth; }, redraw);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


/**
 * 
 */
app.directive('chartThreadDivergence', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartThreadDivergence ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Non repaintable layout
		layout.height = container.clientHeight;

		// Attributes
		var deck = scope.widget.deck.axis;
		var meta = new genericMeta(attrs);

		// Data
		var data = scope.data[attrs.profileid];
		var timeMax = data.info.duration;
		var numberCores = data.info.threads;
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
		scaleX.domain([meta.begin, meta.end]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);
		var yAxis = d3.svg.axis().scale(scaleY).orient("left");


		// Draw
		var scaleYCoreCapacity = scaleY(numberCores);
		var interpolationMethod = "step-after";

		// Draw - core area
		var coreElement = svg.append("rect")
				.attr("width", scaleX(timeMax) - scaleX(meta.begin)) // 🕒 repaintable
				.attr("height", scaleY(0) - scaleYCoreCapacity)
				.attr("x", scaleX(meta.begin))
				.attr("y", scaleYCoreCapacity)
				.style("fill", "rgba(70, 130, 180, .5)")
				.style("fill", "#9ED3FF");

		// Draw - ready
		var readyGroup = svg.append("g").attr("class", "dataset");
		var readyAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(Math.max(numberCores, d.r)); })
				.y1(function(d) { return scaleY(d.yb + Math.max(numberCores, d.r)); })
				.interpolate(interpolationMethod);
		var readyArea = readyGroup.append("path")
				.attr("d", readyAreaFunction(data.states)) // 🕒 repaintable
				.attr("fill", "#D28A8D");
		var readyLineFunction = d3.svg.line()
				.x(function(d) { return scaleX(d.t); })
				.y(function(d) { return scaleY(d.yb + Math.max(numberCores, d.r)); })
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
				.attr("x1", scaleX(meta.begin)).attr("x2", scaleX(timeMax)) // 🕒 repaintable
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
				coreElement.attr("width", scaleX(timeMax) - scaleX(meta.begin));
				coreLine.attr("x1", scaleX(meta.begin)).attr("x2", scaleX(timeMax));
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
		link: chart_link,
		restrict: 'E'
	}
});


/**
 * 
 */
app.directive('chartThreadLifetime', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartThreadLifetime ==");

		// Layout
		var container = element[0];
		var layout = new genericLayout();

		// Non repaintable layout
		var self = layout;
		layout.lines				= { size: 4, padding: 2 };
		layout.section				= { height: 20, pad: 18 };
		layout.margin.top			= 0;
		layout.innerGraph.height	= function() { return self.graph.height() - 2 * self.section.height; };
		layout.innerGraph.top		= function() { return self.graph.top() + self.section.height; };
		layout.innerGraph.bottom	= function() { return self.graph.bottom() - self.section.height; };

		// Attributes
		var deck = scope.widget.deck.axis;
		var meta = new genericMeta(attrs);

		// Data
		var data = scope.data[attrs.profileid];
		var dataList = data.lifetimes.list
		var timeMin = 0;
		var timeMax = data.info.duration;
		var threadCount = data.info.threadCount;
		var colors = scope.widget.deck.axis.x.colors;

		// Container
		layout.height = layout.margin.top + layout.margin.bottom + 2 * layout.section.height + threadCount * layout.lines.size + (threadCount + 1) * layout.lines.padding;
		d3.select(container).style('height', layout.height + 'px');

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		svg.style("background", "#FFFFFF");

		// Scales
		var scaleX = d3.scale.linear().rangeRound([layout.innerGraph.left(), layout.innerGraph.right()]);

		// Scales - domains
		scaleX.domain([meta.begin, meta.end]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);

		// Draw - groups
		var startGroup = svg.append("g")
				.attr("class", "starts")
				.attr("transform", "translate(0," + ((layout.section.height / 2) + layout.margin.top + 5) + ")");
		var endGroup = svg.append("g")
				.attr("class", "ends")
				.attr("transform", "translate(0," + (layout.innerGraph.bottom() + (layout.section.height / 2) + layout.margin.bottom) + ")");
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
			.attr("x1", layout.innerGraph.left()).attr("x2", layout.innerGraph.right()) // 🕒 repaintable
			.attr("y1", layout.innerGraph.top()).attr("y2", layout.innerGraph.top())
			.attr('stroke', '#000000')
			.attr('stroke-width', 1)
			.attr('fill', 'none');

		// Draw - threads
		var threadGroups = [];
		var threadElements, threadBlocks, previousTime, color_i;
		dataList.forEach(function(t, i, a) {
			threadElements = threadGroup.append("g")
				.attr("transform", "translate(0," + (layout.innerGraph.top() + (i + .5) * layout.lines.size + (i + 1) * layout.lines.padding) + ")");

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
				.attr("transform", "translate(0," + layout.innerGraph.bottom() + ")")
				.call(xAxis);

		// Draw - text
		var labelElement = svg.append("text")
			.attr("x", layout.innerGraph.right())
			.attr("y", layout.innerGraph.top())
			.attr("text-anchor", "end")
			.attr("font-size", "14px")
			.text(attrs.title);

		// Redraw
		var repaint = function repaint() {
				// Sizes
				layout.width = container.clientWidth;

				// Scales
				scaleX.rangeRound([layout.innerGraph.left(), layout.innerGraph.right()]);

				// SVG
				svg.attr('width', layout.width);
				outlineTop.attr("x2", layout.innerGraph.right());
				axisXGroup.call(xAxis);
				labelElement.attr("x", layout.innerGraph.right());

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


				// Draw - starts / ends
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
		link: chart_link,
		restrict: 'E'
	}
});

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
		var numberCores = data.info.threads;
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
				.y1(function(d) { return scaleY(dataValueMax + d.yb); })
				.interpolate(interpolationMethod);
		var readyArea = readyGroup.append("path")
				.attr("d", readyAreaFunction(data.times)) // 🕒 repaintable
				.attr("fill", "#D28A8D");
		var readyLineFunction = d3.svg.line()
				.x(function(d) { return scaleX(d.t); })
				.y(function(d) { return scaleY(dataValueMax + d.yb); })
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