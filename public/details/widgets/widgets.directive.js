/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/

/**
 * Constants
 */
var LAYOUT_FH_BAND = 40;
var LAYOUT_FH_NORMAL = 80;

/**
 * Layout for graphs
 */
var graphLayout = function(favoriteHeight) {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	// Constants
	this.padding	= { top: 10, right: 20, bottom: 10, left: 60, inner: 4 };
	this.profile	= { favoriteHeight: favoriteHeight };
	this.xAxis		= { height: 10, text: 8, textShift: 8, arrow: 8, arrowShift: 4 };
	this.vAxis		= { fontSize: 10, profileFontSize: 12 };

	// Compute
	this.refresh = function(container, profiles, callback) {
		self.width =	container.clientWidth;
		self.height	=	self.padding.top + (self.profile.favoriteHeight + self.padding.inner) * profiles.length + self.xAxis.height + self.padding.bottom;

		self.profile.x =		self.padding.left;
		self.profile.y =		[null, null];
		self.profile.y[0] =		self.padding.top;
		self.profile.y[1] =		self.padding.top + self.profile.favoriteHeight + self.padding.inner * 2 + self.xAxis.height;
		self.profile.width =	self.width - self.padding.left - self.padding.right;
		self.profile.height =	self.profile.favoriteHeight;
		self.profile.left =		0;
		self.profile.right =	self.width - self.padding.left - self.padding.right;
		self.profile.top =		0;
		self.profile.bottom =	self.profile.favoriteHeight;

		self.xAxis.x =		self.padding.left;
		self.xAxis.y =		self.padding.top + self.profile.favoriteHeight + self.padding.inner;
		self.xAxis.left =	0; 
		self.xAxis.right =	self.width - self.padding.left - self.padding.right;

		self.vAxis.x =		0;
		self.vAxis.y =		self.profile.y;
		self.vAxis.width =	self.padding.left;
		self.vAxis.height =	self.profile.height;

		if (callback !== undefined) callback();
	};
};

/**
 * Meta (parameters)
 */
var graphMeta = function(scope, attributes, mirror, canOverflow) {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	// Save params
	this.scope =		scope;

	// Common
	this.begin =		NaN;		// When the user selection starts
	this.end =			NaN;		// When the user selection ends (could be before or after timeMax)
	this.duration =		NaN;		// Duration of the user selection

	// Common
	this.ends =			[NaN, NaN];	// When profiles ends (could be before or after timeMax)
	this.durations =	[NaN, NaN];	// Duration of profiles
	this.steps =		[NaN, NaN];	// Time step of profiles

	// Parameters
	this.mirror =		(mirror !== undefined) ? mirror : false;
	this.canOverflow =	(canOverflow !== undefined) ? canOverflow : false;

	// Value axis
	this.vExpected =	[NaN, NaN];		// if there is an expected value, which value ?
	this.vMinDisplay =	[NaN, NaN];		// which is the minimum value to display ?
	this.vStep =		[NaN, NaN];		// what is the step to display the ticks on the axis ?
	this.vOverflow =	[NaN, NaN];		// Possible overflow by first and second profile

	// On demand
	['calibration', 'crenellate'].forEach(function(a) {
		if (attributes.hasOwnProperty(a))
			try { self[a] = JSON.parse(attributes[a]) } catch(e) { self[a] = attributes[a] };
	});


	this.refresh		= function(r) {
		self.begin =	self.scope.selection.begin;
		self.end =		self.scope.selection.end;
		self.duration =	self.end - self.begin;

		self.ends[0] =		Math.min(self.scope.selection.end, r.profiles[0].currentData.info.duration);
		self.durations[0] =	Math.max(0, self.ends[0] - self.begin);
		self.steps[0] =	r.profiles[0].currentData.info.timeStep;

		if (r.profiles[1] != null) {
			self.ends[1] =		Math.min(self.scope.selection.end, r.profiles[1].currentData.info.duration);
			self.durations[1] =	Math.max(0, self.ends[1] - self.begin);
			self.steps[1] =	r.profiles[1].currentData.info.timeStep;
		}
	}
};


/**********************************************************/
/*														  */
/*	Common directive mecanisms							  */
/*														  */
/**********************************************************/

/**
 * Init directive
 */
