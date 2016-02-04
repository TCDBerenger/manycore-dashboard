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
		var deck = scope.stats.deck;
		
		// Compute layout
		layout.refresh(deck, profiles);

		// DOM
		d3.select(container)
			.style('background', 'transparent')
			.attr('height', layout.height);
		var svg = d3.select(container).append('svg')
			.attr({width: layout.width, height: layout.height})
			.attr('class', "svg-stats");
			
		// Draw template
		var group;
		var shapes = [[], []];
		for (var index = 0; index < profiles.length; index++) {
			// Add group
			if (index == 0)
				group = svg.append("g")
					.attr('class', "svg-stack svg-profile-1");
			else
				group = svg.append("g")
					.attr('class', "svg-stack svg-profile-2")
					.attr("transform", "translate(" + (layout.stacks.width + layout.stacks.padding) + ", 0)");
			
			// Draw
			for (var f = 0; f < deck.length; f++) {
				shapes[index].push(group.append("rect")
					.attr("width", layout.stacks.width)
					.attr("x", 0)
					.style("fill", deck[f].color));
			}
		}

		// Paint
		function repaint() {
			var maxValue, yFrom, yTo;
			for (var index = 0; index < profiles.length; index++) {
				// Data
				maxValue =  (stats.mode == 'units') ? Math.max.apply(null, stats.valuesMax) : stats.valuesMax[index];
				
				// Refresh shape parameters
				for (var f = 0; f < deck.length; f++) {
					yFrom = layout.height * stats.valuesStack[index][f] / maxValue || 0;
					yTo = layout.height * stats.valuesStack[index][f + 1] / maxValue || 0;
					shapes[index][f]
						.attr("y", yFrom)
						.attr("height", yTo - yFrom)
				}
			}
		}
		
		// Bind
		// (call the first repaint instance)
		scope.$watch(function() { return stats.version + .1 * ((stats.mode == 'units') ? 1 : 2); }, repaint);
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
			options: '=',
			settings: '=',
			profiles: '='
		},
		controllerAs : 'dv',
		controller : function() {
			console.log("== directive == facetList ==");
			var listID = aside_getNewID();
			var sources = [];
			var provider = [];
			var styles = '';
			var settings = this.settings;
			var profiles = this.profiles;
			var getSettings = function(item) {
				var result = [];
				settings[item.sv].forEach(function(value, index) {
					result.push(profiles[index].label + ': ' + (Math.round(value * 1000) / 1000) + ' ' + item.sd);
				});
				return result;
			}
			
			var allowPrelist = ! (this.options && this.options.disablePrelist);
			
			if (allowPrelist && this.prelist) sources.push(this.prelist);
			if (this.list) sources.push(this.list);
			
			var itemID;
			sources.forEach(function(source, i1) {
				source.forEach(function(item, i2) {
					itemID = 'l' + listID + 's' + i1 + 'i' + i2;
					provider.push({
						i: itemID,
						t: ('t' in item) ? item.t : ('f' in item) ? item.f.label : '',
						d: item.d,
						s: ('sv' in item) ? getSettings(item) : null
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
