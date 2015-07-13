/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/

/**
 * Constants
 */
var LAYOUT_GAUGE_REGULAR = 100;
var LAYOUT_GAUGE_BIG = 140;

/**
 * Layout for strip chart
 */
var stripLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;
	
	this.height		= 60;
	this.width		= 0;
	this.graph		= { top: 0, bottom: 60, left: 0, height: 60 };
	
	this.compute	= function(width) {
		self.width			= width;
		self.graph.width	= width;
		self.graph.right	= width;
	};
};

/**
 * Layout for gauge chart
 */
var gaugeLayout = function(size) {
	this.height		= size;
	this.width		= size;
	this.size		= size;
};



/**********************************************************/
/*														  */
/*	Utilities											  */
/*														  */
/**********************************************************/

/**
 * Array of points to string
 */
function p2s(points) {
	var result = "";

	for (var i = points.length - 2; i >= 0; i -= 2) {
		result = points[i] + "," + points[i+1] + " " + result;
	};

	return result;
}


/**********************************************************/
/*														  */
/*	Directives											  */
/*														  */
/**********************************************************/

/**
 * Strip charts (profiling)
 */
app.directive('chartStrip', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartStrip ==");

		// Layout
		var container = element[0];
		var layout = new stripLayout();

		// Attributes
		var deck = scope.strip.deck;
		var v = deck.data[0];
		var profile = scope.profile;
		
		// Data
		var data = profile.data.dash;
		var dataList = profile.data.dash.profiling;

		// Meta
		var title = scope.strip.title;
		var timeStep = data.info.timeStep;
		
		// DOM
		d3.select(container).style('height', layout.height + 'px');
		var svg = d3.select(container).append('svg').attr('height', layout.height);
		var group = svg.append("g").attr("class", "dataset");
		
		// Scales
		var scaleX = d3.scale.linear().domain([0, data.info.duration]);
		
		// Title
		svg.append("text")
			.attr("class", "svg-title")
			.attr("x", 4)
			.attr("y", layout.height - 6)
			.attr("text-anchor", "start")
			.attr("fill", v.gcolor)
			.text(title);

		// (Re) Paint
		var redraw = function redraw() {
			
			// Layout
			layout.compute(container.clientWidth);
			
			// Container (remove background stripes)
			d3.select(container).style('background', 'transparent');

			// SVG
			svg.attr('width', layout.width);
			
			// Scale X
			scaleX.rangeRound([layout.graph.left, layout.graph.right]);
			
			// Clean
			group.selectAll("*").remove();
			
			// Points
			var points = [scaleX(0), layout.graph.bottom];
			dataList.forEach(function(p) {
				points.push.apply(points, [scaleX(p.t), layout.graph.bottom - p[v.attr], scaleX(p.t + timeStep), layout.graph.bottom - p[v.attr]]);
			});
			points.push.apply(points, [scaleX(data.info.duration), layout.graph.bottom]);
			
			// Draw
			group.append("polygon")
				.attr("class", "svg-data")
				.attr("points", p2s(points))
				.attr("fill", v.fcolor)
				.attr('stroke-width', 1);
		}
		
		// Select
		var enter = function enter() {
			group.select('.svg-data').attr("fill", v.color);
		}
		
		// Unselect
		var leave = function leave() {
			group.select('.svg-data').attr("fill", v.fcolor);
		}
		
		
		// Binds
		scope.$watch(function() { return container.clientWidth; }, redraw);
		element.on('mouseenter', enter);
		element.on('mouseleave', leave);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


/**
 * Gauge chart: simple proportion
 */
app.directive('gaugeProportion', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == gaugeProportion ==");
		
		// Layout
		var container = element[0];
		var layout = new gaugeLayout(LAYOUT_GAUGE_REGULAR);
		layout.middle = LAYOUT_GAUGE_REGULAR / 2;
		layout.arcInner = 0;
		layout.arcOuter = Math.ceil(Math.hypot(layout.middle, layout.middle));

		// Attributes
		var vs = scope.gauge.deck.data;
		var profile = scope.profile;
		
		// Data
		var dataList = profile.data.dash.gauges;

		// DOM
		var svg = d3.select(container).append('svg')
			.attr('height', layout.height)
			.attr('width', layout.width);
		var group = svg.append("g")
			.attr("class", "dataset")
			.attr("transform", "translate(" + (layout.height / 2) + "," + (layout.width / 2) + ")");
		
		// Data
		var sumValues = 0;
		vs.forEach(function(v) {
			sumValues += dataList[v.attr];
		});
		
		// Draw
		var nextAngle;
		var precedingAngle = 0;
		vs.forEach(function(v, i) {
			// Data
			nextAngle = precedingAngle + 2 * Math.PI * dataList[v.attr] / sumValues;
			
			// Draw
			group.append("path")
				.attr("class", "svg-data svg-data-" + i)
				.attr("d", d3.svg.arc()
							.innerRadius(layout.arcInner)
							.outerRadius(layout.arcOuter)
							.startAngle(precedingAngle)
							.endAngle(nextAngle))
				.attr("fill", v.fcolor);
			
			// Next loop
			precedingAngle = nextAngle;
		});
		
		// Text
		svg.append("text")
			.attr("class", "svg-title")
			.attr("x", layout.middle)
			.attr("y", layout.middle)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "central")
			.attr("fill", vs[0].gcolor)
			.text(Math.round(100 * dataList[vs[0].attr] / sumValues) + ' %');
		
		
		// Select
		var enter = function enter() {
			vs.forEach(function(v, i) {
				group.select('.svg-data-' + i).attr("fill", v.color);
			});
		}
		
		// Unselect
		var leave = function leave() {
			vs.forEach(function(v, i) {
				group.select('.svg-data-' + i).attr("fill", v.fcolor);
			});
		}
		
		
		// Binds
		element.on('mouseenter', enter);
		element.on('mouseleave', leave);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


/**
 * Gauge chart: compare
 */
app.directive('gaugeCompare', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == gaugeProportion ==");
		
		// Layout
		var container = element[0];
		var layout = new gaugeLayout(LAYOUT_GAUGE_BIG);
		layout.middle = LAYOUT_GAUGE_BIG / 2;
		layout.arcInner = 0;
		layout.arcOuter = Math.ceil(Math.hypot(layout.middle, layout.middle));

		// Attributes
		var vs = scope.gauge.deck.data;
		var profile = scope.profile;
		
		// Data
		var dataList = profile.data.dash.gauges;

		// DOM
		var svg = d3.select(container).append('svg')
			.attr('height', layout.height)
			.attr('width', layout.width);
		var group = svg.append("g")
			.attr("class", "dataset")
			.attr("transform", "translate(" + (layout.height / 2) + "," + (layout.width / 2) + ")");
		
		// Data
		var sumValues = 0;
		var maxValue = 0;
		var selectedV = vs[0];
		vs.forEach(function(v) {
			sumValues += dataList[v.attr];
			
			// Select max value
			if (maxValue < dataList[v.attr]) {
				maxValue = dataList[v.attr];
				selectedV = v;
			}
		});
		
		// Draw
		var nextAngle;
		var precedingAngle = 0;
		vs.forEach(function(v, i) {
			// Data
			nextAngle = precedingAngle + 2 * Math.PI * dataList[v.attr] / sumValues;
			
			// Draw
			var shape = group.append("path")
				.attr("class", "svg-data svg-data-" + i)
				.attr("d", d3.svg.arc()
							.innerRadius(layout.arcInner)
							.outerRadius(layout.arcOuter)
							.startAngle(precedingAngle)
							.endAngle(nextAngle))
				.attr("fill", v.fcolor)
				.on("mouseenter", function() { mouseEnter(v, shape); })
				.on("mouseleave", function() { mouseLeave(v, shape); });
			
			// Next loop
			precedingAngle = nextAngle;
		});
		
		
		// Text
		var text = svg.append("text")
			.attr("class", "svg-title")
			.attr("fill", vs[0].gcolor)
		var line1 = text.append('tspan')
			.attr("x", layout.middle)
			.attr("y", layout.middle - 13)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "central")
			.text(selectedV.title);
		var line2 = text.append('tspan')
			.attr("x", layout.middle)
			.attr("y", layout.middle + 13)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "central")
			.text(Math.round(100 * dataList[selectedV.attr] / sumValues) + ' %');
		
		
		// Select
		function mouseEnter(v, shape) {
			shape.attr("fill", v.color);
			text.attr("fill", v.color);
			line1.text(v.title);
			line2.text(Math.round(100 * dataList[v.attr] / sumValues) + ' %');
		}
		
		// Unselect
		function mouseLeave(v, shape) {
			shape.attr("fill", v.fcolor);
		}
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});





