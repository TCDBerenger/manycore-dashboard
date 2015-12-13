/* global app */
/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/

/**
 * Constants
 */
var LAYOUT_FH_NULL = 0;
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
	this.xAxis		= { height: 10, text: 6, textShift: 8, arrow: 8, arrowShift: 4 };
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
var graphMeta = function(scope, attributes, mirror, canOverflow, params, settings) {
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

	// On demand - params
	if (params)
		params.forEach(function(p) {
			try { self[p.property] = JSON.parse(p.value) } catch(e) { self[p.property] = p.value };
		});
	
	// On demand - settings
	settings.forEach(function(setting) {
		self[setting.property] = setting.value;
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
	var meta =		new graphMeta(scope, attrs, mirror, canOverflow, scope.widget.deck.params, scope.widget.deck.settings);
	
	// Plans modes
	var plan;
	if (scope.widget.deck.plans) {
		meta.plan = 0;
		plan = scope.widget.deck.plans[0];
		if (plan.property) meta[plan.property] = true;
	}
	
	// Widget
	meta.widget =	{ index: scope.iw };

	// Data
	var profiles =	scope.profiles;

	// Canvas
	var svg =		d3.select(container).append('svg').attr('class', 'svg-charts');

	// Scales
	var scaleX =	d3.scale.linear();
	var scalesV =	[d3.scale.linear(), d3.scale.linear()];

	// Overflow
	var overflow =	(canOverflow) ? svg.append("g").attr('class', "svg-overflow") : svg;

	// Groups
	var groupAxisX =	overflow.append("g").attr('class', "svg-axis svg-axis-x");
	var groupP1 =		overflow.append("g").attr('class', "svg-profile svg-profile-1");
	var groupAxisV1 =	overflow.append("g").attr('class', "svg-axis svg-axis-v svg-profile-1");
	var groupP2 =		overflow.append("g").attr('class', "svg-profile svg-profile-2");
	var groupAxisV2 =	overflow.append("g").attr('class', "svg-axis svg-axis-v svg-profile-2");


	return {
		scope:		scope,
		container:	container,
		layout:		layout,
		deck:		deck,
		data:		scope.widget.data,
		plans:		scope.widget.deck.plans,
		plan:		plan,
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
 * Focus - init
 */
function directive_focus_init(r, repeater) {
	var prefix;
	var valuedPins = [];
	
	
	// By profile
	r.profiles.forEach(function(profile, index) {
		prefix = 'pin-' + r.meta.widget.index + '-' + index + '-';
		
		// for melody
		if (r.deck.melody) {
			// Repeat
			for (var l = 0; l < repeater[index]; l++) {
				valuedPins.push({
					id: prefix + 'melody-' + l,
					l: (l == 0) ? r.deck.melody.label : '',
					f: r.deck.melody
				})
			}
		}
		
		
	})
	
	// Push pins
	r.scope.focusInitPins(valuedPins);
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
	r.groupV[0].attr('transform', 'translate(' + r.layout.vAxis.x + ',' + r.layout.vAxis.y[0] + ')');
	r.groupV[1].attr('transform', 'translate(' + r.layout.vAxis.x + ',' + r.layout.vAxis.y[1] + ')');

	// Clean groups
	r.groupP[0].attr('transform', 'translate(' + r.layout.profile.x + ',' + r.layout.profile.y[0] + ')');
	r.groupP[1].attr('transform', 'translate(' + r.layout.profile.x + ',' + r.layout.profile.y[1] + ')');

	// Clean selection
	directive_unselect(r);

	// Overflow
	if (r.meta.canOverflow) {
		r.meta.vOverflow = [0, 0];
		r.groupO.attr('transform', null);
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
	// Profile label
	r.profiles.forEach(function(profile, index) {
		r.groupV[index].append('text')
			.attr('class', "svg-text svg-profile-label")
			.attr('text-anchor', (index == 0) ? "start" : 'end')
			.attr('font-size', r.layout.vAxis.profileFontSize + 'px')
			.attr('font-weight', 'bold')
			.attr('fill', '#000000')
			.attr('transform', (index == 0) ? ('translate(' + r.layout.vAxis.profileFontSize + ',' + (r.layout.vAxis.height) + ")rotate(270)") : ('translate(' + r.layout.vAxis.profileFontSize + ',' + 0 + ")rotate(270)"))
			.text(profile.label);
	});
		
	// Overflow
	if (r.meta.canOverflow) {

		// Top (profile 1)
		if (r.meta.vOverflow[0] > 0) {
			r.groupO.attr('transform', "translate(0," + r.meta.vOverflow[0] + ')');
		}

		// Top (profile 2)
		if (r.meta.vOverflow[1] > 0 && ! r.meta.mirror) {
			r.group1.attr('transform', "translate(0," + r.meta.vOverflow[1] + ')');
		}

		// Top & Bottom (both profiles)
		d3.select(r.container).style('height', (r.layout.height + r.meta.vOverflow[0] + r.meta.vOverflow[1]) + 'px');
		r.svg.attr('height', r.layout.height + r.meta.vOverflow[0] + r.meta.vOverflow[1]);
	}
}

/**
 * Repaint - Bind
 */
function directive_bind(scope, element, r, repaint, select, addWidgetY) {
	// Size
	scope.$watch(function() { return r.container.clientWidth; }, repaint);
	
	// Properties
	scope.$watch(function() { return r.settings.version; }, function() {
		var needToRepaint = false;
		
		var property = r.settings.lastChangeProperty;
		
		if (r.meta[property] != r.settings[property]) {
			if (property == 'plan') {
				if (r.plan && r.plan.property) r.meta[r.plan.property] = false;
				r.meta.plan = r.settings.plan;
				r.plan = r.plans[r.settings.plan];
				if (r.plan && r.plan.property) r.meta[r.plan.property] = true;
			} else {
				r.meta[property] = r.settings[property];
			}
			needToRepaint = true;
		}
		
		if (needToRepaint)
			repaint();
	});

	// Selection TO controller
	// Mouse events are redirected to the controller for a global handling
	element.on('mousemove', function(event) { scope.mouseOver(event, r); });
	element.on('mouseleave', function(event) { scope.mouseLeave(event, r); });
	
	// Selection FROM controller
	// Controller treated and sent selection position
	scope.$on('xEvent', function(event, positions) {
		if (positions.isOut) {
			directive_unselect(r);
		} else {
			if (addWidgetY)
				select(positions, r.container.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop);
			else
				select(positions);
		}
	});
}

/**
 * Repaint - XAxis
 */
function directive_repaint_xAxis(r) {
	// Clean
	r.groupX
		.attr('transform', 'translate(' + r.layout.xAxis.x + ',' + r.layout.xAxis.y + ')')
		.selectAll('*').remove();

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
		.attr('stroke',"black")
		.attr("stroke-width", 2);
	
	// Clock symbol
	r.groupX.append('text')
		.attr('class', 'svg-text')
		.attr('y', r.layout.xAxis.textShift)
		.attr('x', -16)
		.attr('text-anchor', 'end')
		.attr('font-size', (r.layout.xAxis.text + 4) + 'px')
		.text('time'); // ⌛ 🕓 elapsed time
	
	// Labels
	var texts = r.scaleX.ticks();
	var lastIndex = texts.length - 1;
	r.groupX
		.selectAll(".svg-text-scale")
		.data(texts).enter()
		.append('text')
			.attr('class', 'svg-text')
			.attr('y', r.layout.xAxis.textShift)
			.attr('x', function (d) { return r.scaleX(d)})
			.attr('text-anchor', function(d, i) { return (i == lastIndex) ? 'end' : "middle"; })
			.attr('font-size', r.layout.xAxis.text + 'px')
			.attr('fill', "#FFFFFF")
			.text(function (d) { return (d == 0) ? 0 : (d / 1000) + ' s'; });
}

/**
 * Repaint - VAxis
 */
function directive_repaint_VAxis(r, index, valueFunction) {
	// Limit - Clean
	r.groupV[index].selectAll('*').remove();

	// Length
	var vMax;
	if (index == 1 && r.meta.canOverflow) {
		vMax = r.scalesV[index].invert(r.layout.profile.height + r.meta.vOverflow[index]);
	} else {
		vMax = r.scalesV[index].invert(- r.meta.vOverflow[index]);
	}

	for (var v = r.meta.vStep[index]; v < vMax; v += r.meta.vStep[index]) {
		// Tick
		r.groupV[index].append('line')
				.attr('class', "svg-line")
				.attr('x1', r.layout.vAxis.width).attr('x2', r.layout.vAxis.width - 4)
				.attr('y1', r.scalesV[index](v)).attr('y2', r.scalesV[index](v))
				.attr('stroke', (v == r.meta.vExpected[index]) ? r.deck.limit.fcolor : '#000000')
				.attr('stroke-width', (v == r.meta.vExpected[index]) ? 3 : 1)
				.attr('fill', 'none');

		// Text
		r.groupV[index].append('text')
			.attr('class', 'svg-text')
			.attr('y', r.scalesV[index](v) + 3)
			.attr('x', r.layout.vAxis.width - 6)
			.attr('text-anchor', 'end')
			.attr('font-size', r.layout.vAxis.fontSize + 'px')
			.attr('font-weight', (v == r.meta.vExpected[index]) ? 'bold' : 'normal')
			.attr('fill', (v == r.meta.vExpected[index]) ? r.deck.limit.fcolor : '#000000')
			.text((valueFunction !== undefined) ? valueFunction(v, index, r) : v);

		// Limit line
		if (v == r.meta.vExpected[index])
			r.groupV[index].append('line')
				.attr('class', 'line')
				.attr('x1', r.layout.profile.x + r.scaleX(r.meta.begin))
				.attr('x2', r.layout.profile.x + r.scaleX(r.meta.ends[index]))
				.attr('y1', r.scalesV[index](r.meta.vExpected[index]))
				.attr('y2', r.scalesV[index](r.meta.vExpected[index]))
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
	r.groupV[index].append('line')
			.attr('class', "svg-line")
			.attr('x1', r.layout.vAxis.width).attr('x2', r.layout.vAxis.width)
			.attr('y1', r.scalesV[index](0))
			.attr('y2', r.scalesV[index](vMax) + ((index == 0) ? -5 : 5))
			.attr('stroke', '#000000')
			.attr('stroke-width', 3);
	r.groupV[index].append('line')
			.attr('class', "svg-arrow")
			.attr('x1', r.layout.vAxis.width).attr('x2', r.layout.vAxis.width)
			.attr('y1', r.scalesV[index](vMax) + ((index == 0) ? -5 : 5))
			.attr('y2', r.scalesV[index](vMax) + ((index == 0) ? -7 : 7))
			.attr('stroke', '#000000')
			.attr('stroke-width', 1);
	/*r.groupV[index].append("polyline")
			.attr('class', "svg-arrow")
			.attr("points", p2s(points))
			.attr('stroke', '#000000')
			.attr('stroke-width', 1);*/
}

/**
 * Repaint - VAxis
 */
function directive_repaint_VCustomAxis(r, index, facet, values) {
	// Limit - Clean
	r.groupV[index].selectAll('*').remove();

	// Length
	var vMax = (index == 0) ? - r.meta.vOverflow[index] : r.meta.vOverflow[index];

	values.forEach(function(value) {
		// Tick
		r.groupV[index].append('line')
				.attr('class', "svg-line")
				.attr('x1', r.layout.vAxis.width).attr('x2', r.layout.vAxis.width - 4)
				.attr('y1', value.y).attr('y2', value.y)
				.attr('stroke', facet.fcolor)
				.attr('stroke-width', 1);

		// Text
		r.groupV[index].append('text')
			.attr('class', 'svg-text')
			.attr('y', value.y)
			.attr('x', r.layout.vAxis.width - 6)
			.attr('text-anchor', 'end')
			.attr('alignment-baseline', 'central')
			.attr('dominant-baseline', 'central')
			.attr('font-size', r.layout.vAxis.fontSize + 'px')
			.attr('font-weight', 'normal')
			.attr('fill', facet.fcolor)
			.text(value.l);
	});

	// Line
	r.groupV[index].append('line')
			.attr('class', "svg-line")
			.attr('x1', r.layout.vAxis.width).attr('x2', r.layout.vAxis.width)
			.attr('y1', 0)
			.attr('y2', vMax)
			.attr('stroke', '#000000')
			.attr('stroke-width', 3);
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
		result = points[i] + ',' + points[i+1] + " " + result;
	};

	if (returnPoints != undefined) {
		for (var i = returnPoints.length - 2; i >= 0; i -= 2) {
			result += returnPoints[i] + ',' + returnPoints[i+1] + " ";
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
		
		// Value axis labels
		if (r.deck.axis && r.deck.axis.labels == 'cores') {
			r.meta.vAxisLabel = function(v, index) {
				if (v == r.meta.vExpected[index]) {
					return 'CPU';
				} else if (v < r.meta.vExpected[index]) {
					return 'core';
				} else {
					return n2ft(v / r.meta.vExpected[index]);
				}
			}
		} else {
			r.meta.vAxisLabel = function(v, index) {
				return v + ' %';
			}
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
			var profileData, yPositions, yScaledPosition;
			var tStep, scaleVZero;
			r.profiles.forEach(function(profile, index) {
				// Clean
				r.groupP[index].selectAll('*').remove();

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
					for (var v = 0; v < r.deck.v.length; v++) {
						if (profileData.percent.hasOwnProperty(t) && profileData.percent[t].hasOwnProperty(r.deck.v[v].attr))
							yPositions[v] = profileData.percent[t][r.deck.v[v].attr];
						else
							yPositions[v] = 0;

						// Stack positions
						if (v > 0)
							yPositions[v] += yPositions[v-1];

						yScaledPosition = r.scalesV[index](yPositions[v]);

						// Add points to shape (x, y, x, y)
						//	=> twice for the boxing effect
						r.iData[index][v + 1].push(r.scaleX(t), yScaledPosition, r.scaleX(t + tStep), yScaledPosition);

						// Overflow (only the higher)
						if (v == r.deck.v.length - 1)
							r.meta.vOverflow[index] = Math.max(r.meta.vOverflow[index], 0 - yScaledPosition, yScaledPosition - r.layout.profile.height);
					};

					r.iData[index][0].push(r.scaleX(t), scaleVZero, r.scaleX(t + tStep), scaleVZero);
				};

				// Draw area
				for (var v = r.deck.v.length - 1; v >= 0; v--) {
					r.groupP[index].append("polygon")
						.attr('class', "svg-data svg-area svg-area-" + v)
						.attr("points", p2s(r.iData[index][v + 1], r.iData[index][v]))
						.attr('fill', r.deck.v[v].color);
				};

				// Value axis
				directive_repaint_VAxis(r, index, r.meta.vAxisLabel);
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(positions, y0) {
			// Time ID
			var tIndex = positions.i50;
			var t = positions.f50;
			if (tIndex == r.meta.lastSelectID) {
				return;
			} else {
				r.meta.lastSelectID = tIndex;
			}

			// Loop
			for (var index = 0; index < r.profiles.length; index++) {
				// Focus prefix for rules
				var prefixID = 'rule-' + r.meta.widget.index + '-' + index + '-';
				
				// Reuse
				if (r.iSelection[index] != null) {
					for (var v = r.deck.v.length - 1; v >= 0; v--) {
						r.iSelection[index].select(".svg-area-" + v).attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)));
						
						// Send new coordinates to controller
						updateFocusRule(prefixID, y0, index, t, tIndex, v);
					}
				}
				// Draw
				else {
					r.iSelection[index] = r.groupP[index].append("g").attr('class', "svg-selection");

					// Draw
					for (var v = r.deck.v.length - 1; v >= 0; v--) {
						r.iSelection[index].append("polygon")
							.attr('class', "svg-area svg-area-" + v)
							.attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)))
							.attr('fill', r.deck.v[v].fcolor);
						
						// Send new coordinates to controller
						updateFocusRule(prefixID, y0, index, t, tIndex, v);
					};
				}
			}
		}
		
		function updateFocusRule(prefixID, y0, index, t, tIndex, v) {
			var facet = r.deck.v[v];
			
			if (t >= r.meta.ends[index] || ! r.profiles[index].currentData.percent[t][facet.attr]) {
				// Send disable to controller
				r.scope.focusRuleHandle(prefixID + facet.attr, NaN, NaN, NaN);
				
			} else {
				
				var value = r.profiles[index].currentData[facet.cat][t][facet.attr];
				
				// Send new coordinates to controller
				r.scope.focusRuleHandle(
					prefixID + facet.attr,
					y0 + (r.iData[index][v + 1][tIndex * 4 + 1] + r.iData[index][v][tIndex * 4 + 1]) / 2 + r.layout.profile.y[index] + r.meta.vOverflow[0],
					value,
					(facet.unity) ? value + ' ' + facet.unity : value);
			}
		}

		// Bind
		directive_bind(scope, element, r, repaint, select, true);
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
		var r = directive_init(scope, element, attrs, LAYOUT_FH_BAND, true, true);

		// Axis label
		function vAxisLabel(v, index) {
			if (v == r.meta.vExpected[index])
				return r.deck.limitLabel;
			else
				return Math.round(v / r.meta.vExpected[index]) + '×';
		}

		// Redraw
		function repaint() {
			// Repaint container
			directive_repaint_container(r);
			
			// Enhance meta
			r.meta.vExpected[0] =	r.deck.expected(r.profiles[0], r.settings.timeGroup);
			r.meta.vMinDisplay[0] =	r.deck.displayed(r.profiles[0], r.settings.timeGroup);
			r.meta.vStep[0] =		r.deck.vStep(r.profiles[0], r.settings.timeGroup);
			if (r.profiles[1] != null) {
				r.meta.vExpected[1] =	r.deck.expected(r.profiles[1], r.settings.timeGroup);
				r.meta.vMinDisplay[1] =	r.deck.displayed(r.profiles[1], r.settings.timeGroup);
				r.meta.vStep[1] =		r.deck.vStep(r.profiles[1], r.settings.timeGroup);
			}

			// Repaint scales
			directive_repaint_scales(r, [0, r.meta.vMinDisplay[0]], [0, r.meta.vMinDisplay[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);

			// Main draw
			var profileData, yPositions, yScaledPosition;
			var tID, scaleVZero;
			var tStep = r.settings.timeGroup;
			var dataSource_list, dataSource_length, dataSource_index;
			r.profiles.forEach(function(profile, index) {
				// Clean
				r.groupP[index].selectAll('*').remove();

				// Var
				profileData = profile.currentData;

				// Points
				dataSource_list = [];
				dataSource_length = [];
				dataSource_index = [];
				yPositions = [];
				r.iData[index] = [[]];
				for (var v = 0; v < r.deck.v.length; v++) {
					dataSource_list.push(profileData[r.deck.v[v].list]);
					dataSource_length.push(profileData[r.deck.v[v].list].length);
					dataSource_index.push(0);
					yPositions.push(NaN);
					r.iData[index].push([]);
				};

				// All - points - data
				scaleVZero = r.scalesV[index](0);
				for (var t = r.meta.begin; t < r.meta.end; t += tStep) {
					tID = t / tStep;

					for (var v = 0; v < r.deck.v.length; v++) {
						yPositions[v] = 0;

						// Count all values inside the time frame
						while(dataSource_index[v] < dataSource_length[v] && dataSource_list[v][dataSource_index[v]] < (t + tStep)) {
							yPositions[v]++;
							dataSource_index[v]++;
						}

						// Stack positions
						if (v > 0)
							yPositions[v] += yPositions[v-1];

						yScaledPosition = r.scalesV[index](yPositions[v]);

						// Add points to shape (x, y, x, y)
						//	=> twice for the boxing effect
						r.iData[index][v + 1].push(r.scaleX(t), yScaledPosition, r.scaleX(t + tStep), yScaledPosition);

						// Overflow (only the higher)
						if (v == r.deck.v.length - 1)
							r.meta.vOverflow[index] = Math.max(r.meta.vOverflow[index], 0 - yScaledPosition, yScaledPosition - r.layout.profile.height);
					};

					r.iData[index][0].push(r.scaleX(t), scaleVZero, r.scaleX(t + tStep), scaleVZero);
				};

				// Draw area
				for (var v = r.deck.v.length - 1; v >= 0; v--) {
					r.groupP[index].append("polygon")
						.attr('class', "svg-data svg-area svg-area-" + v)
						.attr("points", p2s(r.iData[index][v + 1], r.iData[index][v]))
						.attr('fill', r.deck.v[v].color);
				};

				// Value axis
				directive_repaint_VAxis(r, index, vAxisLabel);
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(positions, y0) {
			// Time ID
			var tIndex = Math.floor(positions.t / r.settings.timeGroup);
			if (tIndex == r.meta.lastSelectID) {
				return;
			} else {
				r.meta.lastSelectID = tIndex;
			}

			// Loop
			for (var index = 0; index < r.profiles.length; index++) {
				// Focus prefix for rules
				var prefixID = 'rule-' + r.meta.widget.index + '-' + index + '-';
				
				// Reuse
				if (r.iSelection[index] != null) {
					for (var v = r.deck.v.length - 1; v >= 0; v--) {
						r.iSelection[index].select(".svg-area-" + v).attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)));
						
						// Send new coordinates to controller
						updateFocusRule(prefixID, y0, index, tIndex, v);
					}
				}
				// Draw
				else {
					r.iSelection[index] = r.groupP[index].append("g").attr('class', "svg-selection");

					// Draw
					for (var v = r.deck.v.length - 1; v >= 0; v--) {
						r.iSelection[index].append("polygon")
							.attr('class', "svg-area svg-area-" + v)
							.attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)))
							.attr('fill', r.deck.v[v].fcolor);
						
						// Send new coordinates to controller
						updateFocusRule(prefixID, y0, index, tIndex, v);
					};
				}
			}
		}
		
		
		function updateFocusRule(prefixID, y0, index, tIndex, v) {
			var facet = r.deck.v[v];
			
			if (tIndex >= r.meta.ends[index] / r.settings.timeGroup) {
				// Send disable to controller
				r.scope.focusRuleHandle(prefixID + facet.attr, NaN, NaN, NaN);
				
			} else {
				
				var value = r.data[index].hasOwnProperty(tIndex) ? r.data[index][tIndex][r.deck.v[v].attr] || 0 : 0;
				
				// Send new coordinates to controller
				r.scope.focusRuleHandle(
					prefixID + facet.attr,
					y0 + (r.iData[index][v + 1][tIndex * 4 + 1] + r.iData[index][v][tIndex * 4 + 1]) / 2 + r.layout.profile.y[index] + r.meta.vOverflow[0],
					value,
					(facet.unity) ? value + ' ' + facet.unity : value);
			}
		}

		// Bind
		directive_bind(scope, element, r, repaint, select, true);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});



/**
 * Stack
 */
app.directive('chartStack', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartStack ==");

		// Init vars
		var r = directive_init(scope, element, attrs, LAYOUT_FH_NORMAL, true, true);

		// Enhance meta
		r.meta.vExpected[0] =	r.deck.expected(r.profiles[0]);
		r.meta.vMinDisplay[0] =	r.deck.displayed(r.profiles[0]);
		r.meta.vStep[0] =		r.deck.vStep(r.profiles[0]);
		if (r.profiles[1] != null) {
			r.meta.vExpected[1] =	r.deck.expected(r.profiles[1]);
			r.meta.vMinDisplay[1] =	r.deck.displayed(r.profiles[1]);
			r.meta.vStep[1] =		r.deck.vStep(r.profiles[1]);
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
			var profileData, yPositions, yScaledPosition;
			var tStep, scaleVZero;
			r.profiles.forEach(function(profile, index) {
				// Clean
				r.groupP[index].selectAll('*').remove();

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
					for (var v = 0; v < r.deck.v.length; v++) {
						if (profileData[r.deck.v[v].cat].hasOwnProperty(t) && profileData[r.deck.v[v].cat][t].hasOwnProperty(r.deck.v[v].attr))
							yPositions[v] = profileData[r.deck.v[v].cat][t][r.deck.v[v].attr];
						else
							yPositions[v] = 0;

						// Stack positions
						if (v > 0)
							yPositions[v] += yPositions[v-1];

						yScaledPosition = r.scalesV[index](yPositions[v]);

						// Add points to shape (x, y, x, y)
						//	=> twice for the boxing effect
						r.iData[index][v + 1].push(r.scaleX(t), yScaledPosition, r.scaleX(t + tStep), yScaledPosition);

						// Overflow (only the higher)
						if (v == r.deck.v.length - 1)
							r.meta.vOverflow[index] = Math.max(r.meta.vOverflow[index], 0 - yScaledPosition, yScaledPosition - r.layout.profile.height);
					};

					r.iData[index][0].push(r.scaleX(t), scaleVZero, r.scaleX(t + tStep), scaleVZero);
				};

				// Draw area
				for (var v = r.deck.v.length - 1; v >= 0; v--) {
					r.groupP[index].append("polygon")
						.attr('class', "svg-data svg-area svg-area-" + v)
						.attr("points", p2s(r.iData[index][v + 1], r.iData[index][v]))
						.attr('fill', r.deck.v[v].color);
				};

				// Value axis
				directive_repaint_VAxis(r, index, r.deck.vLabel);
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(positions) {
			// Time ID
			var tIndex = positions.f50;
			if (tIndex >= r.meta.ends[index] / r.settings.timeGroup) {
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
					r.iSelection[index] = r.groupP[index].append("g").attr('class', "svg-selection");

					// Draw
					for (var v = r.deck.v.length - 1; v >= 0; v--) {
						r.iSelection[index].append("polygon")
							.attr('class', "svg-area svg-area-" + v)
							.attr("points", p2s(r.iData[index][v + 1].slice(tIndex * 4, tIndex * 4 + 4), r.iData[index][v].slice(tIndex * 4, tIndex * 4 + 4)))
							.attr('fill', r.deck.v[v].fcolor);
					};
				}
			}
		}

		// Bind
		directive_bind(scope, element, r, repaint, select);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});



/**
 * Threads
 */
app.directive('chartThreads', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartThreads ==");

		// Init vars
		var r = directive_init(scope, element, attrs, LAYOUT_FH_NULL, true, true);

		// Enhance meta
		r.meta.thread_Height = 12;
		r.meta.tick_Height = 8;
		r.meta.period_Height = 6;
		r.meta.tickgroup_halfHeight = 1;

		// Redraw
		function repaint() {
			// Repaint container
			directive_repaint_container(r);

			// Repaint scales
			directive_repaint_scales(r, [0, r.meta.vMinDisplay[0]], [0, r.meta.vMinDisplay[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);

			// Main draw
			var threadData, profileData, vLabels;
			var groupHeight, threadY;
			r.profiles.forEach(function(profile, index) {
				// Clean
				r.groupP[index].selectAll('*').remove();
				vLabels = [];

				// Data
				profileData = profile.currentData;
				threadData = profile.currentData.threads.info;
				groupHeight = threadData.length * r.meta.thread_Height;
				
				// Draw threads
				threadData.forEach(function(thread, position) {
					threadY = (index == 0) ? (position + .5) * r.meta.thread_Height - groupHeight : (position + .5) * r.meta.thread_Height;
					
					// Draw basic thread
					r.groupP[index].append('line')
						.attr('class', "svg-thread svg-thread-line")
						.attr('x1', r.scaleX(Math.max(thread.s, r.meta.begin)))
						.attr('x2', r.scaleX((thread.e) ? Math.min(thread.e, r.meta.end) : r.meta.end))
						.attr('y1', threadY).attr('y2', threadY)
						.attr('stroke', r.deck.h.color)
						.attr('stroke-width', 1);
					
					// Save label
					vLabels.push({ l: thread.h, y: threadY });
					
					// Draw periods
					var x1Period, x2Period;
					if (r.deck.periods && (!! r.meta.enablePeriods || (r.meta.hasOwnProperty('disablePeriods') && ! r.meta.disablePeriods))) {
						var periodsData = profile.currentData.threads.periods;
						r.deck.periods.forEach(function(deck) {
							if (periodsData[thread.h] && periodsData[thread.h][deck.attr]) {
								periodsData[thread.h][deck.attr].forEach(function (p) {
									if (p.s >= r.meta.begin || p.e <= r.meta.end) {
										x1Period = (p.s) ? r.scaleX(Math.max(p.s, r.meta.begin)) : r.scaleX(Math.max(thread.s, r.meta.begin));
										x2Period = (p.e) ? r.scaleX(Math.min(p.e, r.meta.end)) : r.scaleX(Math.min(thread.e, r.meta.end));
										r.groupP[index].append("rect")
											.attr('class', 'svg-thread svg-thread-period')
											.attr('x', x1Period)
											.attr('y', threadY - r.meta.period_Height / 2)
											.attr("width", x2Period - x1Period)
											.attr("height", r.meta.period_Height)
											.attr('fill', (p.hasOwnProperty('c')) ? r.deck.c_periods[p.c] : deck.colours.n);
									}
								});
							}
						});
					}
					
					// Draw group ticks
					if (r.deck.ticks && r.meta.groupTicks) {
						r.deck.ticks.forEach(function(deck) {
							if (profile.currentData.threads.ticks[thread.h] && profile.currentData.threads.ticks[thread.h][deck.attr]) {
								var ticksData = profile.currentData.threads.ticks[thread.h][deck.attr];
								var points = [[], []];
								
								// Init the tick position
								var tickIndex = 0;
								while (tickIndex < ticksData.length && ticksData[tickIndex] < r.meta.begin) tickIndex++;
								
								if (tickIndex < ticksData.length) {
									var capacity = profile.hardware.calibration[deck.attr] * r.meta.timeGroup;
									
									var tickCount, delta;
									for (var t = r.meta.begin; t <= r.meta.end; t += r.meta.timeGroup) {
										tickCount = 0;
										while (tickIndex < ticksData.length && ticksData[tickIndex] < (t + r.meta.timeGroup)) {
											tickCount++;
											tickIndex++;
										}
										delta = tickCount * r.meta.tickgroup_halfHeight / capacity;
										points[0].push.apply(points[0], [r.scaleX(t), threadY + delta, r.scaleX(t + r.meta.timeGroup), threadY + delta]);
										points[1].push.apply(points[1], [r.scaleX(t), threadY - delta, r.scaleX(t + r.meta.timeGroup), threadY - delta]);
									}
									
									r.groupP[index].append("polygon")
										.attr('class', "svg-limit")
										.attr("points", p2s(points[0], points[1]))
										.attr('fill', deck.color);
								}
							}
						});
					}
					
					// Draw ticks
					if (r.deck.ticks && (!! r.meta.enableTicks || (r.meta.hasOwnProperty('disableTicks') && ! r.meta.disableTicks))) {
						var ticksData = profile.currentData.threads.ticks[thread.h];
						var lastTick;
						r.deck.ticks.forEach(function(deck) {
							if (ticksData && ticksData[deck.attr]) {
								lastTick = -1;
								ticksData[deck.attr].forEach(function (t) {
									if (t != lastTick && t >= r.meta.begin && t <= r.meta.end) {
										r.groupP[index].append('line')
											.attr('class', 'svg-thread svg-thread-tick')
											.attr('x1', r.scaleX(t)).attr('x2', r.scaleX(t))
											.attr('y1', threadY - r.meta.tick_Height / 2)
											.attr('y2', threadY + r.meta.tick_Height / 2)
											.attr('stroke', deck.color)
											.attr('stroke-width', 1);
										lastTick = t;
									}
								});
							}
						});
					}
				});
				r.meta.vOverflow[index] = groupHeight;

				// Value axis
				directive_repaint_VCustomAxis(r, index, r.deck.h, vLabels);
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(positions) {
		}

		// Bind
		directive_bind(scope, element, r, repaint, select);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});



/**
 * Lines
 */
app.directive('chartLines', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartLines ==");

		// Init vars
		var r = directive_init(scope, element, attrs, LAYOUT_FH_NULL, true, true);

		// Enhance meta
		if (! r.meta.lineHeight) r.meta.lineHeight = 12;
		
		// lines
		r.meta.lines = [
											 (r.meta.hackLineProvider) ? r.deck.linesHack(r.profiles[0]) : r.deck.lines(r.profiles[0]),
			(r.profiles.length < 2) ? null : (r.meta.hackLineProvider) ? r.deck.linesHack(r.profiles[1]) : r.deck.lines(r.profiles[1])
		];
		r.meta.linesLength = [
			(r.meta.lines[0]) ? r.meta.lines[0].length : 0,
			(r.meta.lines[1]) ? r.meta.lines[1].length : 0
		];
		
		// Init focus pins
		directive_focus_init(r, r.meta.linesLength);
		
		// Init internal data
		r.iData = {};

		// Redraw
		var mapLines;
		function repaint() {
			// Repaint container
			directive_repaint_container(r);

			// Repaint scales
			directive_repaint_scales(r, [0, r.meta.vMinDisplay[0]], [0, r.meta.vMinDisplay[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);
			
			// Clean
			if (r.deck.melody) r.iData.melody = [[], []];

			// Main draw
			var profileData;
			var groupHeight, lineY, lineGroup, elementClasses;
			var delta;
			var lineCenter = r.meta.lineHeight / 2
			r.profiles.forEach(function(profile, index) {
				// Clean
				r.groupP[index].selectAll('*').remove();

				// Data
				mapLines = {};
				profileData = profile.currentData;
				groupHeight = r.meta.linesLength[index] * r.meta.lineHeight;
				
				// Expand graph
				r.meta.vOverflow[index] = groupHeight;
				
				// Draw sequences
				if (r.deck.sequences && ! r.meta.disableSequenceBackgound) {
					var seqData = profileData.events.q;
					var currentY;
					var yMax = (index == 0) ? - groupHeight : groupHeight;
					var yMin = 0;
					var cPreviousY = yMin;
					var uPreviousY = yMax;
					var cPoints = [r.scaleX(r.meta.begin), cPreviousY];
					var uPoints = [r.scaleX(r.meta.begin), uPreviousY];
					
					for (var t in seqData) {
						if (t > r.meta.begin) {
							// Position
							// currentY = (index == 0) ? - seqData[t] * r.meta.lineHeight : seqData[t] * r.meta.lineHeight;
							currentY = (seqData[t] <= r.meta.sequenceThreshold) ? yMin : yMax;
							
							// Under
							if (uPreviousY != currentY) {
								uPoints.push.apply(uPoints, [r.scaleX(t), uPreviousY, r.scaleX(t), currentY]);
								uPreviousY = currentY;
							}
							
							// Count
							if (cPreviousY != currentY) {
								cPoints.push.apply(cPoints, [r.scaleX(t), cPreviousY, r.scaleX(t), currentY]);
								cPreviousY = currentY;
							}
						}
					}
					
					cPoints.push.apply(cPoints, [r.scaleX(r.meta.ends[index]), cPreviousY, r.scaleX(r.meta.ends[index]), yMin]);
					uPoints.push.apply(uPoints, [r.scaleX(r.meta.ends[index]), uPreviousY, r.scaleX(r.meta.ends[index]), yMax]);
					
					// Under
					r.groupP[index].append("polygon")
						.attr('class', 'svg-data svg-data-sequence svg-data-under')
						.attr("points", p2s(uPoints))
						.attr('fill', r.deck.sequences.under.gcolor);
					
					// Count
					r.groupP[index].append("polygon")
						.attr('class', 'svg-data svg-data-sequence svg-data-count')
						.attr("points", p2s(cPoints))
						.attr('fill', r.deck.sequences.count.gcolor);
				}
				
				// Draw lines
				r.meta.lines[index].forEach(function(line, line_index) {
					// Map
					mapLines[line.id] = line;
					
					// Position
					lineY = (index == 0) ? (line_index + .5) * r.meta.lineHeight - groupHeight : (line_index + .5) * r.meta.lineHeight;
					
					// Group
					lineGroup = r.groupP[index].append("g")
						.attr('transform', 'translate(0,' + ((index == 0) ? line_index * r.meta.lineHeight - groupHeight : line_index * r.meta.lineHeight) + ')')
						.attr('class', 'svg-group');
					
					// Save line parameters
					line.y = lineY;
					line.g = lineGroup;
					
					// Draw basic core
					if (! r.meta.disableLine)
						lineGroup.append('line')
							.attr('class', "svg-data svg-data-line")
							.attr('x1', r.scaleX(line.s))
							.attr('x2', r.scaleX(line.e))
							.attr('y1', lineCenter).attr('y2', lineCenter)
							.attr('stroke', r.deck.h.color)
							.attr('stroke-width', 1);
					
					// Draw melody
					if (r.deck.melody && ! r.meta.disableMelody) {
						// Compute points
						var points = [[], []];
						var timeStep = profileData.info.timeStep;
						for (var frameID = r.meta.begin; frameID < r.meta.ends[index]; frameID += timeStep) {
							delta = profileData[r.deck.melody_cat][line.id][frameID][r.deck.melody.attr] * r.meta.melodyHeight / 2 / timeStep;
							points[0].push.apply(points[0], [r.scaleX(frameID), lineCenter + delta, r.scaleX(frameID + timeStep), lineCenter + delta]);
							points[1].push.apply(points[1], [r.scaleX(frameID), lineCenter - delta, r.scaleX(frameID + timeStep), lineCenter - delta]);
						}
						
						// Save melody data
						r.iData.melody[index].push(points);
						
						// Draw melody (if necessary)
						if (! r.meta.disableMelody)
							lineGroup.append("polygon")
								.attr('class', 'svg-data svg-data-melody')
								.attr("points", p2s(points[0], points[1]))
								.attr('fill', r.deck.melody.color);
					}
					
					// Draw sequences
					if (r.deck.sequences && ! r.meta.disableSequenceDashs) {
						var seqData = profileData.events.q;
						var cPoints = [[r.scaleX(r.meta.begin), lineCenter], [r.scaleX(r.meta.begin), lineCenter]];
						var uPoints = [[r.scaleX(r.meta.begin), lineCenter], [r.scaleX(r.meta.begin), lineCenter]];
						var cUseDelta = false;
						var uUseDelta = false;
						delta = 3;
						
						for (var t in seqData) {
							if (t > r.meta.begin) {
								// Count
								if ((index == 0 && r.meta.linesLength[index] - line_index - 1 < seqData[t]) || (index == 1 && line_index < seqData[t])) {
									if (! cUseDelta) {
										cPoints[0].push.apply(cPoints[0], [r.scaleX(t), lineCenter, r.scaleX(t), lineCenter + delta]);
										cPoints[1].push.apply(cPoints[1], [r.scaleX(t), lineCenter, r.scaleX(t), lineCenter - delta]);
										cUseDelta = true;
									}
								} else {
									if (cUseDelta) {
										cPoints[0].push.apply(cPoints[0], [r.scaleX(t), lineCenter + delta, r.scaleX(t), lineCenter]);
										cPoints[1].push.apply(cPoints[1], [r.scaleX(t), lineCenter - delta, r.scaleX(t), lineCenter]);
										cUseDelta = false;
									}
								}
								// Under
								if (seqData[t] <= r.meta.sequenceThreshold && ((index == 0 && r.meta.linesLength[index] - line_index - 1 < seqData[t]) || (index == 1 && line_index < seqData[t]))) {
									if (! uUseDelta) {
										uPoints[0].push.apply(uPoints[0], [r.scaleX(t), lineCenter, r.scaleX(t), lineCenter + delta]);
										uPoints[1].push.apply(uPoints[1], [r.scaleX(t), lineCenter, r.scaleX(t), lineCenter - delta]);
										uUseDelta = true;
									}
								} else {
									if (uUseDelta) {
										uPoints[0].push.apply(uPoints[0], [r.scaleX(t), lineCenter + delta, r.scaleX(t), lineCenter]);
										uPoints[1].push.apply(uPoints[1], [r.scaleX(t), lineCenter - delta, r.scaleX(t), lineCenter]);
										uUseDelta = false;
									}
								}
							}
						}
						
						if (cUseDelta) {
							cPoints[0].push.apply(cPoints[0], [cPoints[0][cPoints[0].length - 2], lineCenter]);
							cPoints[1].push.apply(cPoints[1], [cPoints[1][cPoints[1].length - 2], lineCenter]);
						}
						if (uUseDelta) {
							uPoints[0].push.apply(uPoints[0], [uPoints[0][uPoints[0].length - 2], lineCenter]);
							uPoints[1].push.apply(uPoints[1], [uPoints[1][uPoints[1].length - 2], lineCenter]);
						}
						
						// Count
						lineGroup.append("polygon")
							.attr('class', 'svg-data svg-data-sequence svg-data-doing')
							.attr("points", p2s(cPoints[0], cPoints[1]))
							.attr('fill', r.deck.sequences.count.color);
						
						// Under
						if (uPoints[0].length > 2)
							lineGroup.append("polygon")
								.attr('class', 'svg-data svg-data-sequence svg-data-doing')
								.attr("points", p2s(uPoints[0], uPoints[1]))
								.attr('fill', r.deck.sequences.under.color);
					}
				});
				
				// Value axis
				directive_repaint_VCustomAxis(r, index, r.deck.h, r.meta.lines[index]);
				
				// Draw dependencies
				if (r.deck.depends) {
					var depData = profileData.dependencies[r.deck.depends.list];
					
					for (var lock in depData) {
						var holded, start;
						depData[lock].forEach(function(event) {
							// Failure
							if (event.x == 'lf') {
								// Line
								elementClasses = (r.meta.holdingMode == 1) ? 'svg-data svg-data-line svg-group-hovered-element' : 'svg-data svg-data-line';
								if (r.meta.holdingMode >= 1) mapLines[event.h].g.insert('line', ':first-child')
									.attr('class', elementClasses)
									.attr('x1', r.scaleX(event.t)).attr('x2', r.scaleX(event.t))
									.attr('y1', lineCenter).attr('y2', lineCenter + mapLines[event.hl].y - mapLines[event.h].y)
									.attr('stroke', r.deck.depends.failure.color)
									.attr('stroke-width', 1)
									.attr('stroke-dasharray', '2,2');
								// Cross
								mapLines[event.h].g.append('text')
									.attr('class', 'svg-data svg-data-failure svg-data-failure-label')
									.attr('x', r.scaleX(event.t))
									.attr('y', lineCenter)
									.attr('text-anchor', 'middle')
									.attr('alignment-baseline', 'central')
									.attr('dominant-baseline', 'central')
									.attr('font-size', '14px')
									.attr('fill', r.deck.depends.failure.color)
									.text('×');
							} else
							
							// Success
							if (event.x == 'ls') {
								// Tick
								mapLines[event.h].g.append('text')
									.attr('class', 'svg-data svg-data-failure svg-data-failure-label svg-data-lock-ls-' + lock)
									.attr('x', r.scaleX(event.t))
									.attr('y', lineCenter)
									.attr('text-anchor', 'middle')
									.attr('alignment-baseline', 'central')
									.attr('dominant-baseline', 'central')
									.attr('font-size', '12px')
									.attr('fill', r.deck.depends.working.fcolor)
									.text('[');
								holded = event;
							} else
							
							// Release
							if (event.x == 'lr') {
								start = (holded) ? holded.t : mapLines[holded.h].s;
								// Line
								if (event.t - start > 0) {
									// Period
									mapLines[holded.h].g.insert('line', '.svg-data-lock-ls-' + lock)
										.attr('class', "svg-data svg-data-line")
										.attr('x1', r.scaleX(start)).attr('x2', r.scaleX(event.t))
										.attr('y1', lineCenter).attr('y2', lineCenter)
										.attr('stroke', r.deck.depends.working.color)
										.attr('stroke-width', 5);
									
									// Tick
									mapLines[holded.h].g.append('text')
										.attr('class', 'svg-data svg-data-failure svg-data-failure-label')
										.attr('x', r.scaleX(event.t))
										.attr('y', lineCenter)
										.attr('text-anchor', 'middle')
										.attr('alignment-baseline', 'central')
										.attr('dominant-baseline', 'central')
										.attr('font-size', '12px')
										.attr('fill', r.deck.depends.working.fcolor)
										.text(']');
								}
								
								holded = null;
							}
						}, this);
						
						if (holded) {
							// Line
							if (mapLines[holded.h].e - holded.t > 0)
								mapLines[holded.h].g.append('line')
									.attr('class', "svg-data svg-data-line")
									.attr('x1', r.scaleX(holded.t)).attr('x2', r.scaleX(mapLines[holded.h].e))
									.attr('y1', lineCenter).attr('y2', lineCenter)
									.attr('stroke', r.deck.depends.working.color)
									.attr('stroke-width', 5);
							
						}
					}
				}
				/*
				if (r.deck.depends) {
					var facet, points, lineFrom, lineTo;
					
					// Start
					facet = r.deck.depends.start;
					if (facet)
						profileData.dependencies[facet.attr].forEach(function(dep, i) {
							lineFrom = mapLines[(dep[r.deck.depends.from]) ? dep[r.deck.depends.from] : r.deck.depends.failID];
							lineTo = mapLines[(dep[r.deck.depends.to]) ? dep[r.deck.depends.to] : r.deck.depends.failID];
							
							points =
								'M' + r.scaleX(dep.t - dep.d) + ' ' + lineFrom.y + ' ' + 
								'H' + r.scaleX(dep.t) + ' ' + 
								'V' + lineTo.y + ' ' + 
								'H' + r.scaleX(lineTo.e);
							 
							r.groupP[index].append("path")
								.attr('class', 'svg-data svg-data-dependency')
								.attr('d', points)
								.attr('stroke', facet.color)
								.attr('fill', 'transparent');
						});
					
					// End
					facet = r.deck.depends.end;
					if (facet)
						profileData.dependencies[facet.attr].forEach(function(dep, i) {
							lineFrom = mapLines[(dep[r.deck.depends.from]) ? dep[r.deck.depends.from] : r.deck.depends.failID];
							lineTo = mapLines[(dep[r.deck.depends.to]) ? dep[r.deck.depends.to] : r.deck.depends.failID];
							
							points =
								'M' + r.scaleX(dep.t) + ' ' + lineFrom.y + ' ' + 
								'V' + lineTo.y;
							 
							r.groupP[index].append("path")
								.attr('class', 'svg-data svg-data-dependency')
								.attr('d', points)
								.attr('stroke', facet.color)
								.attr('fill', 'transparent');
						});
				}
				*/
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(positions, y0) {
			
			// Select melody
			if (r.deck.melody && ! r.meta.disableMelody) {
				
				// Time ID
				var t = positions.t;
				var tIndex = positions.f50;
				var frameID = positions.i50;
				t = Math.round(t);
				if (tIndex == r.meta.lastSelectID) {
					return;
				} else {
					r.meta.lastSelectID = tIndex;
				}
	
				// Loop
				for (var index = 0; index < r.profiles.length; index++) {
					// Focus prefix for rules
					var prefixID = 'pin-' + r.meta.widget.index + '-' + index + '-melody-';
					
					// Reuse
					if (r.iSelection[index] != null) {
						for (var l = r.meta.linesLength[index] - 1; l >= 0; l--) {
							r.iSelection[index].select(".svg-area-melody-" + l).attr("points", p2s(r.iData.melody[index][l][1].slice(tIndex * 4, tIndex * 4 + 4), r.iData.melody[index][l][0].slice(tIndex * 4, tIndex * 4 + 4)));
							
							// Send new coordinates to controller
							updateMelodyPin(prefixID, l, y0, index, t, frameID);
						}
					}
					// Draw
					else {
						r.iSelection[index] = r.groupP[index].append("g").attr('class', "svg-selection");
	
						// Draw
						for (var l = r.meta.linesLength[index] - 1; l >= 0; l--) {
							r.iSelection[index].append("polygon")
								.attr('class', "svg-area svg-area-melody-" + l)
								.attr("points", p2s(r.iData.melody[index][l][1].slice(tIndex * 4, tIndex * 4 + 4), r.iData.melody[index][l][0].slice(tIndex * 4, tIndex * 4 + 4)))
								.attr('fill', r.deck.melody.fcolor);
							
							// Send new coordinates to controller
							updateMelodyPin(prefixID, l, y0, index, t, frameID);
						};
					}
				}
			}
		}
		
		function updateMelodyPin(prefixID, l, y0, index, t, frameID) {
			console.log('move'); // arguments
			if (t >= r.meta.ends[index]) {
				// Send disable to controller
				r.scope.focusMovePin(prefixID + l, NaN, NaN);
				
			} else {
				var value = r.profiles[index].currentData[r.deck.melody_cat][l][frameID][r.deck.melody.attr];
				if (r.deck.melody.unity) value += ' ' + r.deck.melody.unity;
				
				// Send new coordinates to controller
				r.scope.focusMovePin(
					prefixID + l,
					y0 + r.meta.lines[index][l].y + r.layout.profile.y[index] + r.meta.vOverflow[index],
					value);
			}
		}

		// Bind
		directive_bind(scope, element, r, repaint, select, true);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});