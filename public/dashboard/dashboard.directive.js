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
	
	this.groups		= { gap: 4, padding: 4, row_height: 14, column_width: 100 };
	this.gauge		= [];
	
	this.initialize = function(gauges) {
		var g_previous = 0;
		var g_height;
		gauges.forEach(function(gauge, gauge_index) {
			g_height = self.groups.padding * 2 + self.groups.row_height * gauge.length;
			
			self.gauge.push({
				top:	g_previous,
				bottom:	g_previous + g_height,
				facet:	[]
			});
			
			gauge.forEach(function(facet, facet_index) {
				self.gauge[gauge_index].facet.push(g_previous + self.groups.padding + self.groups.row_height * facet_index);
			});
			
			self.height += g_height;
			g_previous += g_height + self.groups.gap;
		});
		
		self.height = g_previous;
	};
	
	this.compute = function(width, profiles) {
		self.width		= width;
		self.middle 	= Math.round(width / 2);
		
		self.column = {
			left:		self.middle - self.groups.column_width / 2,
			right:		self.middle + self.groups.column_width / 2,
			threshold:	Math.round(.15 * (self.middle - self.groups.column_width / 2)) // Math.round(3 * width / 16) // ⅜ width + ¼
		};
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
function dash_p2s(points) {
	var result = "";

	for (var i = points.length - 2; i >= 0; i -= 2) {
		result = points[i] + "," + points[i+1] + " " + result;
	};

	return result;
}

/**
 *	Number to factor times
 */
function dash_unit(f, u) {
	if (f.unity == 'ms')
		return Math.round(u /100) / 10 + ' s';
	else if (f.unity) {
		return u + ' ' + f.unity;
	} else {
		return u;
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
			.attr('class', "svg-sequence");
		var group = svg.append("g");
		
		// Items
		var itemProfile = group.append("rect")
			.attr('class', "svg-duration")
			.attr("y", 0)
			.attr("height", layout.graph.height -1);
		var itemGap = group.append("polygon")
			.attr('class', "svg-gap");
		var itemLabel = group.append("text")
			.attr('class', "svg-label")
			.attr("y", layout.graph.height / 2)
			.attr("text-anchor", 'middle')
			.attr("alignment-baseline", 'central')
			.attr("dominant-baseline", 'central');
		
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
				.text('duration: ' + (Math.round(profiles[pIndex].data.dash.info.duration / 100) / 10) + ' sec');
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
			.attr('class', "svg-profiling");
		var group = svg.append("g").attr('class', "svg-dataset");
		
		// Scales
		var scaleX = d3.scale.linear();
		
		// Title
		svg.append("text")
			.attr('class', "svg-text-hover svg-title")
			.attr("x", 4)
			.attr("y", layout.height / 2)
			.attr("text-anchor", "start")
			.attr("alignment-baseline", 'central')
			.attr("dominant-baseline", 'central')
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
				.attr('class', "svg-data")
				.attr("points", dash_p2s(points))
				.attr("fill", v.colours.n)
				.attr('stroke-width', 1);
		}
		
		// Select
		var enter = function enter() {
			group.select('.svg-data').attr("fill", v.colours.g);
		}
		
		// Unselect
		var leave = function leave() {
			group.select('.svg-data').attr("fill", v.colours.n);
		}
		
		
		// Binds
		scope.$watch(function() { return container.clientWidth * profiles[pIndex].id; }, redraw);
		//element.on('mouseenter', enter);
		//element.on('mouseleave', leave);
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
		var gauges = scope.category.gauges;
		var profiles = scope.selectedProfiles;
		
		// Initialize
		layout.initialize(gauges);
		
		// DOM
		d3.select(container).style('background', 'transparent');
		var svg = d3.select(container).append('svg')
			.attr('class', "svg-gauges")
			.attr('height', layout.height);
		var group1 = svg.append("g").attr('class', "svg-dataset");
		var group2 = svg.append("g").attr('class', "svg-dataset svg-item-2");
		var groupC = svg.append("g").attr('class', "svg-labels");
		var groupP = [group1, group2];
		
		// Scales
		var scales = [d3.scale.linear().domain([0, 100, 1000]), d3.scale.linear().domain([0, 100, 1000])];
		
		// Draw
		gauges.forEach(function(gauge, gauge_index) {
			// Starting point
			/*
			groupC.append("line")
				.attr('class', "svg-line svg-start svg-item-1")
				.attr("x1", 0).attr("x2", 0)
				.attr("y1", layout.gauge[gauge_index].top).attr("y2", layout.gauge[gauge_index].bottom);
			groupC.append("line")
				.attr('class', "svg-line svg-start svg-item-2")
				.attr("x1", layout.groups.column_width).attr("x2", layout.groups.column_width)
				.attr("y1", layout.gauge[gauge_index].top).attr("y2", layout.gauge[gauge_index].bottom);
			*/
			
			// Facets
			gauge.forEach(function(facet, facet_index) {
				// Label
				groupC.append("text")
					.attr('class', "svg-label")
					.attr("x", layout.groups.column_width / 2)
					.attr("y", layout.gauge[gauge_index].facet[facet_index] + layout.groups.row_height / 2)
					.attr("text-anchor", 'middle')
					.attr("alignment-baseline", 'central')
					.attr("dominant-baseline", 'central')
					.attr("fill", facet.colours.n)
					.text(facet.label);
				
				// Indicators
				groupP.forEach(function(group, group_index) {
					// Bar OK
					group.append("rect")
						.attr('class', "svg-data svg-data-ok svg-data-" + gauge_index + "-" + facet_index)
						.attr('x', 0)
						.attr("y", layout.gauge[gauge_index].facet[facet_index] + 1)
						.attr("height", layout.groups.row_height - 2)
						.attr("fill", facet.colours.g);
					
					// Bar KO
					group.append("rect")
						.attr('class', "svg-data svg-data-ko svg-data-" + gauge_index + "-" + facet_index)
						.attr('x', 0)
						.attr("y", layout.gauge[gauge_index].facet[facet_index] + 1)
						.attr("height", layout.groups.row_height - 2)
						.attr("fill", facet.colours.n);
					
					// Label - title
					group.append("text")
						.attr('class', "svg-label svg-label-title svg-data-" + gauge_index + "-" + facet_index)
						.attr("y", layout.gauge[gauge_index].facet[facet_index] + layout.groups.row_height / 2)
						.attr("text-anchor", group_index == 0 ? 'end' : 'start')
						.attr("alignment-baseline", 'central')
						.attr("dominant-baseline", 'central')
						.attr("fill", facet.colours.n);
					
					// Label - unit
					group.append("text")
						.attr('class', "svg-label svg-label-unit svg-data-" + gauge_index + "-" + facet_index)
						.attr("y", layout.gauge[gauge_index].facet[facet_index] + layout.groups.row_height / 2)
						.attr("text-anchor", 'middle')
						.attr("alignment-baseline", 'central')
						.attr("dominant-baseline", 'central')
						.attr("fill", facet.colours.h);
				});
			});
			
			// Threshold
			groupP.forEach(function(group) {
				group.append("line")
					.attr('class', "svg-line svg-threshold")
					.attr("y1", layout.gauge[gauge_index].top).attr("y2", layout.gauge[gauge_index].bottom);
			});
		});
		
		// Redraw
		function repaint() {
			// Params
			var has2Profiles = profiles.length == 2;
			
			// Sizes
			layout.compute(container.clientWidth, profiles);
			scales[0].rangeRound([layout.column.left, layout.column.left - layout.column.threshold, 0]);
			if (has2Profiles) scales[1].rangeRound([0, layout.column.threshold, layout.column.left]);

			// SVG
			svg.attr('width', layout.width);
			
			// Handle profiles
			svg.selectAll(".svg-item-2").attr("visibility", has2Profiles ? 'visible' : 'hidden');
			
			// Moves
			groupC.attr("transform", "translate(" + layout.column.left + ",0)");
			group2.attr("transform", "translate(" + layout.column.right + ",0)");
			group1.selectAll(".svg-threshold").attr("x1", layout.column.left - layout.column.threshold).attr("x2", layout.column.left - layout.column.threshold)
			if (has2Profiles) group2.selectAll(".svg-threshold").attr("x1", layout.column.threshold).attr("x2", layout.column.threshold)
			
			// Adapt
			var value;
			var xs = [0, 100, 0];
			gauges.forEach(function(gauge, gauge_index) {
				gauge.forEach(function(facet, facet_index) {
					profiles.forEach(function(profile, profile_index) {
						// Positions of bars (near to far)
						value = profile.data.dash.gauges[facet.attr].g;
						xs[0] = scales[profile_index]((facet.shift) ? 100 : Math.max(100 - value, 0));
						xs[1] = scales[profile_index](100);
						xs[2] = scales[profile_index]((facet.shift) ? value + 100 : Math.max(value, 100));
						
						// Bars OK
						groupP[profile_index].selectAll('.svg-data-ok.svg-data-' + gauge_index + '-' + facet_index)
							.attr('x', (profile_index == 0) ? xs[1] : xs[0])
							.attr("width", (profile_index == 0) ? xs[0] - xs[1] : xs[1] - xs[0]);
						
						// Bars KO
						groupP[profile_index].selectAll('.svg-data-ko.svg-data-' + gauge_index + '-' + facet_index)
							.attr('x', (profile_index == 0) ? xs[2] : xs[1])
							.attr("width", (profile_index == 0) ? xs[1] - xs[2] : xs[2] - xs[1]);
							
						// Label - title
						groupP[profile_index].selectAll('.svg-label-title.svg-data-' + gauge_index + '-' + facet_index)
							.attr('x', (profile_index == 0) ? xs[2] - 2 : xs[2] + 2)
							.text(profile.data.dash.gauges[facet.attr].l);
					
						// Label - unit
						groupP[profile_index].selectAll('.svg-label-unit.svg-data-' + gauge_index + '-' + facet_index)
							.attr('x', (profile_index == 0) ? (xs[0] + xs[2]) / 2 : (xs[2] + xs[0]) / 2)
							.text(dash_unit(facet, profile.data.dash.gauges[facet.attr].u));
					});
				});
			});
		}
		
		scope.$watch(function() { return container.clientWidth * profiles.length * profiles[0].id; }, repaint);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});