/**********************************************************/
/*														  */
/*	TO REWORK											  */
/*														  */
/**********************************************************/


var widgetDashLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	this.margin		= { top: 4, right: 4, bottom: 4, left: 4 };
	this.height		= 60;
	this.width		= 0;
	this.graph		= {
		width: 	function() { return self.width - self.margin.left - self.margin.right; },
		height: function() { return self.height - self.margin.top - self.margin.bottom; },
		top: 	function() { return self.margin.top; },
		right: 	function() { return self.width - self.margin.right; },
		bottom: function() { return self.height - self.margin.bottom; },
		left: 	function() { return self.margin.left; }
	};
};

var widgetDashMeta = function(attributes) {
	this.tag			= +attributes.tag,
	this.begin			= 0,
	this.end			= 0
};
var indicatorDashLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;
	
	// Common
	this.height		= NaN;
	this.width		= NaN;

	// Donut
	this.donut		= {
		size: 100, padding: 40,
		compute: function(profiles, deckGroups) {
			self.width = self.donut.size * profiles + self.donut.padding * (profiles - 1);
			self.height = self.texts.app.height + deckGroups * (self.donut.size + self.texts.values.height * (profiles - 1));
		}
	};
	this.donuts		= [
		{	inner: 20,	outer: 40,	text: 30},
		{	inner: 50,	outer: 70,	text: 60},
		{	inner: 80,	outer: 100,	text: 90}
	];

	// Deviance
	this.deviance	= {
		height: 100, width: 20, innerPadding: 20, outerPadding: 10, padding: 40,
		compute: function(profiles, decks) {
			self.width = (self.deviance.width * decks + self.deviance.innerPadding * (decks - 1) + self.deviance.outerPadding * 2) * profiles + self.deviance.padding;
			self.height = self.deviance.height + self.texts.values.height + self.texts.app.height * (profiles - 1);
		}
	};

	// Arc
	this.arc		= {
		width: 100, height: 50, arc: 50, size: 20, padding: 40,
		compute: function(profiles) {
			self.width = self.arc.width * profiles + self.arc.padding * (profiles - 1);
			self.height = self.arc.height + self.texts.values.height + self.texts.app.height * (profiles - 1);
		}

	};


	// Texts
	this.texts		= {
		values:	{
			height:	20
		},
		app:	{
			height:	20,
			size:	14,
		}
	};
};