function directive_init(scope, element, attrs, layoutType, mirror, canOverflow) {
	// Layout
	var container =	element[0];
	var layout =	new graphLayout(layoutType);

	// Attributes
	var deck =		scope.widget.deck.graph;
	var meta =		new graphMeta(scope, attrs, mirror, canOverflow);

	// Data
	var profiles =	scope.profiles;

	// Canvas
	var svg =		d3.select(container).append('svg');

	// Scales
	var scaleX =	d3.scale.linear();
	var scalesV =	[d3.scale.linear(), d3.scale.linear()];

	// Overflow
	var overflow =	(canOverflow) ? svg.append("g").attr("class", "svg-overflow") : svg;

	// Groups
	var groupAxisX =	overflow.append("g").attr("class", "svg-axis svg-axis-x");
	var groupP1 =		overflow.append("g").attr("class", "svg-profile svg-profile-1");
	var groupAxisV1 =	overflow.append("g").attr("class", "svg-axis svg-axis-v svg-profile-1");
	var groupP2 =		overflow.append("g").attr("class", "svg-profile svg-profile-2");
	var groupAxisV2 =	overflow.append("g").attr("class", "svg-axis svg-axis-v svg-profile-2");


	return {
		scope:		scope,
		container:	container,
		layout:		layout,
		deck:		deck,
		settings:	scope.widget.settings,
		meta:		meta,
		profiles:	profiles,
		svg:		svg,
		scaleX:		scaleX,
		scalesV:	scalesV,
		groupO:		overflow,
		groupX:		groupAxisX,
		groupV:		[groupAxisV1, groupAxisV2],
		groupP:		[groupP1, groupP2],
		iData:		null,
		iSelection:	[null, null]
	};
}

/**
 * Repaint - container
 */
function directive_repaint_container(r) {
	// Parameters - Data
	r.meta.refresh(r);
	r.iData = [null, null];

	// Sizes
	r.layout.refresh(r.container, r.profiles);

	// Sizes - container
	d3.select(r.container)
		.style('height', r.layout.height + 'px')
		.style('background', 'transparent');
	r.svg.attr({width: r.layout.width, height: r.layout.height});

	// Clean axis
	r.groupV[0].attr("transform", "translate(" + r.layout.vAxis.x + "," + r.layout.vAxis.y[0] + ")");
	r.groupV[1].attr("transform", "translate(" + r.layout.vAxis.x + "," + r.layout.vAxis.y[1] + ")");

	// Clean groups
	r.groupP[0].attr("transform", "translate(" + r.layout.profile.x + "," + r.layout.profile.y[0] + ")");
	r.groupP[1].attr("transform", "translate(" + r.layout.profile.x + "," + r.layout.profile.y[1] + ")");

	// Clean selection
	directive_unselect(r);

	// Overflow
	if (r.meta.canOverflow) {
		r.meta.vOverflow = [0, 0];
		r.groupO.attr("transform", null);
	}
}

/**
 * Repaint - scales
 */
function directive_repaint_scales(r, vData, vData2) {
	// Scales - domains (data)
	r.scaleX.domain([r.meta.begin, r.meta.end]);
	r.scalesV[0].domain(vData);
	r.scalesV[1].domain((vData2 !== undefined) ? vData2 : vData);

	// Scales - domains (coordinates)
	r.scaleX.rangeRound([r.layout.profile.left, r.layout.profile.right]);
	r.scalesV[0].rangeRound([r.layout.profile.bottom, r.layout.profile.top]);
	if (r.meta.mirror) r.scalesV[1].rangeRound([r.layout.profile.top, r.layout.profile.bottom]); else r.scalesV[1].rangeRound([r.layout.profile.bottom, r.layout.profile.top]);
}

/**
 * Repaint - container
 */
function directive_repaint_post(r) {
	// Overflow
	if (r.meta.canOverflow) {

		// Top (profile 1)
		if (r.meta.vOverflow[0] > 0) {
			r.groupO.attr("transform", "translate(0," + r.meta.vOverflow[0] + ")");
		}

		// Top (profile 2)
		if (r.meta.vOverflow[1] > 0 && ! r.meta.mirror) {
			r.group1.attr("transform", "translate(0," + r.meta.vOverflow[1] + ")");
		}

		// Top & Bottom (both profiles)
		d3.select(r.container).style('height', (r.layout.height + r.meta.vOverflow[0] + r.meta.vOverflow[1]) + 'px');
		r.svg.attr('height', r.layout.height + r.meta.vOverflow[0] + r.meta.vOverflow[1]);
	}
}

/**
 * Repaint - Bind
 */
function directive_bind(scope, element, r, repaint, select, settings) {
	scope.$watch(function() { return r.container.clientWidth; }, repaint);
	scope.$watch(function() { return r.settings.version; }, settings);
	scope.$on('xEvent', function(event, x) {
		if (isNaN(x)) {
			directive_unselect(r);
		} else {
			select(x);
		}
	});

	element.on('mousemove', function(event) { scope.mouseOver(event, r); });
	element.on('mouseleave', function(event) { scope.mouseLeave(event, r); });
}

/**
 * Repaint - XAxis
 */
function directive_repaint_xAxis(r) {
	// Clean
	r.groupX
		.attr("transform", "translate(" + r.layout.xAxis.x + "," + r.layout.xAxis.y + ")")
		.selectAll("*").remove();

	// Box
	var points = [
		-r.layout.xAxis.arrowShift - r.layout.xAxis.arrow, 0,
		r.layout.xAxis.arrowShift + r.layout.xAxis.right, 0,
		r.layout.xAxis.arrowShift + r.layout.xAxis.right + r.layout.xAxis.arrow, r.layout.xAxis.height / 2,
		r.layout.xAxis.arrowShift + r.layout.xAxis.right, r.layout.xAxis.height,
		-r.layout.xAxis.arrowShift - r.layout.xAxis.arrow, r.layout.xAxis.height,
		-r.layout.xAxis.arrowShift, r.layout.xAxis.height / 2,
	];
	r.groupX.append("polygon")
		.attr("points", p2s(points))
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
			.attr("text-anchor", function(d, i) { return (i == lastIndex) ? "end" : "middle"; })
			.attr("font-size", r.layout.xAxis.text + "px")
			.attr("fill", "#FFFFFF")
			.text(function (d) { return d});
}

