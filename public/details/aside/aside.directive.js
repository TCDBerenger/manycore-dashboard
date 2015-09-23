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
/*	Utilities											  */
/*														  */
/**********************************************************/

/**
 * Constants
 */
var ASIDE_CURRENT_ID = 1;

/**
 * Array of points to string
 */
function aside_getNewID() {
	return ++ASIDE_CURRENT_ID;
}




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

		// Paint
		function repaint() {
			var yValue, yPrevious, maxValue;
			for (var index = 0; index < profiles.length; index++) {
				// Clean
				groupS[index].selectAll('*').remove();
				
				// Top
				maxValue = (stats.mode == 'units') ? stats.maxSum : stats.sums[index]; 
				
				// Draw rectanges
				stats.values[index].forEach(function(element, i) {
					yValue = layout.height * element.value / maxValue;
					yPrevious = layout.height * element.previous / maxValue;
					if (yValue >= 1) groupS[index].append("rect")
						.attr("width", layout.stacks.width)
						.attr("x", 0)
						.attr("y", layout.height - yPrevious - yValue)
						.attr("height", yValue)
						.style("fill", deck[i].color)
				}, this);
			}
		}
		
		// Bind
		// (call the first repaint instance)
		scope.$watch(function() { return stats.mode; }, repaint);
	};


	return {
		link: chartDataStackedbars_link,
		restrict: 'E'
	}
});


/**
 * Facet list
 */
app.directive('facetList', [function() {
	return {
		templateUrl : '/details/aside/facetList.template.html',
		bindToController: true,
		scope: {
			prelist: '=',
			list: '=',
			options: '='
		},
		controllerAs : 'dv',
		controller : function() {
			console.log("== directive == facetList ==");
			var listID = aside_getNewID();
			var sources = [];
			var provider = [];
			var styles = '';
			
			var allowPrelist = ! (this.options && this.options.disablePrelist);
			
			if (allowPrelist && this.prelist) sources.push(this.prelist);
			if (this.list) sources.push(this.list);
			
			var itemID;
			sources.forEach(function(source, i1) {
				source.forEach(function(item, i2) {
					itemID = 'l' + listID + 's' + i1 + 'i' + i2;
					provider.push({
						i: itemID,
						t: ('t' in item) ? item.t : ('f' in item) ? item.f.title : '',
						d: ('d' in item) ? item.d : ('f' in item) ? item.f.desc : ''
					});
					styles += '#' + itemID + ':before {' +
							'content: "' + (('b' in item) ? item.b : '▮') + '";' +
							'color: ' + (('c' in item) ? item.c : ('f' in item) ? item.f.color : '#000') + ';' +
						'}';
				});
			});
			
			// Scope named 'dv'
			this.provider = provider;
			this.styles = styles;
		},
		link: function link(scope, element, attrs) {
			// Add main class
			d3.select(element[0]).attr("class", "aside");
		},
		restrict: 'E'
	}
}]);
