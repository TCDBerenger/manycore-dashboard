/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/

/**
 * Layout for sequence chart
 */
var sequenceLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;
	
	this.height		= 40;
	this.width		= 0;
	this.graph		= { height: 20 };
	
	this.compute	= function(width, profiles, pIndex) {
		var max = 0;
		profiles.forEach(function(profile) {
			max = Math.max(max, profile.data.dash.info.duration);
		});
		
		self.width			= width;
		self.graph.width	= width * 0.8 * profiles[pIndex].data.dash.info.duration / max;
	};
};

/**
 * Layout for strip chart
 */
var stripLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;
	
	this.height		= 50;
	this.width		= 0;
	this.graph		= { top: 0, bottom: this.height, left: 0, height: this.height };
	
	this.compute	= function(width) {
		self.width			= width;
		self.graph.width	= width;
		self.graph.right	= width;
	};
};

/**
 * Layout for gauge chart
 */
var gaugeLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;
	
	this.compute	= function(width) {
		self.width			= width;
		self.height			= 0;
	};
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
 * Sequence chart
 */
app.directive('chartSequence', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartSequence ==");
		
		// Layout
		var container = element[0];
		var layout = new sequenceLayout();

		// Attributes
		var pIndex = scope.pindex;
		var profiles = scope.selectedProfiles;
		
		// DOM
		d3.select(container)
			.style('background', 'transparent')
			.attr('height', layout.height);
		var svg = d3.select(container).append('svg')
			.attr('height', layout.height)
			.attr("class", "svg-sequence");
		var group = svg.append("g");
		
		// Items
		var itemProfile = group.append("rect")
			.attr("class", "svg-duration")
			.attr("y", 0)
			.attr("height", layout.graph.height -1);
		var itemGap = group.append("polygon")
			.attr("class", "svg-gap");
		var itemLabel = group.append("text")
			.attr("class", "svg-text-hover svg-label")
			.attr("y", layout.graph.height / 2)
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "central")
			.attr("dominant-baseline", "central");
		
		// Redraw
		function repaint() {
			layout.compute(container.clientWidth, profiles, pIndex);
			
			// Container
			d3.select(container).style('height', layout.height + 'px');
			svg.attr('width', layout.width);
			
			// Compute
			var points = [0, layout.height, container.clientWidth / 2 - layout.graph.width / 2, layout.graph.height, container.clientWidth / 2 + layout.graph.width / 2, layout.graph.height, layout.width, layout.height];
			
			// Adapt items
			itemProfile
				.attr("width", layout.graph.width)
				.attr("x", points[2]);
			itemGap.attr("points", p2s(points));
			itemLabel
				.attr("x", container.clientWidth / 2)
				.text((Math.round(profiles[pIndex].data.dash.info.duration / 100) / 10) + ' sec');
		}
		
		scope.$watch(function() { return container.clientWidth * profiles.length * profiles[pIndex].id; }, repaint);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


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
		var v = scope.strip.facet;
		var pIndex = scope.pindex;
		var profiles = scope.selectedProfiles;
		
		// Data

		// Meta
		var title = scope.strip.title;
		
		// DOM
		d3.select(container)
			.style('background', 'transparent')
			.style('height', layout.height + 'px');
		var svg = d3.select(container).append('svg')
			.attr('height', layout.height)
			.attr("class", "svg-profiling");
		var group = svg.append("g").attr("class", "dataset");
		
		// Scales
		var scaleX = d3.scale.linear();
		
		// Title
		svg.append("text")
			.attr("class", "svg-text-hover svg-title")
			.attr("x", 4)
			.attr("y", layout.height / 2)
			.attr("text-anchor", "start")
			.attr("alignment-baseline", "central")
			.attr("dominant-baseline", "central")
			.attr("fill", v.gcolor)
			.text(title);

		// (Re) Paint
		var redraw = function redraw() {
			// Layout
			layout.compute(container.clientWidth);

			// Data
			var profile = scope.selectedProfiles[scope.pindex];
			var dataList = profile.data.dash.profiling;
			var reverseData = scope.strip.reverse;
			var duration = profile.data.dash.info.duration;
			var timeStep = profile.data.dash.info.timeStep;

			// SVG
			svg.attr('width', layout.width);
			
			// Scale X
			scaleX
				.domain([0, duration])
				.rangeRound([layout.graph.left, layout.graph.right]);
			
			// Clean
			group.selectAll("*").remove();
			
			// Points
			var points;
			if (reverseData) {
				points = [scaleX(0), layout.graph.top];
				dataList.forEach(function(p) {
					points.push.apply(points, [scaleX(p.t), p[v.attr], scaleX(p.t + timeStep), p[v.attr]]);
				});
				points.push.apply(points, [scaleX(duration), layout.graph.top]);
			} else {
				points = [scaleX(0), layout.graph.bottom];
				dataList.forEach(function(p) {
					points.push.apply(points, [scaleX(p.t), layout.graph.bottom - p[v.attr], scaleX(p.t + timeStep), layout.graph.bottom - p[v.attr]]);
				});
				points.push.apply(points, [scaleX(duration), layout.graph.bottom]);
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
		scope.$watch(function() { return container.clientWidth * profiles[pIndex].id; }, redraw);
		element.on('mouseenter', enter);
		element.on('mouseleave', leave);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


/**
 * Gauge chart (indicators)
 */
app.directive('chartGauges', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartGauges ==");
		
		// Layout
		var container = element[0];
		var layout = new gaugeLayout();

		// Attributes
		var groups = scope.category.gauges;
		var profiles = scope.selectedProfiles;
		
		/*
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
			.attr("dominant-baseline", "central")
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
		*/
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});