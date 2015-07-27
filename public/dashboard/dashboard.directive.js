/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/

/**
 * Constants
 */
var LAYOUT_GAUGE_REGULAR = 80;
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
function gauge_p2s(points) {
	var result = "";

	for (var i = points.length - 2; i >= 0; i -= 2) {
		result = points[i] + "," + points[i+1] + " " + result;
	};

	return result;
}

/**
 *	Number to factor times
 */
function gauge_n2ft(v) {
	if (v < 1) {
		switch(Math.ceil(v / .25) * .25) {
			case 0.25:	return '¼';
			case 0.5:	return '½';
			case 0.75:	return '¾';
			default:	return Math.round(v) + '×';
		}
	} else {
		return (Math.ceil(v / .5) * .5) + '×';
	}
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
		var reverseData = scope.strip.reverse;

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
			.attr("y", (reverseData) ? 32 : layout.height - 6)
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
			var points;
			if (reverseData) {
				points = [scaleX(0), layout.graph.top];
				dataList.forEach(function(p) {
					points.push.apply(points, [scaleX(p.t), p[v.attr], scaleX(p.t + timeStep), p[v.attr]]);
				});
				points.push.apply(points, [scaleX(data.info.duration), layout.graph.top]);
			} else {
				points = [scaleX(0), layout.graph.bottom];
				dataList.forEach(function(p) {
					points.push.apply(points, [scaleX(p.t), layout.graph.bottom - p[v.attr], scaleX(p.t + timeStep), layout.graph.bottom - p[v.attr]]);
				});
				points.push.apply(points, [scaleX(data.info.duration), layout.graph.bottom]);
			}
			
			// Draw
			group.append("polygon")
				.attr("class", "svg-data")
				.attr("points", gauge_p2s(points))
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
		d3.select(container).style('background', 'transparent');
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


/**
 * Gauge chart: units
 */
app.directive('gaugeUnits', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == gaugeUnits ==");
		
		// Layout
		var container = element[0];
		var layout = new gaugeLayout(LAYOUT_GAUGE_REGULAR);
		layout.middle = LAYOUT_GAUGE_REGULAR / 2;
		layout.radius = LAYOUT_GAUGE_REGULAR / 2 - 10;

		// Attributes
		var v = scope.gauge.deck.data[0];
		var profile = scope.profile;
		
		// Data
		var value = profile.data.dash.gauges[v.attr];
		var expected = scope.gauge.deck.graph.expected(profile);
		var ratio = value / expected;

		// DOM
		d3.select(container).style('background', 'transparent');
		var svg = d3.select(container).append('svg')
			.attr('height', layout.height)
			.attr('width', layout.width);
		var group = svg.append("g").attr("class", "dataset");
		
		// Draw - value circle
		var circle_value = group.append("circle")
			.attr("cx", layout.middle)
			.attr("cy", layout.middle)
			.attr("r", Math.sqrt(ratio * Math.pow(layout.radius, 2)))
			.attr("fill", v.fcolor);
		
		// Draw - expected circle
		var circle_exp = group.append("circle")
			.attr("cx", layout.middle)
			.attr("cy", layout.middle)
			.attr("r", layout.radius)
			.attr('fill-opacity', 0.0)
			.attr('stroke', v.color)
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', 5.5);
		
		// Text
		svg.append("text")
			.attr("class", "svg-title")
			.attr("x", layout.middle)
			.attr("y", layout.middle)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "central")
			.attr("fill", v.gcolor)
			.text(gauge_n2ft(ratio));
		
		// Select
		var enter = function enter() {
			circle_value.attr("fill", v.color);
			circle_exp.attr("fill", v.fcolor);
		}
		
		// Unselect
		var leave = function leave() {
			circle_value.attr("fill", v.fcolor);
			circle_exp.attr("fill", v.color);
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