app.directive('chartDashProfile', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartDashProfile ==");

		// Layout
		var container = element[0];
		var layout = new widgetDashLayout();

		// Attributes
		var deck = scope.category.deck;
		var meta = new widgetDashMeta(attrs);

		// Data
		var profile = scope.profile;
		var data = profile.data.dash;
		var dataList = profile.data.dash.profiling;

		meta.begin = 0;
		meta.end = data.info.duration;

		// Fix column layout
		dataList = dataList.slice(0);
		dataList.push(dataList[dataList.length - 1]);

		// DOM
		var svg = d3.select(container).append('svg').attr('height', layout.height);
		var group = svg.append("g").attr("class", "dataset");

		// Scales
		var scaleX = d3.scale.linear();
		var scaleY = d3.scale.linear()
				.rangeRound([layout.graph.bottom(), layout.graph.top()])
				.domain([0, 100]);


		// Draw
		var interpolationMethod = "step-after";
		var deckFunctions = [];
		var deckElements = [];

		deck.data.forEach(function(set, i) {
			// Function
			deckFunctions.push(
				d3.svg.area()
					.x(function(d) { return scaleX(d.t); })
					.y0(scaleY(0))
					.y1(function(d) { return scaleY(d[set.attr]); })
					.interpolate(interpolationMethod)
			);

			// Graphic
			deckElements.push(
				group.append("path")
					.attr("fill", set.fcolor)
			);
		});


		// (Re) Paint
		var redraw = function redraw() {
				// Layout
				layout.width = container.clientWidth;

				// Container
				d3.select(container)
					.style('height', layout.height + 'px')
					.style('background', 'transparent');

				// SVG
				svg.attr('width', layout.width);

				// Scale X
				scaleX
					.rangeRound([layout.graph.left(), layout.graph.right()])
					.domain([meta.begin, meta.end]);

				// Areas
				deckElements.forEach(function (element, i) {
					element.attr("d", deckFunctions[i](dataList));
				});
			};

		// Binds
		scope.$watch(function() { return container.clientWidth; }, redraw);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


app.directive('chartDashDivergence', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartDashDivergence ==");

		// Layout
		var container = element[0];
		var layout = new widgetDashLayout();

		// Attributes
		var deck = scope.category.deck;
		var meta = new widgetDashMeta(attrs);

		// Data
		var data = scope.data[scope.profile.id];
		var midValue = deck.axis.limit.mid(data);

		meta.begin = 0;
		meta.end = data.info.duration;

		// Fix column layout
		var lastElement = angular.copy(data[deck.data[0].cat][data[deck.data[0].cat].length - 1], {});
		lastElement.t = data.info.duration;
		data[deck.data[0].cat].push(lastElement);

		// DOM
		var svg = d3.select(container).append('svg').attr('height', layout.height);

		// Scales
		var scaleX = d3.scale.linear();
		var scaleY = d3.scale.linear()
				.rangeRound([layout.graph.bottom(), layout.graph.top()])
				.domain([deck.axis.limit.min(data), deck.axis.limit.max(data)]);


		// Draw
		var scaleYMid = scaleY(deck.axis.limit.mid(data));
		var interpolationMethod = "step-after";

		// Draw - ready
		var deckFunctions = [];
		var deckElements = [];
		deck.data.forEach(function(set, i) {
			if (i == 0)
				deckFunctions.push(
					d3.svg.area()
						.x(function(d) { return scaleX(d.t); })
						.y0(function(d) { return scaleY(midValue - d[deck.data[0].attr]); })
						.y1(scaleYMid)
						.interpolate(interpolationMethod)
				);
			else
				deckFunctions.push(
					d3.svg.area()
						.x(function(d) { return scaleX(d.t); })
						.y0(scaleYMid)
						.y1(function(d) { return scaleY(midValue + d[set.attr]); })
						.interpolate(interpolationMethod)
				);
			deckElements.push(
				svg.append("g").attr("class", "dataset").append("path")
					.attr("fill", set.fcolor)
			);
		});


		// (Re) Paint
		var redraw = function redraw() {
				// Layout
				layout.width = container.clientWidth;

				// Scale X
				scaleX.rangeRound([layout.graph.left(), layout.graph.right()]).domain([meta.begin, meta.end]);
				scaleXStep = scaleX(data.info.timeStep);

				// Container
				d3.select(container)
					.style('height', layout.height + 'px')
					.style('background', 'transparent');

				// SVG
				svg.attr('width', layout.width);

				// Areas
				for (var i = deck.data.length - 1; i >= 0; i--) {
					deckElements[i].attr("d", deckFunctions[i](data[deck.data[0].cat]));
				};
			};

		// Binds
		scope.$watch(function() { return container.clientWidth; }, redraw);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


app.directive('widgetDashDeviation', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == widgetDashDeviation ==");

		// Layout
		var container = element[0];
		var layout = new indicatorDashLayout();

		// Attributes
		var deck = scope.indicator.deck;
		var meta = {};

		// Data
		var profiles = scope.selectedProfiles;
		var valueLimit = 1;
		var valueMax = 4;

		// DOM
		var svg = d3.select(container).append('svg');

		// sizes
		var colWidth = deck.length * layout.deviance.width + (deck.length - 1) * layout.deviance.innerPadding + 2 * layout.deviance.outerPadding;
		var col1Position = colWidth + layout.deviance.padding;

		// Groups
		var autoCropGroup = svg.append("g").attr("class", "svg-autocrop");

		var donutSupergroup = autoCropGroup.append("g").attr("class", "svg-dataset");
		var donutGroups = [
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-top svg-donut-left"),
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-top svg-donut-right")
					.attr("transform", "translate(" + col1Position + ",0)"),
			];

		var valueSupergroup = autoCropGroup.append("g")
			.attr("transform", "translate(0," + (layout.deviance.height + 14 ) + ")")
			.attr("class", "svg-label");
		var valueGroups = [
				valueSupergroup.append("g").attr("class", "svg-donut-top svg-donut-left"),
				valueSupergroup.append("g").attr("class", "svg-donut-top svg-donut-right")
					.attr("transform", "translate(" + col1Position + ",0)"),
			];
		
		var appGroup = autoCropGroup.append("g").attr("class", "svg-text svg-text-app")
				.attr("transform", "translate(" + 0 + "," + (layout.deviance.height + layout.texts.values.height) + ")");

		// Draw - limit label
		var limitLabel = autoCropGroup.append("g").attr("class", "svg-text").append("text")
			.attr("x", colWidth + layout.deviance.padding / 2)
			.attr("text-anchor", "middle")
			.style("fill", "#000000")
			.text("×1");


		// Big painting function
		function redraw() {
			// Precomputation
			layout.deviance.compute(profiles.length, deck.length);

			// DOM
			svg.attr({width: layout.width, height: layout.height});
			d3.select(container)
				.style('width', layout.width + 'px')
				.style('height', layout.height + 'px')
				.style('background', 'transparent');
			autoCropGroup.attr("transform", null);

			// Clean
			donutSupergroup.selectAll("rect").remove();
			donutSupergroup.selectAll("line").remove();
			valueSupergroup.selectAll("text").remove();
			appGroup.selectAll("text").remove();


			// Draw
			var precedingPosition;
			var value, pixelValue;
			var limitYSum = 0;
			var firstY = layout.deviance.height;
			profiles.forEach(function(profile, col_index) {

				// Reset position
				precedingPosition = layout.deviance.outerPadding;

				deck.forEach(function(dev_data, dev_index) {
						// Values
						value =			dev_data.v(profile);
						pixelValue =	layout.deviance.height / valueMax;

						// Background
						/*if (value < valueLimit) {
							donutGroups[col_index].append("rect")
								.attr("x", precedingPosition)
								.attr("y", pixelValue * (valueMax - valueLimit))
								.attr("width", layout.deviance.width)
								.attr("height", pixelValue * (valueLimit - value))
								.style("fill", dev_data.b);
						}*/

						// Over
						if (value > valueLimit) {
							donutGroups[col_index].append("rect")
								.attr("x", precedingPosition)
								.attr("y", pixelValue * (valueMax - value))
								.attr("width", layout.deviance.width)
								.attr("height", pixelValue * (value - valueLimit))
								.style("fill", dev_data.o);
						}

						// Value (under the limit)
						donutGroups[col_index].append("rect")
							.attr("x", precedingPosition)
							.attr("y", pixelValue * (valueMax - Math.min(value, valueLimit)))
							.attr("width", layout.deviance.width)
							.attr("height", pixelValue * Math.min(value, valueLimit))
							.style("fill", dev_data.c);

						// Limit
						donutGroups[col_index].append("line")
							.attr("class", "line")
							.attr('stroke', "#000000")
							.attr('stroke-width', 1)
							.attr('stroke-dasharray', 3.1)
							.attr("x1", precedingPosition - layout.deviance.innerPadding / 3)
							.attr("x2", precedingPosition + layout.deviance.width + layout.deviance.innerPadding / 3)
							.attr("y1", layout.deviance.height * 3 / 4)
							.attr("y2", layout.deviance.height * 3 / 4);

						// Value label
						valueGroups[col_index].append("text")
							.attr("x", precedingPosition + layout.deviance.width / 2)
							.attr("y", 0)
							.attr("text-anchor", "middle")
							.style("fill", dev_data.c)
							.text(dev_data.l(profile));


						// For the limit
						limitYSum += pixelValue * (valueMax - valueLimit);

						// For the auto-crop
						firstY = Math.min(firstY, pixelValue * (valueMax - value));

						// Next position
						precedingPosition += layout.deviance.width + layout.deviance.innerPadding;
				});


				// App text
				if (profiles.length > 1) {
					appGroup.append("text")
						.attr("x", col1Position * col_index + colWidth / 2)
						.attr("y", layout.texts.app.size + 1)
						.attr("text-anchor", "middle")
						.attr("font-size", layout.texts.app.size + "px")
						.attr("font-weight", "bold")
						.text(profiles[col_index].label);
				}
			});

			// Set limit in the middle
			limitLabel.attr("y", limitYSum / deck.length / profiles.length + 4);

			// For the auto-crop
			firstY = Math.min(firstY, limitYSum / deck.length / profiles.length - 2);

			// Auto-crop
			if (firstY > 0) {
				svg.attr('height', layout.height - firstY);
				d3.select(container).style('height', (layout.height - firstY) + 'px')
				autoCropGroup.attr("transform", "translate(0," + (-firstY) + ")");
			}
		}


		scope.$watch(function() { return scope.selectedProfiles.length * scope.selectedProfiles[0].id; }, redraw);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


