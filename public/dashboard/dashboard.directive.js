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


app.directive('chartDashStack', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
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
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});


app.directive('chartDashDivergence', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
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
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});

app.directive('widgetDashTrack', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
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
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});


app.directive('widgetDashDeviation', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == widgetDashDeviation ==");

		// Layout
		var container = element[0];
		var layout = new indicatorDashLayout();

		// Attributes
		var deck = scope.indicator.deck;
		var meta = {};

		// Data
		var profiles = scope.selectedProfiles;

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
			var value, valueLimit, valueMax, pixelValue;
			var limitYSum = 0;
			var firstY = layout.deviance.height;
			profiles.forEach(function(profile, col_index) {

				// Reset position
				precedingPosition = layout.deviance.outerPadding;

				deck.forEach(function(dev_data, dev_index) {
						// Values
						value =			dev_data.v(profile);
						valueLimit =	dev_data.m;
						valueMax =		dev_data.x;
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
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});



app.directive('widgetDashCompare', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
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
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});
