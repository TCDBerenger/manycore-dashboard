/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/

/**
 * Constants
 */
var LAYOUT_PARALLEL_COORDINATES = 300;

/**
 * Layout for external graphs
 */
var externalLayout = function(favoriteHeight) {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	// Constants
	this.padding	= { top: 30, right: 0, bottom: 20, left: 0, inner: 0 };
	this.vars		= { favoriteHeight: favoriteHeight };

	// Compute
	this.refresh = function(container, profiles, callback) {
		self.width =	container.clientWidth;
		self.height	=	self.padding.top + self.vars.favoriteHeight + self.padding.bottom;

		if (callback !== undefined) callback();
	};
};


/**********************************************************/
/*														  */
/*	Common directive mecanisms							  */
/*														  */
/**********************************************************/

/**
 * Init directive
 */
function d3_directive_init(scope, element, attrs, layoutType) {
	// Layout
	var container =	element[0];
	var layout =	new externalLayout(layoutType);
	
	// Properties
	var properties = [];
	if (scope.widget.deck.settings) scope.widget.deck.settings.forEach(function(setting) {
		properties.push(setting.property);
	});

	// Attributes
	var deck =		scope.widget.deck.graph;
	var meta =		new graphMeta(scope, attrs, false, false, scope.widget.deck.params, properties);

	// Data
	var profiles =	scope.profiles;

	// Canvas
	var svg =		d3.select(container).append('svg')
						.attr('class', 'svg-d3');

	// Overflow
	var overflow =	svg.append('g')
						.attr('class', 'svg-overflow')
						.attr('transform', 'translate(' + layout.padding.left + ',' + layout.padding.top + ')');

	return {
		scope:		scope,
		container:	container,
		layout:		layout,
		deck:		deck,
		settings:	scope.widget.settings,
		properties:	properties,
		meta:		meta,
		profiles:	profiles,
		svg:		svg,
		scaleX:		null,
		scalesV:	[null, null],
		groupO:		overflow,
		groupX:		null,
		groupV:		[null, null],
		groupP:		[null, null],
		iData:		null,
		iSelection:	[null, null]
	};
}

/**
 * Repaint - container
 */
function d3_directive_repaint_container(r) {
	// Parameters - Data
	r.meta.refresh(r);
	r.iData = [null, null];

	// Sizes
	r.layout.refresh(r.container, r.profiles);

	// Sizes - container
	d3.select(r.container)
		.style('height', r.layout.height + 'px')
		.style('background', 'transparent');
	r.svg.attr({width: r.layout.width, height: r.layout.height});

	// Clean selection
	// directive_unselect(r);
}



/**********************************************************/
/*														  */
/*	Utilities											  */
/*														  */
/**********************************************************/



/**********************************************************/
/*														  */
/*	Directives											  */
/*														  */
/**********************************************************/


/**
 * Parallel coordinates
 */
