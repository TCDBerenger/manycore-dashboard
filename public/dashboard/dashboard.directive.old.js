app.directive('chartSequence', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartSequence ==");

		// Layout
		var container = element[0];
		var layout = {
			margin: { top: 4, right: 12, bottom: 4, left: 12},
			pad: { width: 10},
			height:	60,
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
		var profiles = [];
		var timeMin = 0;
		var timeMax = 0;
		var timeStart = +attrs.timestart;			// The common min time
		var timeEnd = +attrs.timeend;				// The common max time

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});
		//svg.style("background", "#EEEEEE");

		// Scales
		var scaleX = d3.scale.linear();
		var scaleY = d3.scale.linear().rangeRound([layout.graph.bottom(), layout.graph.top()]);

		// Scales - domains
		scaleY.domain([0, 100]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);

		// Draw - groups
		var coreGroup = svg.append("g").attr("class", "core");
		var profileGroup = svg.append("g").attr("class", "profiles");
		var padGroup = svg.append("g").attr("class", "pads");

		// Draw - core
		var backgroundElement = coreGroup.append("rect")
			.attr("height", layout.graph.height)
			.attr("x", layout.graph.left)
			.attr("y", layout.graph.top)
			.style("fill", "#D2D2D2");

		// Draw - Pad left
		var padLeftElement = padGroup.append("g").attr("class", "pad-left")
			.attr("transform", "translate(" + (layout.graph.left() - layout.pad.width) + ",0)");
		padLeftElement.append("rect")
			.attr("width", layout.pad.width)
			.attr("height", layout.graph.height)
			.attr("x", 0)
			.attr("y", layout.graph.top)
			.style("fill", "#ABABAB")
			.attr("stroke", "#333333")
			.attr("stroke-width", 1);
		padLeftElement.append("line")
			.attr("class", "line")
			.attr("x1", layout.pad.width).attr("x2", layout.pad.width)
			.attr("y1", 0).attr("y2", layout.height)
			.attr('stroke', '#333333')
			.attr('stroke-width', 2)
			.attr('fill', 'none');
		padLeftElement.append("text")
			.attr("x", layout.pad.width / 2)
			.attr("y", layout.graph.top() + layout.graph.height() / 2)
			.attr("text-anchor", "middle")
			.style("fill", "#333333")
			.text("▶");

		// Draw - Pad right
		var padRightElement = padGroup.append("g").attr("class", "pad-right")
			.attr("transform", "translate(" + layout.graph.right() + ",0)");
		padRightElement.append("rect")
			.attr("width", layout.pad.width)
			.attr("height", layout.graph.height)
			.attr("x", 0)
			.attr("y", layout.graph.top)
			.style("fill", "#ABABAB")
			.attr("stroke", "#333333")
			.attr("stroke-width", 1);
		padRightElement.append("line")
			.attr("class", "line")
			.attr("x1", 0).attr("x2", 0)
			.attr("y1", 0).attr("y2", layout.height)
			.attr('stroke', '#333333')
			.attr('stroke-width', 2)
			.attr('fill', 'none');
		padRightElement.append("text")
			.attr("x", layout.pad.width / 2)
			.attr("y", layout.graph.top() + layout.graph.height() / 2)
			.attr("text-anchor", "middle")
			.style("fill", "#333333")
			.text("◀");

		// Draw - pad area
		var profileElements = profileGroup.selectAll(".profiles");

		

		// Compute data
		var compute = function() {
			console.log('Need to recompute');

			// Get data from scope
			// We don't erase the instance of the profile array
			profiles.splice(0, profiles.length);
			scope.getprofileData().forEach(function(profile) {
				profiles.push(profile);
			});

			console.log('profile data: ' + profiles.length);

			// Find the max length
			timeMax = 0;
			profiles.forEach(function(profile) {
				timeMax = Math.max(timeMax, profile.info.duration);
			});
			timeEnd = timeMax;

			// Scales
			scaleX.domain([timeMin, timeMax]);

			repaint();
		}

		// Redraw
		var repaint = function repaint() {
			// Sizes
			layout.width = container.clientWidth;

			// Scales
			scaleX.rangeRound([layout.graph.left(), layout.graph.right()]);

			// SVG
			svg.attr('width', layout.width);

			// Core
			backgroundElement.attr("width", layout.graph.width);

			// Pads
			padRightElement.attr("transform", "translate(" + layout.graph.right() + ",0)");

			// Profiles
			profileElements
				.data(profiles).enter().append("rect")
					.attr("width", function(d) { return scaleX(d.info.duration) - scaleX(0); })
					.attr("height", function(d, i, j) { return layout.graph.height() / profiles.length; })
					.attr("x", scaleX(0))
					.attr("y", function(d, i, j) { console.log('i: '+i+' j: '+j); return scaleY(100 - 50 * i); })
					.style("fill", "#008CBA");
		};

		// compute();

		// Binds
		scope.$watch(function() { return scope.dataVersion; }, compute);
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});

