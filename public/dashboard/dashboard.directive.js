app.directive('widgetDash', ['$parse', '$injector', '$compile', function ($parse, $injector, $compile) {
	return {
		restrict: 'E',
		link: function (scope, element, attrs, controller) {
			var directiveName = null;
			switch (attrs.tag.toLowerCase()) {
				case 'tg':
					directiveName = 'chartDashDivergence';
					break;
				/*
				case 'lb':
				case 'dl':
				case 'sy':	directiveName = ''; break;
				case 'ds':	directiveName = ''; break;
				case 'rs':	directiveName = ''; break;
				case 'io':	directiveName = ''; break;
				*/
			}
			if (directiveName != null) {
				$injector.get(directiveName + 'Directive')[0].link(scope, element, attrs, controller);
			}
		}
	}
}]);
app.directive('indicatorDash', ['$parse', '$injector', '$compile', function ($parse, $injector, $compile) {
	return {
		restrict: 'E',
		link: function (scope, element, attrs, controller) {
			var directiveName = attrs.graph;
			if (directiveName != null) {
				$injector.get(directiveName + 'Directive')[0].link(scope, element, attrs, controller);
			}
		}
	}
}]);

var widgetDashLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	this.margin		= { top: 0, right: 0, bottom: 0, left: 0 };
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
	this.donut		= { size: 100 };
	this.donuts		= [
		{	inner: 20,	outer: 40,	text: 30},
		{	inner: 50,	outer: 70,	text: 60},
		{	inner: 80,	outer: 100,	text: 90}
	];
	this.texts		= {
		indicators:	{
			width:	100
		},
		values:	{
			height:	20
		},
		app:	{
			height:	20,
			size:	14,
		}
	};
	this.height		= NaN;
	this.width		= NaN;
	this.widget		= {
		layout:	this,
		compute: function(cols, rows) {
			this.layout.width = this.layout.texts.indicators.width + cols * this.layout.donut.size;
			this.layout.height = this.layout.texts.app.height + rows * (this.layout.donut.size + this.layout.texts.values.height);
		}
	};
};


