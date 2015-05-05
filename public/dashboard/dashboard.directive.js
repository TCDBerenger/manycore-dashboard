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
		console.log(data);
		var profile = scope.data.profile;
		var timeMin = 0;			// When the user selection starts
		var timeMax = data.info.duration;
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
		scaleX.domain([timeMin, timeMax]);

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
				.attr("fill", "#B4464B");

		// Draw - running
		var runningGroup = svg.append("g").attr("class", "dataset");
		var runningAreaFunction = d3.svg.area()
				.x(function(d) { return scaleX(d.t); })
				.y0(function(d) { return scaleY(dataValueMax - d.r); })
				.y1(scaleYCoreCapacity)
				.interpolate(interpolationMethod);
		var runningArea = runningGroup.append("path")
				.attr("d", runningAreaFunction(data.times)) // 🕒 repaintable
				.attr("fill", "#4BB446");

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

		// Redraw - bind
		scope.$watch(function() { return container.clientWidth; }, repaint);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});