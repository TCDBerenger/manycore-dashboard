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
 * Layout for graphs
 */
var graphLayout = function(type) {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	// Constants
	this.padding	= { top: 0, right: 10, bottom: 0, left: 20, inner: 10 };
	this.profile	= { favoriteHeight: 0 };
	this.xAxis		= { height: 10, text: 8, textShift: 8, arrow: 8 };
	this.vAxis		= { fontSize: 10 };

	// common vars
	this.height		= 0;
	this.width		= 0;

	// Compute
	this.refresh	= function (container, profiles) {
		self.width	= self.canvas.width.apply(self, arguments);
		self.height	= self.canvas.height.apply(self, arguments);
	};

	// Draw - all canvas (with margins)
	this.canvas	= {
		width: 	function(container) { return container.clientWidth; },
		height:	function(container, profiles) { return self.padding.top + (self.profile.favoriteHeight + self.padding.inner) * profiles.length + self.xAxis.height + self.padding.bottom; }
	};

	// Draw - profiles
	this.profile.x =		function() { return self.padding.left; };
	this.profile.y =		function(index) { return self.padding.top + index * (self.profile.favoriteHeight + self.padding.inner * 2 + self.xAxis.height) };
	this.profile.width =	function() { return self.width - self.padding.left - self.padding.right; };
	this.profile.height =	function() { return self.profile.favoriteHeight; };
	this.profile.left =		function() { return 0; }; 
	this.profile.right =	function() { return self.width - self.padding.left - self.padding.right; };
	this.profile.top =		function() { return 0; }; 
	this.profile.bottom =	function() { return self.profile.favoriteHeight; };

	// Draw - x axis
	this.xAxis.x =		function() { return self.padding.left; };
	this.xAxis.y =		function() { return self.padding.top + self.profile.favoriteHeight + self.padding.inner; };
	this.xAxis.left =	function() { return 0; }; 
	this.xAxis.right =	function() { return self.width - self.padding.left - self.padding.right; };

	// Draw - v axis
	this.vAxis.x =		function() { return 0; };
	this.vAxis.y =		this.profile.y;
	this.vAxis.width =	function() { return self.padding.left; };
	this.vAxis.height =	this.profile.heigh;


	switch(type) {
		case 'band':
			this.profile.favoriteHeight = 40;
			break;
	}
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

/**
 * Meta (parameters)
 */
var graphMeta = function(scope, attributes, vMirror, allowOverflow) {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	// Save params
	this.scope			= scope;

	// Common
	this.begin			= NaN;		// When the user selection starts
	this.end			= NaN;		// When the user selection ends (could be before or after timeMax)
	this.duration		= function() { return self. end - self.begin; };
	this.refresh		= function() {
		self.begin = self.scope.selection.begin;
		self.end = self.scope.selection.end;
	}

	// Layout
	this.vMirror		= (vMirror !== undefined) ? vMirror : false;

	// Overflow
	this.allowOverflow	= (allowOverflow !== undefined) ? allowOverflow : false;
	this.overflow1		= NaN;		// Possible overflow by first profile
	this.overflow2		= NaN;		// Possible overflow by second profile

	// On demand
	['calibration'].forEach(function(a) {
		if (attributes.hasOwnProperty(a))
			self[a] = isNaN(attributes[a]) ? attributes[a] : +attributes[a];
	});

	// Compute
	this.refresh();
};


/**********************************************************/
/*														  */
/*	Common directive mecanisms							  */
/*														  */
/**********************************************************/

/**
 * Init directive
 */
function directive_init(scope, element, attrs, layoutType, vMirror, allowOverflow) {
	// Layout
	var container =	element[0];
	var layout =	new graphLayout(layoutType);

	// Attributes
	var deck =		scope.widget.deck.axis;
	var meta =		new graphMeta(scope, attrs, vMirror, allowOverflow);

	// Data
	var profiles =	scope.profiles;

	// Canvas
	var svg =		d3.select(container).append('svg');

	// Scales
	var scaleX =	d3.scale.linear();
	var scalesV =	[d3.scale.linear(), d3.scale.linear()];

	// Overflow
	var overflow =	(allowOverflow) ? svg.append("g").attr("class", "svg-overflow") : svg;

	// Groups
	var groupAxisX =	overflow.append("g").attr("class", "svg-axis svg-axis-x");
	var groupAxisV1 =	overflow.append("g").attr("class", "svg-axis svg-axis-v svg-profile-1");
	var groupAxisV2 =	overflow.append("g").attr("class", "svg-axis svg-axis-v svg-profile-2");
	var groupP1 =		overflow.append("g").attr("class", "svg-profile svg-profile-1");
	var groupP2 =		overflow.append("g").attr("class", "svg-profile svg-profile-2");


	return {
		container:	container,
		layout:		layout,
		deck:		deck,
		meta:		meta,
		profiles:	profiles,
		svg:		svg,
		scaleX:		scaleX,
		scalesV:	scalesV,
		groupO:		overflow,
		groupX:		groupAxisX,
		groupV:		[groupAxisV1, groupAxisV2],
		groupP:		[groupP1, groupP2],
	};
}

/**
 * Repaint - container
 */
function directive_repaint_container(r, vData, vData2) {
	// Parameters - Data
	r.meta.refresh();

	// Parameters - Scales
	r.scaleX.domain([r.meta.begin, r.meta.end]);
	r.scalesV[0].domain(vData);
	r.scalesV[1].domain((vData2 !== undefined) ? vData2 : vData);

	// Sizes
	r.layout.refresh(r.container, r.profiles);

	// Sizes - Scales
	r.scaleX.rangeRound([r.layout.profile.left(), r.layout.profile.right()]);
	r.scalesV[0].rangeRound([r.layout.profile.bottom(), r.layout.profile.top()]);
	if (r.meta.vMirror) r.scalesV[1].rangeRound([r.layout.profile.top(), r.layout.profile.bottom()]); else r.scalesV[1].rangeRound([r.layout.profile.bottom(), r.layout.profile.top()]);

	// Sizes - container
	d3.select(r.container)
		.style('height', r.layout.height + 'px')
		.style('background', 'transparent');
	r.svg.attr({width: r.layout.width, height: r.layout.height});

	// Clean axis
	r.groupV[0].attr("transform", "translate(" + r.layout.vAxis.x() + "," + r.layout.vAxis.y(0) + ")");
	r.groupV[1].attr("transform", "translate(" + r.layout.vAxis.x() + "," + r.layout.vAxis.y(1) + ")");

	// Clean groups
	r.groupP[0].attr("transform", "translate(" + r.layout.profile.x() + "," + r.layout.profile.y(0) + ")");
	r.groupP[1].attr("transform", "translate(" + r.layout.profile.x() + "," + r.layout.profile.y(1) + ")");

	// Overflow
	if (r.meta.allowOverflow) {
		r.meta.overflow1 = [0, 0];
		r.meta.overflow2 = [0, 0];
		r.groupO.attr("transform", null);
	}
}

/**
 * Repaint - container
 */
function directive_repaint_post(r) {
	// Overflow
	if (r.meta.allowOverflow) {

		// Top (profile 1)
		if (r.meta.overflow1 > 0) {
			r.groupO.attr("transform", "translate(0," + r.meta.overflow + ")");
		}

		// Bottom (profile 2)
		if (r.meta.overflow2 > 0) {
			d3.select(r.container).style('height', (r.layout.height + r.meta.overflow2) + 'px');
			r.svg.attr('height', r.layout.height + r.meta.overflow2);
		}
	}
}

/**
 * Repaint - XAxis
 */
function directive_repaint_xAxis(r) {
	// Clean
	r.groupX.attr("transform", "translate(" + r.layout.xAxis.x() + "," + r.layout.xAxis.y() + ")");
	r.groupX.selectAll("text").remove();

	// Box
	var points = [
			{"x": -r.layout.xAxis.arrow, "y": 0},
			{"x": r.layout.xAxis.right(),	"y": 0},
			{"x": r.layout.xAxis.right() + r.layout.xAxis.arrow, "y": r.layout.xAxis.height / 2},
			{"x": r.layout.xAxis.right(),	"y": r.layout.xAxis.height},
			{"x": -r.layout.xAxis.arrow, "y": r.layout.xAxis.height},
			{"x": 0, "y": r.layout.xAxis.height / 2},
	];
	r.groupX.append("polygon")
		.attr("points",function() { return points.map(function(d) { return [d.x, d.y].join(","); }).join(" "); })
		.attr("stroke","black")
		.attr("stroke-width", 2);

	// Labels
	var texts = r.scaleX.ticks();
	var lastIndex = texts.length - 1;
	r.groupX
		.selectAll(".svg-text")
		.data(texts).enter()
		.append("text")
			.attr("y", r.layout.xAxis.textShift)
			.attr("x", function (d) { return r.scaleX(d)})
			.attr("text-anchor", function(d, i) { return (i == 0) ? "start" : (i == lastIndex) ? "end" : "middle"; })
			.attr("font-size", r.layout.xAxis.text + "px")
			.attr("fill", "#FFFFFF")
			.text(function (d) { return d});
}



/**********************************************************/
/*														  */
/*	Directives											  */
/*														  */
/**********************************************************/

/**
 * Switches and migrations
 */
app.directive('chartSwitches', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartSwitches ==");

		// Init vars
		var r = directive_init(scope, element, attrs, 'band', true, true);

		// Enhance meta
		r.meta.expected = 1;
		r.meta.minLimit = 2;
		r.meta.pixelGroup = 3;
		r.meta.calibrations = [];

		// Calibration
		r.profiles.forEach(function(profile) {
			r.meta.calibrations.push(profile.hardware.calibration[r.meta.calibration]);
		});

		// Enhance layout

		// Redraw
		var repaint = function repaint() {
				// Repaint container
				directive_repaint_container(r, [0, r.meta.minLimit]);

				// Repaint graphical elements
				directive_repaint_xAxis(r);

				// Computation
				var msByBrushstroke =		r.meta.duration() / r.layout.width / r.meta.pixelGroup;
				

				// Draw
				r.profiles.forEach(function(profile, index) {
					// Clean
					r.groupV[index].selectAll("text").remove();

					// Computation
					var limitByBrushstroke = msByBrushstroke * r.meta.calibrations[index];

					// Limit - label
					r.groupV[index].append("text")
						.attr("x", r.layout.vAxis.width())
						.attr("y", r.scalesV[index](r.meta.expected) + 3)
						.attr("text-anchor", "end")
						.attr("font-size", r.layout.vAxis.fontSize + "px")
						.attr("font-weight", "bold")
						.text(r.meta.expected + "×");

					// Limit
					r.groupV[index].append("line")
						.attr("class", "line")
						.attr('stroke', "#000000")
						.attr('stroke-width', 1)
						.attr('stroke-dasharray', 3.1)
						.attr("x1", r.layout.vAxis.width())
						.attr("x2", r.layout.vAxis.width() + r.layout.profile.width())
						.attr("y1", r.scalesV[index](r.meta.expected))
						.attr("y2", r.scalesV[index](r.meta.expected));

					// Data - vars
					var x = 0;	var xMax = r.layout.width;			var xPad = r.meta.pixelGroup;
					var d = 0;	var dMax = 0 /* datal length */;	var dPad = msByBrushstroke;
					var count;

					// Data - loop
					while (x < xMax) {
						// Reset
						count = 0;

						// Count events



						// Next loop
						x += xPad;
					}

					// Data - draw
					r.groupP[index].append("polygon")
						.attr("points",function() { return [{"x": 0, "y": r.scalesV[index](0)}, {"x": r.scaleX(r.meta.duration()), "y": r.scalesV[index](0)}, {"x": r.scaleX(r.meta.duration()), "y": r.scalesV[index](2)}, {"x": 0, "y": r.scalesV[index](2)}].map(function(d) { return [d.x, d.y].join(","); }).join(" "); })
						.attr("stroke", "#F9F9F9")
						.attr("stroke-width", 2);

				});


				// Post-treatment
				directive_repaint_post(r);
		};

		// Redraw - bind
		scope.$watch(function() { return r.container.clientWidth; }, repaint);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


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