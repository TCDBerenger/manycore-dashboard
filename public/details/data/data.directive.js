/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/


/**********************************************************/
/*														  */
/*	Common directive mecanisms							  */
/*														  */
/**********************************************************/




/**********************************************************/
/*														  */
/*	Directives											  */
/*														  */
/**********************************************************/

/**
 * Stats
 */
app.directive('chartStats', function() {

	function chartDataStackedbars_link(scope, element, attrs, controller) {
		console.log("== directive == chartStats ==");

		// Data - set
		var ids = scope.ids;
		var deck = scope.widget.deck.data;

		// Data - Copy
		var data = [];
		var dataValueSumMax = 0;
		var dataElement, dataPreviousValue, dataValueSum;
		ids.forEach(function(id) {
			dataElement = [];
			dataValueSum = 0;
			dataPreviousValue = 0;
			deck.forEach(function(element) {
				dataValueSum += scope.data[id].stats[element.cat][element.attr];
				dataElement.push({
					attr: element.attr,
					previous: dataPreviousValue,
					value: scope.data[id].stats[element.cat][element.attr]
				});
				dataPreviousValue += scope.data[id].stats[element.cat][element.attr];
			});
			dataValueSumMax = Math.max(dataValueSum, dataValueSumMax);
			data.push(dataElement);
		});


		// Vars - layout
		var color = d3.scale.category20();
		var container = element[0];
		var layout = {
			boxes: { width: 10, padding: 2 },
			lineHeight: 33
		};
		layout.width = layout.boxes.width * ids.length + layout.boxes.padding;
		layout.height = layout.lineHeight * deck.length;

		// Vars - paint
		var svg = d3.select(container).append('svg').attr({width: layout.width, height: layout.height});

		// Vars - scales
		var scaleY = d3.scale.linear()
				.rangeRound([0, layout.height])
				.domain([0, dataValueSumMax]);


		// Draw rectanges
		// Draw rectanges - X axis
		var boxes = svg.selectAll(".label")
			.data(data).enter()
			.append("g")
				.attr("transform", function (d, i) {
					return "translate(" + (i * (layout.boxes.width + layout.boxes.padding)) + ", 0)";
				});

		// Draw rectanges - Y axis
		boxes.selectAll("rect")
			.data(function (d) {
				return d;
			}).enter()
			.append("rect")
				.attr("width", layout.boxes.width)
				.attr("y", function (d) {
					return layout.height - scaleY(d.previous) - scaleY(d.value);
				})
				.attr("height", function (d) {
					return scaleY(d.value);
				})
				.style("fill", function (d, i, j) {
					return deck[i].color;
				});
	};


	return {
		link: chartDataStackedbars_link,
		restrict: 'E'
	}
});