/**
 * Repaint - VAxis
 */
function directive_repaint_VAxis(r, index, valueFunction) {
	// Limit - Clean
	r.groupV[index].selectAll("*").remove();

	// Length
	var vMax;
	if (index == 1 && r.meta.canOverflow) {
		vMax = r.scalesV[index].invert(r.layout.profile.height + r.meta.vOverflow[index]);
	} else {
		vMax = r.scalesV[index].invert(- r.meta.vOverflow[index]);
	}

	for (var v = r.meta.vStep[index]; v < vMax; v += r.meta.vStep[index]) {
		// Tick
		r.groupV[index].append("line")
				.attr("class", "svg-line")
				.attr("x1", r.layout.vAxis.width).attr("x2", r.layout.vAxis.width - 4)
				.attr("y1", r.scalesV[index](v)).attr("y2", r.scalesV[index](v))
				.attr('stroke', (v == r.meta.vExpected[index]) ? r.deck.limit.fcolor : '#000000')
				.attr('stroke-width', (v == r.meta.vExpected[index]) ? 3 : 1)
				.attr('fill', 'none');

		// Text
		r.groupV[index].append("text")
			.attr("class", "svg-text")
			.attr("y", r.scalesV[index](v) + 3)
			.attr("x", r.layout.vAxis.width - 6)
			.attr("text-anchor", "end")
			.attr("font-size", r.layout.vAxis.fontSize + "px")
			.attr("font-weight", (v == r.meta.vExpected[index]) ? 'bold' : 'normal')
			.attr("fill", (v == r.meta.vExpected[index]) ? r.deck.limit.fcolor : '#000000')
			.text((valueFunction !== undefined) ? valueFunction(v, index) : v);

		// Limit line
		if (v == r.meta.vExpected[index])
			r.groupV[index].append("line")
				.attr("class", "line")
				.attr("x1", r.layout.profile.x + r.scaleX(r.meta.begin))
				.attr("x2", r.layout.profile.x + r.scaleX(r.meta.ends[index]))
				.attr("y1", r.scalesV[index](r.meta.vExpected[index]))
				.attr("y2", r.scalesV[index](r.meta.vExpected[index]))
				.attr('stroke', r.deck.limit.fcolor)
				.attr('stroke-width', 3)
				.attr('stroke-dasharray', '5, 3');
	};

	// Line
	/*var points = [
		r.layout.vAxis.width - 4,	r.scalesV[index](vMax) + ((index == 0) ? -2 : 2),
		r.layout.vAxis.width,		r.scalesV[index](vMax) + ((index == 0) ? -5 : 5),
		r.layout.vAxis.width + 2,	r.scalesV[index](vMax) + ((index == 0) ? -2 : 2),
	];*/
	r.groupV[index].append("line")
			.attr("class", "svg-line")
			.attr("x1", r.layout.vAxis.width).attr("x2", r.layout.vAxis.width)
			.attr("y1", r.scalesV[index](0))
			.attr("y2", r.scalesV[index](vMax) + ((index == 0) ? -5 : 5))
			.attr('stroke', '#000000')
			.attr('stroke-width', 3);
	r.groupV[index].append("line")
			.attr("class", "svg-arrow")
			.attr("x1", r.layout.vAxis.width).attr("x2", r.layout.vAxis.width)
			.attr("y1", r.scalesV[index](vMax) + ((index == 0) ? -5 : 5))
			.attr("y2", r.scalesV[index](vMax) + ((index == 0) ? -7 : 7))
			.attr('stroke', '#000000')
			.attr('stroke-width', 1);
	/*r.groupV[index].append("polyline")
			.attr("class", "svg-arrow")
			.attr("points", p2s(points))
			.attr('stroke', '#000000')
			.attr('stroke-width', 1);*/

	// Profile label
	r.groupV[index].append("text")
		.attr("class", "svg-text svg-profile-label")
		.attr("text-anchor", (index == 0) ? "start" : "end")
		.attr("font-size", r.layout.vAxis.profileFontSize + "px")
		.attr("font-weight", "bold")
		.attr("fill", '#000000')
		.attr("transform", (index == 0) ? ("translate(" + r.layout.vAxis.profileFontSize + "," + (r.layout.vAxis.height) + ")rotate(270)") : ("translate(" + r.layout.vAxis.profileFontSize + "," + 0 + ")rotate(270)"))
		.text(r.profiles[index].label);
}

/**
 * Select - clean and unselect
 */
