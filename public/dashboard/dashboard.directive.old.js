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