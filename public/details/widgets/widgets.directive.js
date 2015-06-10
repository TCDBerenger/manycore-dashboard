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
	this.padding	= { top: 0, right: 10, bottom: 0, left: 30, inner: 4 };
	this.profile	= { favoriteHeight: favoriteHeight };
	this.xAxis		= { height: 10, text: 8, textShift: 8, arrow: 8 };
	this.vAxis		= { fontSize: 10 };

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
		self.vAxis.height =	self.profile.heigh;

		if (callback !== undefined) callback();
	};
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
	this.overflow		= [NaN, NaN];		// Possible overflow by first and second profile

	// On demand
	['calibration', 'crenellate'].forEach(function(a) {
		if (attributes.hasOwnProperty(a))
			try { self[a] = JSON.parse(attributes[a]) } catch(e) { self[a] = attributes[a] };
	});
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
	var deck =		scope.widget.deck.graph;
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
	r.meta.refresh();
	r.iData = [];

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

	// Overflow
	if (r.meta.allowOverflow) {
		r.meta.overflow = [0, 0];
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
	if (r.meta.vMirror) r.scalesV[1].rangeRound([r.layout.profile.top, r.layout.profile.bottom]); else r.scalesV[1].rangeRound([r.layout.profile.bottom, r.layout.profile.top]);
}

/**
 * Repaint - container
 */
function directive_repaint_post(r) {
	// Overflow
	if (r.meta.allowOverflow) {

		// Top (profile 1)
		if (r.meta.overflow[0] > 0) {
			r.groupO.attr("transform", "translate(0," + r.meta.overflow[0] + ")");
		}

		// Top (profile 2)
		if (r.meta.overflow[1] > 0 && ! r.meta.vMirror) {
			r.group1.attr("transform", "translate(0," + r.meta.overflow[1] + ")");
		}

		// Top & Bottom (both profiles)
		d3.select(r.container).style('height', (r.layout.height + r.meta.overflow[0] + r.meta.overflow[1]) + 'px');
		r.svg.attr('height', r.layout.height + r.meta.overflow[0] + r.meta.overflow[1]);
	}
}

/**
 * Repaint - Bind
 */
function directive_bind(r, repaint, select, unselect, settings) {
	r.scope.$watch(function() { return r.container.clientWidth; }, repaint);
	r.scope.$watch(function() { return r.settings.version; }, settings);
}

/**
 * Repaint - XAxis
 */