function directive_unselect(r) {
	r.svg.selectAll(".svg-selection").remove();
	r.iSelection = [null, null];
	r.meta.lastSelectID = null;
}



/**********************************************************/
/*														  */
/*	Utilities											  */
/*														  */
/**********************************************************/

/**
 * Array of points to string
 */
function p2s(points, returnPoints) {
	var result = "";

	for (var i = points.length - 2; i >= 0; i -= 2) {
		result = points[i] + "," + points[i+1] + " " + result;
	};

	if (returnPoints != undefined) {
		for (var i = returnPoints.length - 2; i >= 0; i -= 2) {
			result += returnPoints[i] + "," + returnPoints[i+1] + " ";
		};
	}

	return result;
}

/**
 * Round value by a 'round' pad
 */
function rV(v, round) {
	return Math.round(v / round) * round;
}

/**
 *	Number to factor times
 */
function n2ft(v) {
	switch(v) {
		case 0.25:	return '¼';
		case 0.5:	return '½';
		case 0.75:	return '¾';
		default:	return v + '×';
	}
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
		var r = directive_init(scope, element, attrs, LAYOUT_FH_BAND, true, true);

		// Enhance meta
		r.meta.v = r.deck.v[0];
		r.meta.lastSelectID = null;

		// Meta - settings
		r.meta.pixelGroup = r.settings.pixelGroup;

		// Meta - settings
		r.meta.vExpected =		[1, 1];
		r.meta.vMinDisplay =	[2, 2];
		r.meta.vStep =			[1, 1];
		
		// Meta - layout Y (arbitrary)
		r.meta.d_expected = [];
		r.meta.d_minLimit = [];

		// Meta - Calibration
		r.meta.calibrations = [];
		r.profiles.forEach(function(profile, i) {
			r.meta.calibrations.push(profile.hardware.calibration[r.meta.calibration] * profile.hardware.data.threads);
			r.meta.d_expected.push(profile.hardware.calibration[r.meta.calibration] * profile.hardware.data.threads * r.meta.vExpected[i]);
			r.meta.d_minLimit.push(profile.hardware.calibration[r.meta.calibration] * profile.hardware.data.threads * r.meta.vMinDisplay[i]);
		});

		// Enhance layout

		// Redraw
		function repaint() {
			// Repaint container
			directive_repaint_container(r);

			// Computation
			var xMax = r.layout.profile.width;
			var xStep = r.meta.pixelGroup;
			var tStep = r.meta.duration / (xMax / xStep);

			// vScale label
			function vScaleLabel(v) {
				return v + '×';
			}
			
			// Repaint scales
			directive_repaint_scales(r, [0, tStep * r.meta.d_minLimit[0]], [0, tStep * r.meta.d_minLimit[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);

			// Draw
			var dataList, internalData, points;
			var v_currentLimit, v_minLimit;
			r.profiles.forEach(function(profile, index) {
				if (! profile.currentData.hasOwnProperty(r.meta.v.cat)) console.log("!! -- !! Fail current data !! -- !!", profile, r.meta.v.cat);

				// vars
				dataList = profile.currentData[r.meta.v.cat].list;
				v_minLimit = r.scalesV[index](tStep * r.meta.d_minLimit[1]);

				// Data - Clean
				r.groupP[index].selectAll("*").remove();

				// Data - points
				points = "0," + r.scalesV[index](0);

				// Data - vars
				var x = 0;
				var d = 0; var dMax = dataList.length;
				var count, v_count;
				internalData = [];

				// Data - loop
				while (x < xMax) {
					// Reset
					count = 0;

					// Count events
					while (d < dMax && dataList[d] <= x + xStep) {
						count++;
						d++;
					}
					internalData.push(count);

					v_count = r.scalesV[index](count);

					points += " " + x + "," + v_count;
					points += " " + Math.min(x + xStep, xMax) + "," + v_count;

					r.meta.vOverflow[index] = Math.max(r.meta.vOverflow[index], Math.pow(-1, index) * (v_minLimit - v_count));

					// Next loop
					x += xStep;
				}

				// Data - points
				points += " " + Math.min(x, xMax) + "," + r.scalesV[index](0);
				r.iData[index] = internalData;

				// Data - draw
				r.groupP[index].append("polygon")
					.attr("points", points)
					.attr("fill", r.meta.v.color);

				// Value axis
				//directive_repaint_VAxis(r, index, vScaleLabel);

				// Limit - Clean
				r.groupV[index].selectAll("*").remove();

				// Limit - Loop
				var yPosition;
				for (var l = Math.floor(2 * (r.layout.profile.height + r.meta.vOverflow[index] - r.layout.vAxis.fontSize) / r.layout.profile.height); l > 0; l--) {
					yPosition = r.scalesV[index](tStep * r.meta.d_expected[index] * l);

					// Limit abel
					r.groupV[index].append("text")
						.attr("class", "svg-text svg-limit svg-limit-" + l)
						.attr("x", r.layout.vAxis.width - 4)
						.attr("y", yPosition + 3)
						.attr("text-anchor", "end")
						.attr("font-size", r.layout.vAxis.fontSize + "px")
						.attr("font-weight", "bold")
						.text(l + "×");

					// Limit line
					r.groupV[index].append("line")
						.attr("class", "svg-line svg-limit svg-limit-" + l)
						.attr('stroke', "#000000")
						.attr('stroke-width', 1)
						.attr('stroke-dasharray', 3.1)
						.attr("x1", r.layout.vAxis.width - 2)
						.attr("x2", r.layout.vAxis.width + r.layout.profile.width + 4)
						.attr("y1", yPosition)
						.attr("y2", yPosition);
				};
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(x) {
			// Time ID
			var tID = Math.floor(x / r.meta.pixelGroup);
			if (tID == r.meta.lastSelectID) {
				return;
			} else {
				r.meta.lastSelectID = tID;
			}

			// Loop
			var points;
			for (var index = 0; index < r.profiles.length; index++) {
				// Precondition (not paint => failure on repaint method)
				if (r.iData[index] == null) break;

				// Compute points
				points =
					(tID * r.meta.pixelGroup) + "," + r.scalesV[index](0) + " " +
					(tID * r.meta.pixelGroup) + "," + r.scalesV[index](r.iData[index][tID]) + " " +
					Math.min((tID + 1) * r.meta.pixelGroup, r.layout.profile.width) + "," + r.scalesV[index](r.iData[index][tID]) + " " +
					Math.min((tID + 1) * r.meta.pixelGroup, r.layout.profile.width) + "," + r.scalesV[index](0);

				// Draw points
				if (r.iSelection[index] != null) {
					r.iSelection[index].attr("points", points);
				} else {
					r.iSelection[index] = r.groupP[index].append("polygon")
						.attr("class", "svg-selection")
						.attr("points", points)
						.attr("fill", r.meta.v.fcolor);
				}
			};
		}
		
		// Settigns changes
		function settings() {
			if (typeof r.settings.pixelGroup != 'undefined' && r.settings.pixelGroup != r.meta.pixelGroup) {
				r.meta.pixelGroup = r.settings.pixelGroup;
				repaint();
			}
		}

		// Bind
		directive_bind(scope, element, r, repaint, select, settings);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});


/**
 * Thread states
 */
app.directive('chartThreadStates', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartThreadStates ==");

		// Init vars
		var r = directive_init(scope, element, attrs, LAYOUT_FH_NORMAL, true, true);

		// Enhance meta
		r.meta.cores = [];
		r.meta.rounds = [];
		r.profiles.forEach(function(profile, i) {
			r.meta.cores.push(profile.hardware.data.threads);
			r.meta.vExpected[i] = profile.hardware.data.threads * profile.currentData.info.timeStep;
			r.meta.vMinDisplay[i] = (profile.hardware.data.threads + 1) * profile.currentData.info.timeStep;
			r.meta.vStep[i] = r.meta.vExpected[i] / profile.hardware.data.cores; // by 100 for 8 cores ; by 50 for 4 cores
			r.meta.rounds[i] = r.meta.vExpected[i] / profile.hardware.data.threads;
		});

		// Meta - settings
		r.meta.crenellate = r.settings.crenellate;

		// Enhance layout

		// Crenellate
		function vAxisLabel(v, index) {
			if (v == r.meta.vExpected[index]) {
				return 'CPU';
			} else if (r.meta.crenellate && v < r.meta.vExpected[index]) {
				return 'core';
			} else {
				return n2ft(v / r.meta.vExpected[index]);
			}
		}

		// Redraw
		function repaint() {
			// Repaint container
			directive_repaint_container(r);

			// Vars
			var capacity = r.meta.cores[0];

			// Repaint scales
			directive_repaint_scales(r, [0, r.meta.vMinDisplay[0]], [0, r.meta.vMinDisplay[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);

			// Main draw
			var dataList, iData, pointsC, pointsR, pointsBY;
			var coordinates, valueR, valueYB;
			r.profiles.forEach(function(profile, index) {
				if (! profile.currentData.hasOwnProperty(r.deck.v[0].cat)) console.log("!! -- !! Fail current data !! -- !!", profile, r.deck.v[0].cat);

				// vars
				dataList = profile.currentData[r.deck.v[0].cat];
				iData = [];

				// All - points - start
				pointsC = [r.scaleX(r.meta.begin), r.scalesV[index](0)];
				pointsR = (r.meta.upsidedown) ? [r.scaleX(r.meta.begin), r.scalesV[index](r.meta.vExpected[index])] : [r.scaleX(r.meta.begin), r.scalesV[index](0)];
				pointsBY = [r.scaleX(r.meta.begin), r.scalesV[index](r.meta.vExpected[index])];

				// All - points - capacity
				pointsC.push.apply(pointsC, [r.scaleX(r.meta.begin), r.scalesV[index](r.meta.vExpected[index]), r.scaleX(r.meta.ends[index]), r.scalesV[index](r.meta.vExpected[index])]);

				// All - points - data
				dataList.forEach(function(frame) {
					if (frame.t >= r.meta.begin && frame.t < r.meta.ends[index]) {
						// Values
						valueR = frame.r;
						valueYB = frame.yb;

						// upsidedown
						if (r.meta.upsidedown) {
							valueR = r.meta.vExpected[index] - valueR;
						}

						// Crenallate
						if (r.meta.crenellate) {
							valueR = rV(valueR, r.meta.rounds[index]);
							valueYB = rV(valueYB, r.meta.rounds[index]);
						}

						coordinates = [r.scaleX(frame.t), r.scaleX(frame.t + r.meta.steps[index]), r.scalesV[index](valueR), r.scalesV[index](valueYB + r.meta.vExpected[index])];
						iData.push(coordinates);

						pointsR.push.apply(pointsR, [coordinates[0], coordinates[2], coordinates[1], coordinates[2]]);
						pointsBY.push.apply(pointsBY, [coordinates[0], coordinates[3], coordinates[1], coordinates[3]]);

						if (index == 1 && r.meta.mirror)
							r.meta.vOverflow[1] = Math.max(r.meta.vOverflow[1], coordinates[3] - r.layout.profile.height);
						else {
							r.meta.vOverflow[index] = Math.max(r.meta.vOverflow[index], 0 - coordinates[3]);
						}
					}
				});
				r.iData[index] = iData;

				// All - points - end
				pointsC.push.apply(pointsC, [r.scaleX(r.meta.ends[index]), r.scalesV[index](0)]);
				pointsR.push.apply(pointsR, (r.meta.upsidedown) ? [r.scaleX(r.meta.ends[index]), r.scalesV[index](r.meta.vExpected[index])] : [r.scaleX(r.meta.ends[index]), r.scalesV[index](0)]);
				pointsBY.push.apply(pointsBY, [r.scaleX(r.meta.ends[index]), r.scalesV[index](r.meta.vExpected[index])]);

				// Clean
				r.groupP[index].selectAll("*").remove();

				// Draw - Capacity
				r.groupP[index].append("polygon")
					.attr("class", "svg-limit")
					.attr("points", p2s(pointsC))
					.attr("fill", r.deck.limit.color);

				// Draw - Running
				r.groupP[index].append("polygon")
					.attr("class", "svg-state-running")
					.attr("points", p2s(pointsR))
					.attr("fill", r.deck.v[0].color)/*
					.attr('stroke', r.deck.v[0].fcolor)
					.attr('stroke-width', 1)*/;
				
				// Draw - Ready
				r.groupP[index].append("polygon")
					.attr("class", "svg-state-ready")
					.attr("points", p2s(pointsBY))
					.attr("fill", r.deck.v[1].color)/*
					.attr('stroke', r.deck.v[1].fcolor)
					.attr('stroke-width', 1)*/;

				// Value axis
				directive_repaint_VAxis(r, index, vAxisLabel);
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(x) {
			// Time ID
			var tIndex = Math.floor(r.scaleX.invert(x) / 50);
			if (tIndex == r.meta.lastSelectID) {
				return;
			} else {
				r.meta.lastSelectID = tIndex;
			}

			// Loop
			var pointsR, pointsBY;
			for (var index = 0; index < r.profiles.length; index++) {

				// All - points - start
				if (r.iData[index].length > tIndex) {
					pointsC = [r.iData[index][tIndex][0], r.iData[index][tIndex][2], r.iData[index][tIndex][0], r.scalesV[index](r.meta.vExpected[index]), r.iData[index][tIndex][1], r.scalesV[index](r.meta.vExpected[index]), r.iData[index][tIndex][1], r.iData[index][tIndex][2]];
					pointsR = [r.iData[index][tIndex][0], r.scalesV[index](0), r.iData[index][tIndex][0], r.iData[index][tIndex][2], r.iData[index][tIndex][1], r.iData[index][tIndex][2], r.iData[index][tIndex][1], r.scalesV[index](0)];
					pointsBY = [r.iData[index][tIndex][0], r.scalesV[index](r.meta.vExpected[index]), r.iData[index][tIndex][0], r.iData[index][tIndex][3], r.iData[index][tIndex][1], r.iData[index][tIndex][3], r.iData[index][tIndex][1], r.scalesV[index](r.meta.vExpected[index])];
				} else {
					pointsC = [];
					pointsR = [];
					pointsBY = [];
				}

				// Draw points
				if (r.iSelection[index] != null) {
					r.iSelection[index].select(".svg-limit").attr("points", p2s((r.meta.upsidedown) ? pointsR : pointsC));
					r.iSelection[index].select(".svg-state-running").attr("points", p2s((r.meta.upsidedown) ? pointsC : pointsR));
					r.iSelection[index].select(".svg-state-ready").attr("points", p2s(pointsBY));
				} else {
					r.iSelection[index] = r.groupP[index].append("g").attr("class", "svg-selection");

					// Draw - Capacity
					r.iSelection[index].append("polygon")
						.attr("class", "svg-limit")
						.attr("points", p2s((r.meta.upsidedown) ? pointsR : pointsC))
						.attr("fill", r.deck.limit.fcolor);

					// Draw - Running
					r.iSelection[index].append("polygon")
						.attr("class", "svg-state-running")
						.attr("points", p2s((r.meta.upsidedown) ? pointsC : pointsR))
						.attr("fill", r.deck.v[0].fcolor);
					
					// Draw - Ready
					r.iSelection[index].append("polygon")
						.attr("class", "svg-state-ready")
						.attr("points", p2s(pointsBY))
						.attr("fill", r.deck.v[1].fcolor);
				}
			}


		}
		
		// Settigns changes
		function settings() {
			var needToRepaint = false;

			if (r.meta.crenellate != r.settings.crenellate) {
				r.meta.crenellate = r.settings.crenellate;
				needToRepaint = true;
			}

			if (r.meta.upsidedown != r.settings.upsidedown) {
				r.meta.upsidedown = r.settings.upsidedown;
				needToRepaint = true;
			}

			if (needToRepaint)
				repaint();
		}

		// Bind
		directive_bind(scope, element, r, repaint, select, settings);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});




/**
 * Percentage
 */

app.directive('chartPercent', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartPercent ==");

		// Init vars
		var r = directive_init(scope, element, attrs, LAYOUT_FH_NORMAL, true, true);

		// Enhance meta
		r.meta.vExpected[0] =	100;	r.meta.vExpected[1] =	100;
		r.meta.vMinDisplay[0] =	110;	r.meta.vMinDisplay[1] =	110;
		r.meta.vStep[0] =		25;		r.meta.vStep[1] =		25;


		// Crenellate
		function vAxisLabel(v, index) {
			return v + ' %';
		}

		// Redraw
		function repaint() {
			// Repaint container
			directive_repaint_container(r);

			// Repaint scales
			directive_repaint_scales(r, [0, r.meta.vMinDisplay[0]], [0, r.meta.vMinDisplay[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);

			// Main draw
			var profileData, iData, yPositions;
			var tStep, tID, currentV, scaleVZero;
			r.profiles.forEach(function(profile, index) {
				// Clean
				r.groupP[index].selectAll("*").remove();

				// Var
				profileData = profile.currentData;

				// Points
				yPositions = [];
				r.iData[index] = [[]];
				for (var i = r.deck.v.length - 1; i >= 0; i--) {
					yPositions.push(NaN);
					r.iData[index].push([]);
				};

				// All - points - data
				tStep = profileData.info.timeStep;
				scaleVZero = r.scalesV[index](0);
				for (var t = r.meta.begin; t < r.meta.end; t += tStep) {
					tID = t / tStep;

					for (var v = 0; v < r.deck.v.length; v++) {
						if (profileData[r.deck.v[v].cat].hasOwnProperty(tID) && profileData[r.deck.v[v].cat][tID].hasOwnProperty(r.deck.v[v].attr))
							yPositions[v] = profileData[r.deck.v[v].cat][tID][r.deck.v[v].attr];
						else
							yPositions[v] = 0;

						if (v > 0)
							yPositions[v] += yPositions[v-1]; 

						r.iData[index][v + 1].push(r.scaleX(t), r.scalesV[index](yPositions[v]), r.scaleX(t + tStep), r.scalesV[index](yPositions[v]));
					};

					r.iData[index][0].push(r.scaleX(t), scaleVZero, r.scaleX(t + tStep), scaleVZero);
				};

				// Draw area
				for (var v = r.deck.v.length - 1; v >= 0; v--) {
					r.groupP[index].append("polygon")
						.attr("class", "svg-data svg-area svg-area-" + v)
						.attr("points", p2s(r.iData[index][v + 1], r.iData[index][v]))
						.attr("fill", r.deck.v[v].color);
				};

				// Value axis
				directive_repaint_VAxis(r, index, vAxisLabel);
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(x) {
			// Time ID
			var tIndex = Math.floor(r.scaleX.invert(x) / 50);
			if (tIndex == r.meta.lastSelectID) {
				return;
			} else {
				r.meta.lastSelectID = tIndex;
			}

			// Loop
			for (var index = 0; index < r.profiles.length; index++) {
				// Reuse
				if (r.iSelection[index] != null) {
					for (var v = r.deck.v.length - 1; v >= 0; v--) {
						r.iSelection[index].select(".svg-area-" + v).attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)));
					}
				}
				// Draw
				else {
					r.iSelection[index] = r.groupP[index].append("g").attr("class", "svg-selection");

					// Draw
					for (var v = r.deck.v.length - 1; v >= 0; v--) {
						r.iSelection[index].append("polygon")
							.attr("class", "svg-area svg-area-" + v)
							.attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)))
							.attr("fill", r.deck.v[v].fcolor);
					};
				}
			}
		}
		
		// Settigns changes
		function settings() {
			var needToRepaint = false;

			if (r.meta.crenellate != r.settings.crenellate) {
				r.meta.crenellate = r.settings.crenellate;
				needToRepaint = true;
			}

			if (r.meta.upsidedown != r.settings.upsidedown) {
				r.meta.upsidedown = r.settings.upsidedown;
				needToRepaint = true;
			}

			if (needToRepaint)
				repaint();
		}

		// Bind
		directive_bind(scope, element, r, repaint, select, settings);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});



/**
 * By unit
 */
app.directive('chartUnits', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartUnits ==");

		// Init vars
		var r = directive_init(scope, element, attrs, LAYOUT_FH_NORMAL, true, true);

		// Enhance meta
		r.meta.vExpected[0] =	r.deck.limit.value(r.profiles[0]);
		r.meta.vMinDisplay[0] =	r.meta.vExpected[0] + 2;
		r.meta.vStep[0] =		r.meta.vExpected[0];
		if (r.profiles[1] != null) {
			r.meta.vExpected[1] =	r.deck.limit.value(r.profiles[1]);
			r.meta.vMinDisplay[1] =	r.meta.vExpected[1] + 2;
			r.meta.vStep[1] =		r.meta.vExpected[1];
		}

		// Axis label
		function vAxisLabel(v, index) {
			if (v == r.meta.vExpected[index])
				return r.deck.limit.label;
			else
				return (v / r.meta.vExpected[0]) + '×';
		}

		// Redraw
		function repaint() {
			// Repaint container
			directive_repaint_container(r);

			// Repaint scales
			directive_repaint_scales(r, [0, r.meta.vMinDisplay[0]], [0, r.meta.vMinDisplay[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);

			// Main draw
			var profileData, iData, yPositions;
			var tStep, tID, currentV, scaleVZero, currentVIndexes;
			r.profiles.forEach(function(profile, index) {
				// Clean
				r.groupP[index].selectAll("*").remove();

				// Var
				profileData = profile.currentData;

				// Points
				dataSource_list = [];
				dataSource_length = [];
				dataSource_index = [];
				yPositions = [];
				r.iData[index] = [[]];
				for (var v = 0; v < r.deck.v.length; v++) {
					dataSource_list.push(profileData[r.deck.v[v].cat][r.deck.v[v].attr+'_list']);
					dataSource_length.push(profileData[r.deck.v[v].cat][r.deck.v[v].attr+'_list'].length);
					dataSource_index.push(0);
					yPositions.push(NaN);
					r.iData[index].push([]);
				};

				// All - points - data
				tStep = r.settings.timeGroup;
				scaleVZero = r.scalesV[index](0);
				for (var t = r.meta.begin; t < r.meta.end; t += tStep) {
					tID = t / tStep;

					for (var v = 0; v < r.deck.v.length; v++) {
						yPositions[v] = 0;

						while(dataSource_index[v] < dataSource_length[v] && dataSource_list[v][dataSource_index[v]] < (t + tStep)) {
							yPositions[v]++;
							dataSource_index[v]++;
						}

						if (v > 0)
							yPositions[v] += yPositions[v-1]; 

						r.iData[index][v + 1].push(r.scaleX(t), r.scalesV[index](yPositions[v]), r.scaleX(t + tStep), r.scalesV[index](yPositions[v]));
					};

					r.iData[index][0].push(r.scaleX(t), scaleVZero, r.scaleX(t + tStep), scaleVZero);
				};

				// Draw area
				for (var v = r.deck.v.length - 1; v >= 0; v--) {
					r.groupP[index].append("polygon")
						.attr("class", "svg-data svg-area svg-area-" + v)
						.attr("points", p2s(r.iData[index][v + 1], r.iData[index][v]))
						.attr("fill", r.deck.v[v].color);
				};

				// Value axis
				directive_repaint_VAxis(r, index, vAxisLabel);
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(x) {
			// Time ID
			/*
			var tIndex = Math.floor(r.scaleX.invert(x) / 50);
			if (tIndex == r.meta.lastSelectID) {
				return;
			} else {
				r.meta.lastSelectID = tIndex;
			}

			// Loop
			for (var index = 0; index < r.profiles.length; index++) {
				// Reuse
				if (r.iSelection[index] != null) {
					for (var v = r.deck.v.length - 1; v >= 0; v--) {
						r.iSelection[index].select(".svg-area-" + v).attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)));
					}
				}
				// Draw
				else {
					r.iSelection[index] = r.groupP[index].append("g").attr("class", "svg-selection");

					// Draw
					for (var v = r.deck.v.length - 1; v >= 0; v--) {<
						r.iSelection[index].append("polygon")
							.attr("class", "svg-area svg-area-" + v)
							.attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)))
							.attr("fill", r.deck.v[v].fcolor);
					};
				}
			}
			*/
		}
		
		// Settigns changes
		function settings() {
			if (r.meta.timeGroup != r.settings.timeGroup) {
				r.meta.timeGroup = r.settings.timeGroup;
				repaint();
			}
		}

		// Bind
		directive_bind(scope, element, r, repaint, select, settings);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});