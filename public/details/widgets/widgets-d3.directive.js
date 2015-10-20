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
		
		// Meta brushes
		r.meta.brushes = [];
		
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
		
		// Build internal data
		r.iData = [];
		r.profiles.forEach(function(profile, ip) {
			profile.currentData.threads.info.forEach(function(thread, it) {
				var d = { id: '#path-' + ip + '-' + it };
				r.deck.plots.forEach(function(facet, i) {
					d[i] = (facet.attr == 'h') ? r.scalesV[i](r.meta.hLabel(thread[facet.attr], ip)) : r.scalesV[i](thread[facet.attr]);
				});
				r.iData.push(d);
			});
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
			
			// Create selection brush
			var brush = d3.svg.brush()
				.y(r.scalesV[i])
				.on("brush", select);
				//.on("brushstart", brushstart)
				//.on("brushend", brushend)
			
			// Save selection brush for later
			r.meta.brushes.push(brush);
					
			// Visually add selection brush
			r.meta.plotGroups[i].append('g')
				.attr('class', 'brush')
				.call(brush)
				// Rectangle feedback
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
			var i = 0;
			r.profiles.forEach(function(profile, ip) {
				profile.currentData.threads.info.forEach(function(thread, it) {
					r.iData[i].b = gBackLines.append('path')
						.attr('class', 'svg-data svg-data-line')
						.attr('d', line(linePoints(thread, ip)));
					r.iData[i].f = gForeLines.append('path')
						.attr('id', 'path-' + ip + '-' + it)
						.attr('class', 'svg-data svg-data-line')
						.attr('stroke', '#8DD28A')
						.attr('d', line(linePoints(thread, ip)));
					
					i++;
				});
			});
		}

		// Select
		function select() {
			// Handles a brush event, toggling the display of foreground lines.
			var actives = [];
			var extents = [];
			
			for (var index = 0; index < r.meta.plots.length; index++) {
				if (! r.meta.brushes[index].empty()) {
					actives.push(index);
					extents.push(r.meta.brushes[index].extent());
				}
			}
			
			r.iData.forEach(function(element) {
				element.f.style('display',
					extents.every(function(p, i) {
						return p[0] <= element[actives[i]] && element[actives[i]] <= p[1];
					}) ? null : 'none');
			});
		}

		// Bind
		directive_bind(scope, element, r, repaint, select);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});