app.directive('chartDashDivergence', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartDashDivergence ==");

		// Layout
		var container = element[0];
		var layout = {
			height:	function() { return container.clientHeight; },
			width:	function() { return container.clientWidth; }
		};

		// Data
		var data = scope.data[attrs.profileid];
		var profile = scope.data.profile;
		var timeMin = 0;
		var timeMax = data.info.duration;
		var timeStart = scope.data.c.timeMin;		// When the user selection starts
		var timeEnd = scope.data.c.duration;		// When the user selection ends (could be before or after timeMax)
		var numberCores = data.info.cores;
		var dataValueMax = numberCores * data.info.timeStep;

		// Fix column layout
		var lastElement = angular.copy(data.times[data.times.length - 1], {});
		lastElement.t = timeMax;
		data.times.push(lastElement);

		// DOM
		var svg = d3.select(container).append('svg').attr({width: layout.width(), height: layout.height()});

		// Scales
		var scaleX = d3.scale.linear().rangeRound([0, layout.width]);
		var scaleY = d3.scale.linear().rangeRound([layout.height(), 0]);

		// Scales - domains
		scaleY.domain([0, 2 * dataValueMax]);
		scaleX.domain([timeStart, timeEnd]);

		// Axis
		var xAxis = d3.svg.axis().scale(scaleX);
		var yAxis = d3.svg.axis().scale(scaleY).orient("left");


		// Draw
		var scaleYCoreCapacity = scaleY(dataValueMax);
		var interpolationMethod = "step-after";

		// Draw - ready
		var readyGroup = svg.append("g").attr("class", "dataset");
		var readyAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(dataValueMax); })
				.y1(function(d) { return scaleY(dataValueMax + d.ys); })
				.interpolate(interpolationMethod);
		var readyArea = readyGroup.append("path")
				.attr("d", readyAreaFunction(data.times)) // 🕒 repaintable
				.attr("fill", "#D32A0E");

		// Draw - running
		var runningGroup = svg.append("g").attr("class", "dataset");
		var runningAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(dataValueMax - d.r); })
				.y1(scaleYCoreCapacity)
				.interpolate(interpolationMethod);
		var runningArea = runningGroup.append("path")
				.attr("d", runningAreaFunction(data.times)) // 🕒 repaintable
				.attr("fill", "#358753");

		// Recompute
		var recompute = function recompute() {
				scaleX.domain([scope.data.c.timeMin, scope.data.c.duration]);

				// Repaint
				repaint();
			};


		// Redraw
		var repaint = function repaint() {
				// Scales
				scaleX.rangeRound([0, layout.width()]);
				scaleXStep = scaleX(data.info.timeStep);

				// SVG
				svg.attr('width', layout.width());
				readyArea.attr("d", readyAreaFunction(data.times));
				runningArea.attr("d", runningAreaFunction(data.times));
			};

		// Binds
		scope.$watch(function() { return scope.data.c.duration; }, recompute);
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});



