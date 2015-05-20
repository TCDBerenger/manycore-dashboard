app.directive('widgetDash', ['$parse', '$injector', '$compile', function ($parse, $injector, $compile) {
	return {
		restrict: 'E',
		link: function (scope, element, attrs, controller) {
			var directiveName = null;
			switch (attrs.cat.toLowerCase()) {
				case 'tg':
					directiveName = 'widgetDashTrack';
					break;
				/*
				case 'sy':	directiveName = ''; break;
				case 'ds':	directiveName = ''; break;
				case 'lb':	directiveName = ''; break;
				case 'dl':	directiveName = ''; break;
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

var widgetDashLayout = function() {
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
			this.layout.height = this.layout.texts.values.height * 2 + this.layout.texts.app.height + rows * this.layout.donut.size;
		}
	};
};

app.directive('widgetDashTrack', function() {

	function chartThreadDivergence_link(scope, element, attrs, controller) {
		console.log("== directive == widgetDashTrack ==");

		// Layout
		var container = element[0];
		var layout = new widgetDashLayout();

		// Attributes
		var cat = scope.category;
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


		function getArcData(c, r, v) {
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
			data = scope.getWigdetData(cat.cat);

			// Precomputation
			layout.widget.compute(profiles.length, 2);

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
			var arc_data;
			data.forEach(function(c_data, c_index) {
				c_data.forEach(function(r_data, r_index) {
					r_data.forEach(function(d_data, d_index) {
						// Data
						arc_data = getArcData(c_index, r_index, d_data.v);

						// Background
						donutGroups[c_index][r_index].append("path")
							.attr("d", d3.svg.arc()
										.innerRadius(layout.donuts[d_index].inner)
										.outerRadius(layout.donuts[d_index].outer)
										.startAngle(arc_data.b.s)
										.endAngle(arc_data.b.e))
							.attr("fill", d_data.b);
						
						// Value
						if (d_data.v >= 0.005) {
							donutGroups[c_index][r_index].append("path")
								.attr("d", d3.svg.arc()
											.innerRadius(layout.donuts[d_index].inner)
											.outerRadius(layout.donuts[d_index].outer)
											.startAngle(arc_data.c.s)
											.endAngle(arc_data.c.e))
								.attr("fill", d_data.c);
						}

						// Value label
						valueGroups[c_index][r_index].append("text")
							.attr("x", (c_index == 0) ? layout.donut.size - layout.donuts[d_index].text : layout.donuts[d_index].text)
							.attr("y", 0)
							.attr("text-anchor", "middle")
							.style("fill", d_data.c)
							.text(d_data.l);

						// Label
						if (c_index == 0) {
							labelGroups[r_index].append("text")
								.attr("x", layout.texts.indicators.width / 2)
								.attr("y", (r_index == 0) ? layout.donut.size - layout.donuts[d_index].text : layout.donuts[d_index].text + 2)
								.attr("text-anchor", "middle")
								.style("fill", d_data.c)
								.text(d_data.t);
						}
					});
				});


				// App text
				appGroup.append("text")
					.attr("x", (layout.donut.size / 2) + c_index * (layout.donut.size + layout.texts.indicators.width))
					.attr("y", layout.texts.app.size + 1)
					.attr("text-anchor", "middle")
					.attr("font-size", layout.texts.app.size + "px")
					.attr("font-weight", "bold")
					.text(profiles[c_index].label);
			});

		}


		scope.$watch(function() { return scope.selectedProfiles.length * scope.selectedProfiles[0].id; }, redraw);
	}

	return {
		link: chartThreadDivergence_link,
		restrict: 'E'
	}
});
