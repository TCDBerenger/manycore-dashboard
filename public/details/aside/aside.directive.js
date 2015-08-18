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
	this.stacks =		{ width: 10, padding: 1 };
	this.percents =		{ width: 3, padding: 4 };
	this.lineHeight =	40;

	// Compute
	this.refresh = function(deck, profiles) {
		self.width =	(profiles.length == 1) ? self.stacks.width : 2 * (self.stacks.width + self.stacks.padding + self.percents.width) + self.percents.padding;
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
		var groupP = [];
		groupS.push(svg.append("g")
			.attr('class', "svg-stack svg-profile-1"));
		if (profiles.length == 2) {
			groupP.push(svg.append("g")
				.attr('class', "svg-percent svg-profile-1")
				.attr("transform", "translate(" + (layout.stacks.width + layout.stacks.padding) + ", 0)"));
			groupS.push(svg.append("g")
				.attr('class', "svg-stack svg-profile-2")
				.attr("transform", "translate(" + (layout.stacks.width + 2 * layout.stacks.padding + 2 * layout.percents.width + layout.percents.padding) + ", 0)"));
			groupP.push(svg.append("g")
				.attr('class', "svg-percent svg-profile-2")
				.attr("transform", "translate(" + (layout.stacks.width + layout.stacks.padding + layout.percents.width + layout.percents.padding) + ", 0)"));
		}

		// Draw rectanges
		var yValue, yPrevious;
		for (var index = 0; index < profiles.length; index++) {
			stats.values[index].forEach(function(element, i) {
				// Stack
				yValue = layout.height * element.value / stats.maxSum;
				yPrevious = layout.height * element.previous / stats.maxSum;
				groupS[index].append("rect")
					.attr("width", layout.stacks.width)
					.attr("x", 0)
					.attr("y", layout.height - yPrevious - yValue)
					.attr("height", yValue)
					.style("fill", deck[i].color)
				
				// Percent
				if (profiles.length == 2) {
					yValue = layout.height * element.value / stats.sums[index];
					yPrevious = layout.height * element.previous / stats.sums[index];
					groupP[index].append("rect")
						.attr("width", layout.percents.width)
						.attr("x", 0)
						.attr("y", layout.height - yPrevious - yValue)
						.attr("height", yValue)
						.style("fill", deck[i].color);
				}
			}, this);
		}
	};


	return {
		link: chartDataStackedbars_link,
		restrict: 'E'
	}
});