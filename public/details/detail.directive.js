app.directive('chartDataGeneric', function() {

	function link(scope, el, attribute) {
		var data = [
				scope.data[scope.profiles[0].id].stats.cycles,
				scope.data[scope.profiles[0].id].stats.cyclesRunning,
				scope.data[scope.profiles[0].id].stats.cyclesReady
			];
		console.log(data);
		var color = d3.scale.category10()
		var el = el[0];
		var width = el.clientWidth
		var height = el.clientHeight
		var min = Math.min(width, height)
		var pie = d3.layout.pie().sort(null)
		var arc = d3.svg.arc()
		  .outerRadius(min / 2 * 0.9)
		  .innerRadius(min / 2 * 0.5)
		var svg = d3.select(el).append('svg')
		var g = svg.append('g')

		// add the <path>s for each arc slice
		var arcs = g.selectAll('path').data(pie(data))
			.enter().append('path')
				.style('stroke', 'white')
				.attr('fill', function(d, i){ return color(i) });

		scope.$watch(
			function() {
				return el.clientHeight * el.clientWidth;
			},
			function() {
				height = el.clientHeight;
				width = el.clientWidth;
				min = Math.min(width, height);
				arc.outerRadius(min / 2 * 0.9).innerRadius(min / 2 * 0.5);
				svg.attr({width: width, height: height});
				g.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
				arcs.attr('d', arc);
			});
	}

	return {
		link: link,
		restrict: 'E'
	}
});