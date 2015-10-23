/**********************************************************/
/*														  */
/*	Common smart objects								  */
/*														  */
/**********************************************************/

/**
 * Constants
 */
var LAYOUT_PARALLEL_COORDINATES_MIN = 300;
var LAYOUT_PARALLEL_COORDINATES_STEP = 10;

/**
 * Layout for external graphs
 */
var d3_layout = function(initialVars) {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	// Constants
	this.padding	= { top: 30, right: 0, bottom: 20, left: 0, inner: 0 };
	this.vars		= initialVars;

	// Compute
	this.refresh = function(container, items, callback) {
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
function d3_directive_init(scope, element, attrs, layoutVars) {
	// Layout
	var container =	element[0];
	var layout =	new d3_layout(layoutVars);
	
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


/**
 * Bind
 */
function d3_directive_bind(scope, r, repaint) {
	// Size
	scope.$watch(function() { return r.container.clientWidth; }, repaint);
	
	// Properties
	scope.$watch(function() { return r.settings.version; }, function() {
		var needToRepaint = false;

		r.properties.forEach(function(property) {
			if (r.meta[property] != r.settings[property]) {
				r.meta[property] = r.settings[property];
				needToRepaint = true;
			}
		});

		if (needToRepaint)
			repaint();
	});
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
		var r = d3_directive_init(scope, element, attrs, { minHeight: LAYOUT_PARALLEL_COORDINATES_MIN, stepHeight: LAYOUT_PARALLEL_COORDINATES_STEP });
		
		// Init favorite height
		var threadCount = r.profiles[0].currentData.threads.info.length + ((r.profiles.length > 1) ? r.profiles[1].currentData.threads.info.length : 0);
		r.layout.vars.favoriteHeight = Math.max(r.layout.vars.minHeight, threadCount * r.layout.vars.stepHeight);
		console.log(threadCount, r.profiles[0].currentData.threads.info.length, r.profiles.length > 1, r.profiles[1].currentData.threads.info.length);
		console.log('#', threadCount, "p", r.layout.vars.favoriteHeight, r.layout.vars.minHeight, threadCount * r.layout.vars.stepHeight);
		
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
		r.meta.removeBrushes = [];
		
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
						.rangePoints([0, r.layout.vars.favoriteHeight]);
					list = [];
					r.profiles.forEach(function(profile, ip) { profile.currentData.threads.info.forEach(function(thread) {
						list.push(r.meta.hLabel(thread.h, ip));
					})});
					scale.domain(list);
					break;
				case 'pn':
					scale = d3.scale.ordinal()
						.rangePoints([0, r.layout.vars.favoriteHeight]);
					list = ['', ' '];
					r.profiles.forEach(function(profile) {
						list.splice(-1, 0, profile.label);
					});
					scale.domain(list);
					break;
				default:
					scale = d3.scale.linear()
						.domain([0, 100])
						.range([r.layout.vars.favoriteHeight, 0]);
					break;
			}
			r.scalesV.push(scale);
		});
		
		// Color scales
		var colorScale_thread = d3.scale.category20();
		var colorScale_locality = d3.scale.linear().range(['#8DD28A', '#D2AB8A', '#000000']);
		
		// Build internal data
		r.iData = [];
		r.profiles.forEach(function(profile, ip) {
			profile.currentData.threads.info.forEach(function(thread, it) {
				var d = {
					//id: 'path-' + ip + '-' + it,
					cp: (ip == 0) ? '#1f77b4' : '#ff7f0e',
					ct: colorScale_thread(it % 20)
				};
				
				r.deck.plots.forEach(function(facet, i) {
					// Y
					if (facet.attr == 'h') {
						// label function
						d['y' + i] = r.scalesV[i](r.meta.hLabel(thread[facet.attr], ip));
					} else {
						d['y' + i] = r.scalesV[i](thread[facet.attr]);
					}
			
					// Extent
					if (facet.attr == 'h' || facet.attr == 'pn') {
						// Ordinal scale
						d['e' + i] = d['y' + i];
					} else {
						d['e' + i] = thread[facet.attr];
					}
					
					// Locality "level"
					if (facet.attr == 'tlb' || facet.attr == 'l1' || facet.attr == 'l2' || facet.attr == 'l3' || facet.attr == 'hpf') {
						d.ll = Math.max(d.ll || 0, thread[facet.attr]);
					}
				});
				
				r.iData.push(d);
			});
		});
		
		// Groups
		var gBackLines = r.groupO.append('g').attr('class', 'svg-background');
		var gForeLines = r.groupO.append('g').attr('class', 'svg-foreground');
		
		// Lines
		var line = d3.svg.line();
		var linePoints = function(element, plotXs) {
			return r.deck.plots.map(function(facet, index) {
				return [plotXs[index], element['y' + index]];
			});
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
				.on("brush", brushSelection);
				//.on("brushstart", brushstart)
				//.on("brushend", brushend)
			
			// Save selection brush for later
			r.meta.brushes.push(brush);
					
			// Visually add selection brush
			var brushGroup = r.meta.plotGroups[i].append('g')
				.attr('class', 'brush')
				.call(brush);
			
			// Rectangle feedback
			brushGroup.selectAll("rect")
				.attr("x", -8)
				.attr("width", 16)
			
			// Remove link
			r.meta.removeBrushes.push(
				brushGroup.append('text')
					.attr('class', 'remove-brush')
					.attr('font-family', 'FontAwesome')
					.attr("x", 8)
					.text('\uf057')
					.style('display', 'none')
			);
			
			// TO RESET :
			//	brush
			//		.clear()
			//		.event(d3.select(".brush"));
		});
		
		// Redraw
		function repaint() {
			// Repaint container
			d3_directive_repaint_container(r);
			
			// Plots
			r.scaleX.rangePoints([0, r.layout.width], 1);
			
			// Color
			colorScale_locality.domain([0, r.meta.colorThreshold, 100]);
			console.log([0, r.meta.colorThreshold, 100]);
			
			// clean
			gBackLines.selectAll('*').remove();
			gForeLines.selectAll('*').remove();
			
			// Move plots
			var plotXs = [];
			r.meta.plotGroups.forEach(function(group, i) {
				group.attr('transform', 'translate(' + r.scaleX(i) + ')');
				plotXs.push(r.scaleX(i));
			}, this);
		
			// Draw lines
			var dataPath, color;
			r.iData.forEach(function(element) {
				// Path
				dataPath = line(linePoints(element, plotXs));
				
				// Color
				if (r.meta.colorMode == 0)		// good ↔ poor locality
					color = colorScale_locality(element.ll);
				else if (r.meta.colorMode == 1)	// process
					color = element.cp;
				else if (r.meta.colorMode == 2)	// thread
					color = element.ct;
				else							// what's wrong?
					color = element.cp;
				
				// Draw
				element.b = gBackLines.append('path')
								.attr('class', 'svg-data svg-background svg-data-line')
								.attr('d', dataPath);
				element.f = gForeLines.append('path')
								.attr('class', 'svg-data svg-foreground svg-data-line')
								.attr('stroke', color)
								.attr('d', dataPath);
			});
			
			applySelection();
		}

		// Select
		function brushSelection() {
			// Add or move remove icon
			d3.select(this).select('.remove-brush')
				.style('display', null)
				.attr('y', d3.select(this).select('rect.extent').attr("y"));
			
			applySelection();
		}
		
		// Apply selection
		function applySelection() {
			// Handles a brush event, toggling the display of foreground lines.
			var actives = [];
			var extents = [];
			
			for (var index = 0; index < r.meta.plots.length; index++) {
				if (! r.meta.brushes[index].empty()) {
					actives.push(index);
					extents.push(r.meta.brushes[index].extent());
				} else {
					r.meta.removeBrushes[index].style('display', 'none');
				}
			}
			
			var extentsLenght = extents.length;
			var toInclude, i_extents;
			r.iData.forEach(function(element) {
				toInclude = true;
				i_extents = 0;
				while (toInclude && i_extents < extentsLenght) {
					toInclude = extents[i_extents][0] <= element['e' + actives[i_extents]] && element['e' + actives[i_extents]] <= extents[i_extents][1];
					i_extents++;
				}
				element.b.style('display', toInclude ? 'none' : null);
				element.f.style('display', toInclude ? null : 'none');
			});
		}

		// Bind
		d3_directive_bind(scope, r, repaint);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});