app.directive('chartDashStack', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == chartDashStack ==");

		// Layout
		var container = element[0];
		var layout = new widgetDashLayout();

		// Attributes
		var deck = scope.category.deck;
		var meta = new widgetDashMeta(attrs);

		// Data
		var data = scope.data[scope.profile.id];

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
				.domain([0, 100]);


		// Draw
		var interpolationMethod = "step-after";

		// Draw - compute
		var scaleYMin = scaleY(0);
		var scaleYMax = scaleY(100);

		// Draw - ready
		var deckFunctions = [];
		var deckElements = [];
		deck.data.forEach(function(set, i) {
			// Draw function
			if (i == 0)
				deckFunctions.push(
					d3.svg.area()
						.x(function(d) { return scaleX(d.t); })
						.y0(scaleYMin)
						.y1(function(d) { return scaleY(d[set.attr]); })
						.interpolate(interpolationMethod)
				);
			else
				deckFunctions.push(
					d3.svg.area()
						.x(function(d) { return scaleX(d.t); })
						.y0(function(d) { return scaleY(100 - d[set.attr]); })
						.y1(scaleYMax)
						.interpolate(interpolationMethod)
				);

			// Draw element
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
				scaleX
					.rangeRound([layout.graph.left(), layout.graph.right()])
					.domain([meta.begin, meta.end]);
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


app.directive('widgetDashCompare', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == widgetDashCompare ==");

		// Layout
		var container = element[0];
		var layout = new indicatorDashLayout();

		// Attributes
		var deck = scope.indicator.deck;
		var meta = {};

		// Data
		var profiles = scope.selectedProfiles;
		var data;
		var startAngle = 1.5 * Math.PI;

		// DOM
		var svg = d3.select(container).append('svg');

		// Groups
		var donutSupergroup = svg.append("g")
			.attr("transform", "translate(" + layout.arc.arc + "," + layout.arc.arc + ")")
			.attr("class", "svg-dataset");
		var donutGroups = [
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-top svg-donut-left"),
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-top svg-donut-right")
					.attr("transform", "translate(" + (layout.arc.width + layout.arc.padding) + ",0)")
			];

		var valueSupergroup = svg.append("g")
			.attr("transform", "translate(0," + (layout.arc.height + 14 ) + ")")
			.attr("class", "svg-label");
		var valueGroups = [
				valueSupergroup.append("g").attr("class", "svg-donut-top svg-donut-left"),
				valueSupergroup.append("g").attr("class", "svg-donut-top svg-donut-right")
					.attr("transform", "translate(" + (layout.arc.width + layout.arc.padding) + ",0)")
			];
		
		var appGroup = svg.append("g").attr("class", "svg-text svg-text-app")
				.attr("transform", "translate(" + 0 + "," + (layout.arc.height + layout.texts.values.height) + ")");


		// Big painting function
		function redraw() {
			// Precomputation
			layout.arc.compute(profiles.length);

			// DOM
			svg.attr({width: layout.width, height: layout.height});
			d3.select(container)
				.style('width', layout.width + 'px')
				.style('height', layout.height + 'px')
				.style('background', 'transparent');

			// Clean
			donutSupergroup.selectAll("path").remove();
			valueSupergroup.selectAll("text").remove();
			appGroup.selectAll("text").remove();


			// Draw
			var precedingAngle, arc_endAngle;
			profiles.forEach(function(profile, col_index) {
				// Reset position
				precedingAngle = startAngle;

				deck.forEach(function(arc_data, arc_index) {
					// Values
					arc_endAngle = precedingAngle + Math.PI * arc_data.v(profile);

					// Arc
					if (arc_data.v(profile) >= 0.005) {
						donutGroups[col_index].append("path")
							.attr("d", d3.svg.arc()
										.innerRadius(layout.arc.arc - layout.arc.size)
										.outerRadius(layout.arc.arc)
										.startAngle(precedingAngle)
										.endAngle(arc_endAngle))
							.attr("fill", arc_data.c);

						precedingAngle = arc_endAngle;
					}

					// Value label
					valueGroups[col_index].append("text")
						.attr("x", (arc_index == 0) ? layout.arc.size / 2 : layout.arc.width - layout.arc.size / 2)
						.attr("y", 0)
						.attr("text-anchor", "middle")
						.style("fill", arc_data.c)
						.text(arc_data.l(profile));

				});


				// App text
				if (profiles.length > 1) {
					appGroup.append("text")
						.attr("x", layout.arc.arc + col_index * (layout.arc.width + layout.arc.padding))
						.attr("y", layout.texts.app.size + 1)
						.attr("text-anchor", "middle")
						.attr("font-size", layout.texts.app.size + "px")
						.attr("font-weight", "bold")
						.text(profiles[col_index].label);
				}
			});
		}


		scope.$watch(function() { return scope.selectedProfiles.length * scope.selectedProfiles[0].id; }, redraw);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});

app.directive('widgetDashTrack', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log("== directive == widgetDashTrack ==");

		// Layout
		var container = element[0];
		var layout = new indicatorDashLayout();

		// Attributes
		var deck = scope.indicator.deck;
		var meta = {
		};

		// Data
		var profiles = scope.selectedProfiles;
		var data;

		// DOM
		var svg = d3.select(container).append('svg');

		// Groups
		var donutSupergroup = svg.append("g")
			.attr("transform", "translate(" + layout.donut.size + "," + layout.donut.size + ")")
			.attr("class", "svg-dataset");
		var donutGroups = [[
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-top svg-donut-left"),
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-bottom svg-donut-left")
					.attr("transform", "translate(0," + (layout.texts.values.height * 2 + layout.texts.app.height) + ")")
			], [
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-top svg-donut-right")
					.attr("transform", "translate(" + layout.donut.padding + ",0)"),
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-bottom svg-donut-right")
					.attr("transform", "translate(" + layout.donut.padding + "," + (layout.texts.values.height * 2 + layout.texts.app.height) + ")")
			]];

		var valueSupergroup = svg.append("g")
			.attr("transform", "translate(0," + (layout.donut.size + 14 ) + ")")
			.attr("class", "svg-label");
		var valueGroups = [[
				valueSupergroup.append("g").attr("class", "svg-donut-top svg-donut-left"),
				valueSupergroup.append("g").attr("class", "svg-donut-bottom svg-donut-left")
					.attr("transform", "translate(" + 0 + "," + (layout.texts.values.height + layout.texts.app.height) + ")")
			], [
				valueSupergroup.append("g").attr("class", "svg-donut-top svg-donut-right")
					.attr("transform", "translate(" + (layout.donut.size + layout.donut.padding) + ",0)"),
				valueSupergroup.append("g").attr("class", "svg-donut-bottom svg-donut-right")
					.attr("transform", "translate(" + (layout.donut.size + layout.donut.padding) + "," + (layout.texts.values.height + layout.texts.app.height)  + ")")
			]];
		
		var appGroup = svg.append("g").attr("class", "svg-text svg-text-app")
				.attr("transform", "translate(" + 0 + "," + (layout.donut.size + layout.texts.values.height) + ")");


		function getArcLayoutData(c, r, v) {
			dpi = Math.PI / 2;
			v = Math.max(0, Math.min(1, v));
			var d = { c: { s: 0, e: 0 }, b: { s: 0, e: 0 } };

			if (c == 0 && r == 0) {
				d.c.s = dpi * 3;
				d.c.e = dpi * (3 + v);
				d.b.s = dpi * (3 + v);
				d.b.e = dpi * 4;
			}
			else if (c == 0 && r == 1) {
				d.c.s = dpi * (3 - v);
				d.c.e = dpi * 3;
				d.b.s = dpi * 2;
				d.b.e = dpi * (3 - v);
			}
			else if (c == 1 && r == 0) {
				d.c.s = dpi * (1 - v);
				d.c.e = dpi;
				d.b.s = 0;
				d.b.e = dpi * (1 - v);
			}
			else if (c == 1 && r == 1) {
				d.c.s = dpi;
				d.c.e = dpi * (v + 1);
				d.b.s = dpi * (v + 1);
				d.b.e = dpi * 2;
			}

			return d;
		}


		// Big painting function
		function redraw() {
			// Retrieve data
			data = scope.getIndicatorData();

			// Precomputation
			layout.donut.compute(profiles.length, (deck.length > 1 && deck[1].length > 0) ? 2 : 1);

			// DOM
			svg.attr({width: layout.width, height: layout.height});
			d3.select(container)
				.style('width', layout.width + 'px')
				.style('height', layout.height + 'px')
				.style('background', 'transparent');

			// Clean
			donutSupergroup.selectAll("path").remove();
			valueSupergroup.selectAll("text").remove();
			appGroup.selectAll("text").remove();


			// Draw
			// c: column : profile
			// r: row
			// d: donut : one arc
			var arc_layout, arc_precedingRadius, arc_precedingEnd, arc_value;
			var indicator_onLeft = profiles.length == 1;
			var inGroup = 0;
			data.forEach(function(col_data, col_index) {
				deck.forEach(function(row_data, row_index) {
					row_data.forEach(function(arc_data, arc_index) {
						// Data
						arc_layout = getArcLayoutData(col_index, row_index, arc_data.v(col_data));

						// Are we in a group ?
						if (inGroup > 0) {
							inGroup--;
							arc_precedingRadius--;
							arc_value = Math.max(0, Math.min(1, arc_data.v(col_data))) * Math.PI / 2;

							// Value
							if (arc_data.v(col_data) >= 0.005) {

								if (col_index + row_index != 1) {
									donutGroups[col_index][row_index].append("path")
										.attr("d", d3.svg.arc()
													.innerRadius(layout.donuts[arc_index + arc_precedingRadius].inner)
													.outerRadius(layout.donuts[arc_index + inGroup].outer)
													.startAngle(arc_precedingEnd)
													.endAngle(arc_precedingEnd + arc_value))
										.attr("fill", arc_data.c);
									arc_precedingEnd += arc_value;
								} else {
									donutGroups[col_index][row_index].append("path")
										.attr("d", d3.svg.arc()
													.innerRadius(layout.donuts[arc_index + arc_precedingRadius].inner)
													.outerRadius(layout.donuts[arc_index + inGroup].outer)
													.startAngle(arc_precedingEnd - arc_value)
													.endAngle(arc_precedingEnd))
										.attr("fill", arc_data.c);
									arc_precedingEnd -= arc_value;
								}

							}


						} else {
							// Do we start a new group ?
							if (arc_data.hasOwnProperty('g')) {
								inGroup = arc_data.g - 1;
								arc_precedingRadius = 0;

								if (col_index + row_index != 1) {
									arc_precedingEnd = arc_layout.c.e;
								} else {
									arc_precedingEnd = arc_layout.c.s;
								}

							} else {
								inGroup = 0;
								arc_precedingRadius = null;
								arc_precedingEnd = null;

								// Background (useless in a group)
								donutGroups[col_index][row_index].append("path")
									.attr("d", d3.svg.arc()
												.innerRadius(layout.donuts[arc_index].inner)
												.outerRadius(layout.donuts[arc_index].outer)
												.startAngle(arc_layout.b.s)
												.endAngle(arc_layout.b.e))
									.attr("fill", arc_data.b);
							}


							// Value
							if (arc_data.v(col_data) >= 0.005) {
								donutGroups[col_index][row_index].append("path")
									.attr("d", d3.svg.arc()
												.innerRadius(layout.donuts[arc_index].inner)
												.outerRadius(layout.donuts[arc_index + inGroup].outer)
												.startAngle(arc_layout.c.s)
												.endAngle(arc_layout.c.e))
									.attr("fill", arc_data.c);
							}
						}

						// Value label
						valueGroups[col_index][row_index].append("text")
							.attr("x", (col_index == 0) ? layout.donut.size - layout.donuts[arc_index].text : layout.donuts[arc_index].text)
							.attr("y", 0)
							.attr("text-anchor", "middle")
							.style("fill", arc_data.c)
							.text(arc_data.l(col_data));
					});
				});


				// App text
				if (profiles.length > 1) {
					appGroup.append("text")
						.attr("x", (layout.donut.size / 2) + col_index * (layout.donut.size + layout.donut.padding))
						.attr("y", layout.texts.app.size + 1)
						.attr("text-anchor", "middle")
						.attr("font-size", layout.texts.app.size + "px")
						.attr("font-weight", "bold")
						.text(profiles[col_index].label);
				}
			});

		}


		scope.$watch(function() { return scope.selectedProfiles.length * scope.selectedProfiles[0].id; }, redraw);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});