app.directive('chartDashDivergence', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == chartDashDivergence ==");

		// Layout
		var container = element[0];
		var layout = new widgetDashLayout();

		// Attributes
		var deck = scope.category.deck;
		var profile = scope.profile;
		var meta = new widgetDashMeta(attrs);

		// Data
		var data = scope.data[profile.id];
		var numberCores = data.info.cores;
		var dataValueMax = numberCores * data.info.timeStep;

		// Fix column layout
		var lastElement = angular.copy(data.times[data.times.length - 1], {});
		lastElement.t = data.info.duration;
		data.times.push(lastElement);

		// DOM
		var svg = d3.select(container).append('svg').attr('height', layout.height);
		console.log(layout.height);

		// Scales
		var scaleX = d3.scale.linear();
		var scaleY = d3.scale.linear().rangeRound([layout.height, 0]);
		console.log(layout.height);

		// Scales - domains
		scaleY.domain([0, 2 * dataValueMax]);


		// Draw
		var scaleYCoreCapacity = scaleY(dataValueMax);
		var interpolationMethod = "step-after";

		// Draw - ready
		var readyGroup = svg.append("g").attr("class", "dataset");
		var readyAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(dataValueMax); })
				.y1(function(d) { return scaleY(dataValueMax + d[deck.data[1].attr]); })
				.interpolate(interpolationMethod);
		var readyArea = readyGroup.append("path")
				.attr("fill", deck.data[1].fcolor);

		// Draw - running
		var runningGroup = svg.append("g").attr("class", "dataset");
		var runningAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(dataValueMax - d[deck.data[0].attr]); })
				.y1(scaleYCoreCapacity)
				.interpolate(interpolationMethod);
		var runningArea = runningGroup.append("path")
				.attr("fill", deck.data[0].fcolor);


		// (Re) Paint
		var redraw = function redraw() {
				// Layout
				layout.width = container.clientWidth;

				// Params
				meta.begin = 0;
				meta.end = data.info.duration;

				// Scales
				scaleX.rangeRound([0, layout.width]).domain([meta.begin, meta.end]);
				scaleXStep = scaleX(data.info.timeStep);

				// Container
				d3.select(container)
					.style('height', layout.height + 'px')
					.style('background', 'transparent');

				// SVG
				svg.attr('width', layout.width);
				readyArea.attr("d", readyAreaFunction(data[deck.data[0].cat]));
				runningArea.attr("d", runningAreaFunction(data[deck.data[0].cat]));
			};

		// Binds
		scope.$watch(function() { return container.clientWidth * scope.selectedProfiles[0].id; }, redraw);
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
		var donutSupergroup = svg.append("g").attr("transform", "translate(" + layout.donut.size + "," + layout.donut.size + ")");
		var donutGroups = [[
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-top svg-donut-left"),
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-bottom svg-donut-left")
					.attr("transform", "translate(0," + (layout.texts.values.height * 2 + layout.texts.app.height) + ")")
			], [
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-top svg-donut-right")
					.attr("transform", "translate(" + layout.texts.indicators.width + ",0)"),
				donutSupergroup.append("g").attr("class", "svg-donut svg-donut-bottom svg-donut-right")
					.attr("transform", "translate(" + layout.texts.indicators.width + "," + (layout.texts.values.height * 2 + layout.texts.app.height) + ")")
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
					.attr("transform", "translate(" + (layout.donut.size + layout.texts.indicators.width) + ",0)"),
				valueSupergroup.append("g").attr("class", "svg-donut-bottom svg-donut-right")
					.attr("transform", "translate(" + (layout.donut.size + layout.texts.indicators.width) + "," + (layout.texts.values.height + layout.texts.app.height)  + ")")
			]];
		
		var labelSupergroup = svg.append("g")
			.attr("transform", "translate(" + layout.donut.size  + ",0)")
			.attr("class", "svg-text");
		var labelGroups = [
				labelSupergroup.append("g").attr("class", "svg-donut-top"),
				labelSupergroup.append("g").attr("class", "svg-donut-bottom")
					.attr("transform", "translate(0," + (layout.donut.size + layout.texts.values.height * 2 + layout.texts.app.height) + ")")
			];
		
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
				console.log(c, r, v);
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
			layout.widget.compute(profiles.length, (deck.length > 0 && deck[1].length > 0) ? 2 : 1);

			// DOM
			svg.attr({width: layout.width, height: layout.height});
			d3.select(container)
				.style('width', layout.width + 'px')
				.style('height', layout.height + 'px')
				.style('background', 'transparent');

			// Clean
			donutSupergroup.selectAll("path").remove();
			valueSupergroup.selectAll("text").remove();
			labelSupergroup.selectAll("text").remove();
			appGroup.selectAll("text").remove();


			// Draw
			// c: column : profile
			// r: row
			// d: donut : one arc
			var arc_layout;
			var indicator_onLeft = profiles.length == 1;
			data.forEach(function(col_data, col_index) {
				deck.forEach(function(row_data, row_index) {
					row_data.forEach(function(arc_data, arc_index) {
						// Data
						arc_layout = getArcLayoutData(col_index, row_index, arc_data.v(col_data));

						// Background
						donutGroups[col_index][row_index].append("path")
							.attr("d", d3.svg.arc()
										.innerRadius(layout.donuts[arc_index].inner)
										.outerRadius(layout.donuts[arc_index].outer)
										.startAngle(arc_layout.b.s)
										.endAngle(arc_layout.b.e))
							.attr("fill", arc_data.b);
						
						// Value
						if (arc_data.v(col_data) >= 0.005) {
							donutGroups[col_index][row_index].append("path")
								.attr("d", d3.svg.arc()
											.innerRadius(layout.donuts[arc_index].inner)
											.outerRadius(layout.donuts[arc_index].outer)
											.startAngle(arc_layout.c.s)
											.endAngle(arc_layout.c.e))
								.attr("fill", arc_data.c);
						}

						// Value label
						valueGroups[col_index][row_index].append("text")
							.attr("x", (col_index == 0) ? layout.donut.size - layout.donuts[arc_index].text : layout.donuts[arc_index].text)
							.attr("y", 0)
							.attr("text-anchor", "middle")
							.style("fill", arc_data.c)
							.text(arc_data.l(col_data));

						// Label
						if (col_index == 0) {
							labelGroups[row_index].append("text")
								.attr("x", (indicator_onLeft) ? 6 : layout.texts.indicators.width / 2)
								.attr("y", (row_index == 0) ? layout.donut.size - layout.donuts[arc_index].text : layout.donuts[arc_index].text + 2)
								.attr("text-anchor", (indicator_onLeft) ? "start" : "middle")
								.style("fill", arc_data.c)
								.text(arc_data.t);
						}
					});
				});


				// App text
				appGroup.append("text")
					.attr("x", (layout.donut.size / 2) + col_index * (layout.donut.size + layout.texts.indicators.width))
					.attr("y", layout.texts.app.size + 1)
					.attr("text-anchor", "middle")
					.attr("font-size", layout.texts.app.size + "px")
					.attr("font-weight", "bold")
					.text(profiles[col_index].label);
			});

		}


		scope.$watch(function() { return scope.selectedProfiles.length * scope.selectedProfiles[0].id; }, redraw);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});