app.directive('chartPcoords', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log('== directive == chartPcoords ==');

		// Init vars
		var r = d3_directive_init(scope, element, attrs, LAYOUT_PARALLEL_COORDINATES);
		
		// Looking two threads with the same number
		r.meta.hLabelUnique = false;
		var thread_names = {};
		r.profiles.every(function(profile) {
			r.meta.hLabelUnique = profile.currentData.threads.info.every(function(thread) {
				return (! thread_names[thread.h]) && (thread_names[thread.h] = true);
			});
			return r.meta.hLabelUnique;
		});
		delete thread_names;
		
		// Meta label for thread id (h)
		if (r.meta.hLabelUnique) {
			r.meta.hLabel = function(h, pi) {
				return h;
			} 
		} else {
			r.meta.hLabel = function(h, pi) {
				return h + ' [' + (pi + 1) + ']';
			} 
		}
		
		// Meta plots
		r.meta.plots = [];
		r.deck.plots.forEach(function(facet, i) {
			r.meta.plots.push(i);
		});
		
		// Plot axis
		var axis = d3.svg.axis().orient('left');
		
		// Plots position scale
		r.scaleX = d3.scale.ordinal();
		r.scaleX.domain(r.meta.plots);
		
		// Plot value scales
		r.scalesV = [];
		r.deck.plots.forEach(function(facet, i) {
			var scale, list;
			
			switch (facet.attr) {
				case 'h':
					scale = d3.scale.ordinal()
						.rangePoints([0, LAYOUT_PARALLEL_COORDINATES]);
					list = [];
					r.profiles.forEach(function(profile, ip) { profile.currentData.threads.info.forEach(function(thread) {
						list.push(r.meta.hLabel(thread.h, ip));
					})});
					scale.domain(list);
					break;
				case 'pn':
					scale = d3.scale.ordinal()
						.rangePoints([0, LAYOUT_PARALLEL_COORDINATES]);
					list = ['', ' '];
					r.profiles.forEach(function(profile) {
						list.splice(-1, 0, profile.label);
					});
					scale.domain(list);
					break;
				default:
					scale = d3.scale.linear()
						.domain([0, 100])
						.range([LAYOUT_PARALLEL_COORDINATES, 0]);
					break;
			}
			r.scalesV.push(scale);
		});
		
		// Groups
		var gBackLines = r.groupO.append('g').attr('class', 'svg-background');
		var gForeLines = r.groupO.append('g').attr('class', 'svg-foreground');
		
		// Lines
		var line = d3.svg.line();
		var linePoints = function(thread, ip) {
			return r.deck.plots.map(function(facet, index) {
				if (facet.attr == 'h') {
					return [r.scaleX(index), r.scalesV[index](r.meta.hLabel(thread[facet.attr], ip))];
				} else {
					return [r.scaleX(index), r.scalesV[index](thread[facet.attr])];
				}
			})
		}
		
		// Draw plots
		r.meta.plotGroups = [];
		r.deck.plots.forEach(function(facet, i) {
			r.meta.plotGroups.push(
				r.groupO.append('g').attr('class', 'plot')
			);
			
			// Axis
			r.meta.plotGroups[i].append('g')
				.attr('class', 'axis')
				.call(axis.scale(r.scalesV[i]))
				.append('text')
					.attr('class', 'label')
					.attr('transform', 'translate(2, 5) rotate(90)')
					.attr("y", -4)
					.style('text-anchor', 'top')
					.text(facet.label);
			
			// Event handling
			r.meta.plotGroups[i].call(
				d3.behavior.drag()
					.origin({ x: r.scaleX(i) })
					.on("dragstart", function(d) {
						dragging[d] = x(d);
						background.attr("visibility", "hidden");
					})
					.on("drag", function(d) {
						dragging[d] = Math.min(width, Math.max(0, d3.event.x));
						foreground.attr("d", path);
						r.meta.plots.sort(function(a, b) { return position(a) - position(b); });
						x.domain(r.meta.plots);
						g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
					})
					.on("dragend", function(d) {
						delete dragging[d];
						transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
						transition(foreground).attr("d", path);
						background
							.attr("d", path)
							.transition()
								.delay(500)
								.duration(0)
								.attr("visibility", null);
					})
			);
			
			// Create brush
			// cf. http://bl.ocks.org/jasondavies/1341281
			r.scalesV[i].brush = d3.svg.brush()
				.y(r.scalesV[i])
				.on("brushstart", function() {
					d3.event.sourceEvent.stopPropagation();
				})
				.on("brush", function() {
					// Handles a brush event, toggling the display of foreground lines.
					/*var actives = [];
					var extents = [];
					
					r.meta.plots.forEach(function(element) {
						if (! element.brush.empty()) {
							actives.push(element);
							extents.push(element.extent());
						}
					}, this);
					
					gForeLines.style("display", function(d) {
						return actives.every(function(p, i) {
							return extents[i][0] <= d[p] && d[p] <= extents[i][1];
						}) ? null : "none";
					});*/
				});
			
			// Selection rectangle feedback
			r.meta.plotGroups[i].append('g')
				.attr('class', 'brush')
				.call(r.scalesV.brush)
				.selectAll("rect")
					.attr("x", -8)
					.attr("width", 16);
		});
		
		
		// Redraw
		function repaint() {
			// Repaint container
			d3_directive_repaint_container(r);
			
			// Plots
			r.scaleX.rangePoints([0, r.layout.width], 1);
			
			// clean
			gBackLines.selectAll('*').remove();
			gForeLines.selectAll('*').remove();
			
			// Move plots
			r.meta.plotGroups.forEach(function(group, i) {
				group.attr('transform', 'translate(' + r.scaleX(i) + ')')
			}, this);
		
			// Draw lines
			r.profiles.forEach(function(profile, ip) {
				profile.currentData.threads.info.forEach(function(thread, it) {
					gBackLines.append('path')
						.attr('class', 'svg-data svg-data-line')
						.attr('d', line(linePoints(thread, ip)));
					gForeLines.append('path')
						.attr('class', 'svg-data svg-data-line')
						.attr('stroke', '#8DD28A')
						.attr('d', line(linePoints(thread, ip)));
				});
			});
		}

		// Select
		function select(x) {
		}

		// Bind
		directive_bind(scope, element, r, repaint, select);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});