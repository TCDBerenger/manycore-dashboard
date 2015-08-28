/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/

/**
 * Layout for stats
 */
var statLayout = function() {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;
	
	// Constants
	this.stacks =		{ width: 10, padding: 4 };
	this.lineHeight =	40;

	// Compute
	this.refresh = function(deck, profiles) {
		self.width =	(profiles.length == 1) ? self.stacks.width : self.stacks.width * 2 + self.stacks.padding;
		self.height =	self.lineHeight * deck.length;
	};
};

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

		// Layout
		var container = element[0];
		var layout = new statLayout();
		
		// Attributes
		var stats = scope.stats;
		var profiles = scope.profiles;
		var deck = scope.widget.deck.data;
		
		// Compute layout
		layout.refresh(deck, profiles);

		// DOM
		d3.select(container)
			.style('background', 'transparent')
			.attr('height', layout.height);
		var svg = d3.select(container).append('svg')
			.attr({width: layout.width, height: layout.height})
			.attr('class', "svg-stats");
			
		// Groups
		var groupS = [];
		groupS.push(svg.append("g")
			.attr('class', "svg-stack svg-profile-1"));
		if (profiles.length == 2)
			groupS.push(svg.append("g")
				.attr('class', "svg-stack svg-profile-2")
				.attr("transform", "translate(" + (layout.stacks.width + layout.stacks.padding) + ", 0)"));

		// Draw rectanges
		var yValue, yPrevious;
		for (var index = 0; index < profiles.length; index++) {
			stats.values[index].forEach(function(element, i) {
				yValue = layout.height * element.value / stats.maxSum;
				yPrevious = layout.height * element.previous / stats.maxSum;
				groupS[index].append("rect")
					.attr("width", layout.stacks.width)
					.attr("x", 0)
					.attr("y", layout.height - yPrevious - yValue)
					.attr("height", yValue)
					.style("fill", deck[i].color)
			}, this);
		}
	};


	return {
		link: chartDataStackedbars_link,
		restrict: 'E'
	}
});