function directive_repaint_xAxis(r) {
	// Clean
	r.groupX
		.attr("transform", "translate(" + r.layout.xAxis.x + "," + r.layout.xAxis.y + ")")
		.selectAll("text").remove();

	// Box
	var points = [
			{"x": -r.layout.xAxis.arrow, "y": 0},
			{"x": r.layout.xAxis.right,	"y": 0},
			{"x": r.layout.xAxis.right + r.layout.xAxis.arrow, "y": r.layout.xAxis.height / 2},
			{"x": r.layout.xAxis.right,	"y": r.layout.xAxis.height},
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

/**
 * Repaint - VAxis
 */
function directive_repaint_VAxis(r, index) {
	// Limit - Clean
	r.groupV[index].selectAll("*").remove();


}



/**********************************************************/
/*														  */
/*	Utilities											  */
/*														  */
/**********************************************************/

/**
 * Points
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
		
		// Meta - layout Y (arbitrary)
		r.meta.expected = 1;
		r.meta.minLimit = 2;
		r.meta.d_expected = [];
		r.meta.d_minLimit = [];

		// Meta - Calibration
		r.meta.calibrations = [];
		r.profiles.forEach(function(profile) {
			r.meta.calibrations.push(profile.hardware.calibration[r.meta.calibration] * profile.hardware.data.threads);
			r.meta.d_expected.push(profile.hardware.calibration[r.meta.calibration] * profile.hardware.data.threads * r.meta.expected);
			r.meta.d_minLimit.push(profile.hardware.calibration[r.meta.calibration] * profile.hardware.data.threads * r.meta.minLimit);
		});

		// Enhance layout

		// Redraw
		function repaint() {
			// Repaint container
			directive_repaint_container(r);

			// Computation
			var xMax = r.layout.profile.width;
			var xStep = r.meta.pixelGroup;
			var tMax = r.meta.duration(); // the max of both profiles
			var tStep = tMax / (xMax / xStep);
			
			// Repaint scales
			directive_repaint_scales(r, [0, tStep * r.meta.d_minLimit[0]], [0, tStep * r.meta.d_minLimit[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);

			// Draw
			var data, dataList, internalData, points;
			var v_currentLimit, v_minLimit;
			r.profiles.forEach(function(profile, index) {
				// vars
				data = profile.currentData;
				dataList = data[r.meta.v.cat].list;
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

					r.meta.overflow[index] = Math.max(r.meta.overflow[index], Math.pow(-1, index) * (v_minLimit - v_count));

					// Next loop
					x += xStep;
				}

				// Data - points
				points += " " + Math.min(x, xMax) + "," + r.scalesV[index](0);
				r.iData.push(internalData);

				// Data - draw
				r.groupP[index].append("polygon")
					.attr("points", points)
					.attr("fill", r.meta.v.color);


				// Limit - Clean
				r.groupV[index].selectAll("*").remove();

				// Limit - Loop
				var yPosition;
				for (var l = Math.floor(2 * (r.layout.profile.height + r.meta.overflow[index] - r.layout.vAxis.fontSize) / r.layout.profile.height); l > 0; l--) {
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
			// Precondition
			if (x < r.layout.profile.x || x > r.layout.profile.x + r.layout.profile.width) {
				if (r.iSelection[0] != null) unselect();
				return;
			}

			// Time ID
			var tID = Math.floor((x - r.layout.profile.x) / r.meta.pixelGroup);
			if (tID == r.meta.lastSelectID) {
				return;
			} else {
				r.meta.lastSelectID = tID;
			}

			// Loop
			var points;
			for (var index = 0; index < r.profiles.length; index++) {
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
		
		// Select
		function unselect() {
			r.svg.selectAll(".svg-selection").remove();
			r.iSelection = [null, null];
			r.meta.lastSelectID = null;
		}
		
		// Settigns changes
		function settings() {
			if (typeof r.settings.pixelGroup != 'undefined' && r.settings.pixelGroup != r.meta.pixelGroup) {
				r.meta.pixelGroup = r.settings.pixelGroup;
				repaint();
			}
		}

		// Bind
		directive_bind(r, repaint, select, unselect, settings);
		element.on('mousemove', function(event) { select(event.clientX - r.container.getBoundingClientRect().x); });
		element.on('mouseleave', unselect);
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
		r.meta.capacities = [];
		r.meta.minLimits = [];
		r.profiles.forEach(function(profile) {
			r.meta.cores.push(profile.hardware.data.threads);
			r.meta.capacities.push(profile.hardware.data.threads * profile.currentData.info.timeStep);
			r.meta.minLimits.push((profile.hardware.data.threads + 1) * profile.currentData.info.timeStep);
		});

		// Meta - settings
		r.meta.crenellate = r.settings.crenellate;

		// Enhance layout

		// Crenellate data
		function crenellateValue(profile, v) {
			return Math.round(v / profile.currentData.info.timeStep) * profile.currentData.info.timeStep;
		}

		// Redraw
		function repaint() {
			// Repaint container
			directive_repaint_container(r);

			// Vars
			var capacity = r.meta.cores[0]

			// Repaint scales
			directive_repaint_scales(r, [0, r.meta.minLimits[0]], [0, r.meta.minLimits[1]]);

			// Repaint graphical elements
			directive_repaint_xAxis(r);

			// Main draw
			var data, dataList, pointsC, pointsR, pointsBY;
			var scaleVCurrent;
			r.profiles.forEach(function(profile, index) {
				// vars
				data = profile.currentData;
				dataList = data[r.deck.v[0].cat];

				// All - points - start
				pointsC = [r.scaleX(r.meta.begin), r.scalesV[index](0)];
				pointsR = [r.scaleX(r.meta.begin), r.scalesV[index](0)];
				pointsBY = [r.scaleX(r.meta.begin), r.scalesV[index](r.meta.capacities[index])];

				// All - points - capacity
				pointsC.push.apply(pointsC, [r.scaleX(r.meta.begin), r.scalesV[index](r.meta.capacities[index]), r.scaleX(Math.min(r.meta.end, data.info.duration)), r.scalesV[index](r.meta.capacities[index])]);

				// All - points - data
				dataList.forEach(function(frame) {
					if (frame.t >= r.meta.begin && frame.t <= r.meta.end) {
						if (r.meta.crenellate)
							scaleVCurrent = [r.scalesV[index](crenellateValue(profile, frame.r)), r.scalesV[index](crenellateValue(profile, frame.yb) + r.meta.capacities[index])];
						else
							scaleVCurrent = [r.scalesV[index](frame.r), r.scalesV[index](frame.yb + r.meta.capacities[index])];

						pointsR.push.apply(pointsR, [r.scaleX(frame.t), scaleVCurrent[0], r.scaleX(frame.t + data.info.timeStep), scaleVCurrent[0]]);
						pointsBY.push.apply(pointsBY, [r.scaleX(frame.t), scaleVCurrent[1], r.scaleX(frame.t + data.info.timeStep), scaleVCurrent[1]]);

						if (index == 1 && r.meta.vMirror)
							r.meta.overflow[index] = Math.max(r.meta.overflow[index], scaleVCurrent[1] - r.layout.profile.height);
						else
							r.meta.overflow[index] = Math.max(r.meta.overflow[index], 0 - scaleVCurrent[1]);
					}
				});
				console.log(r.meta.overflow[index]);

				// All - points - end
				pointsC.push.apply(pointsC, [r.scaleX(Math.min(r.meta.end, data.info.timeMax) + data.info.timeStep), r.scalesV[index](0)]);
				pointsR.push.apply(pointsR, [r.scaleX(Math.min(r.meta.end, data.info.timeMax) + data.info.timeStep), r.scalesV[index](0)]);
				pointsBY.push.apply(pointsBY, [r.scaleX(Math.min(r.meta.end, data.info.timeMax) + data.info.timeStep), r.scalesV[index](r.meta.capacities[index])]);

				// Clean
				r.groupP[index].selectAll("*").remove();

				// Draw - Capacity
				r.groupP[index].append("polygon")
					.attr("class", "svg-limit")
					.attr("points", p2s(pointsC))
					.attr("fill", r.deck.limit.color);

				// Draw - Running
				r.groupP[index].append("polygon")
					.attr("class", "svg-limit")
					.attr("points", p2s(pointsR))
					.attr("fill", r.deck.v[0].color)
					.attr('stroke', r.deck.v[0].fcolor)
					.attr('stroke-width', 1);
				
				// Draw - Ready
				r.groupP[index].append("polygon")
					.attr("class", "svg-limit")
					.attr("points", p2s(pointsBY))
					.attr("fill", r.deck.v[1].color)
					.attr('stroke', r.deck.v[1].fcolor)
					.attr('stroke-width', 1);

				// Value axis
				directive_repaint_VAxis(r, index);

				// Limit line
				r.groupV[index].append("line")
					.attr("class", "line")
					.attr("x1", r.layout.profile.x + r.scaleX(r.meta.begin))
					.attr("x2", r.layout.profile.x + r.scaleX(Math.min(r.meta.end, data.info.timeMax) + data.info.timeStep))
					.attr("y1", r.scalesV[index](r.meta.capacities[index]))
					.attr("y2", r.scalesV[index](r.meta.capacities[index]))
					.attr('stroke', r.deck.limit.fcolor)
					.attr('stroke-width', 4)
					.attr('stroke-dasharray', 5.5);
			});

			// Post-treatment
			directive_repaint_post(r);
		}

		// Select
		function select(x) {
		}
		
		// Select
		function unselect() {
		}
		
		// Settigns changes
		function settings() {
			if (r.meta.crenellate != r.settings.crenellate) {
				r.meta.crenellate = r.settings.crenellate;
				repaint();
			}
		}

		// Bind
		directive_bind(r, repaint, select, unselect, settings);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});