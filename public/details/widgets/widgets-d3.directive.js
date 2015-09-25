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
						.attr('class', 'svg svg-d3');

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
	directive_unselect(r);
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

		// Enhance meta
		r.meta.hLabel = function(h, pi) {
			return h;// (pi + 1) + '-' + h;
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
					scale = d3.scale.ordinal();
					list = [];
					r.profiles.forEach(function(profile, index) { profile.currentData.threads.info.forEach(function(thread) {
						list.push(r.meta.hLabel(thread.h, index));
					})});
					scale.domain(list);
					break;
				case 'pn':
					scale = d3.scale.ordinal();
					list = ['', ''];
					r.profiles.forEach(function(profile) {
						list.splice(-1, 0, profile.label);
					});
					scale.domain(list);
					break;
				default:
					scale = d3.scale.linear().domain([0, 100]);
					break;
			}
			
			scale.range([LAYOUT_PARALLEL_COORDINATES, 0]);
			r.scalesV.push(scale);
		});
		
		// Groups
		var gPlots = r.groupO.append('g');
		var gLines = r.groupO.append('g');
		
		// Lines
		var line = d3.svg.line();
		/*var lineFunction = d3.svg.line()
				.x(function(d, i, j) { console.log('x', d, i, j, r.scaleX(i)); return r.scaleX(i); })
				.y(function(d, i, j) { console.log('y', d, i, j, r.scalesV[i](d[r.deck.plots[p].attr])); return r.scalesV[i](d[r.deck.plots[p].attr]); });
//				.interpolate(interpolationMethod);*/
		var linePoints = function(thread) {
			return r.deck.plots.map(function(facet, index) {
				return [r.scaleX(index), r.scalesV[index](thread[facet.attr])];
			})
		}
		
		// Redraw
		function repaint() {
			// Repaint container
			d3_directive_repaint_container(r);
			
			// Plots
			r.scaleX.rangePoints([0, r.layout.width], 1);
			
			// clean
			gPlots.selectAll('*').remove();
			gLines.selectAll('*').remove();
			
			// Draw plots
			r.deck.plots.forEach(function(facet, i) {
				gPlots.append('g')
					.attr('transform', 'translate(' + r.scaleX(i) + ')')
					.attr('class', 'axis')
					.call(axis.scale(r.scalesV[i]))
					.append('text')
						.attr('class', 'label')
						.attr('transform', 'translate(2, 5) rotate(90)')
						.attr("y", -4)
						.style('text-anchor', 'top')
						.text(facet.label);
						
						
			});
			
			// Brush
		
			// Draw lines
			r.profiles.forEach(function(profile, ip) {
				profile.currentData.threads.info.forEach(function(thread, it) {
					//if (it < 1) {
					console.log(thread.h, line(linePoints(thread)));
					//console.log(thread.h, line(r.meta.plots.map(function(p) { return [r.scaleX(p), r.scalesV[p](thread[r.deck.plots[p].attr])]; })));
					//console.log(thread.h, lineFunction(r.meta.plots.map(function(p) { return [r.scaleX(p), r.scalesV[p](thread[r.deck.plots[p].attr])]; })));
					gLines.append('path')
						.attr('class', 'svg-data svg-data-line')
						.attr('d', line(linePoints(thread)) + 'Z');
						
					/*linePoints(thread).forEach(function(point, ip) {
						gLines.append("circle")
							.attr("cx", point[0])
							.attr("cy", point[1])
							.attr("r", 20)
							.style("fill", "purple");
						gLines.append('text')
							.attr('class', 'label')
							.attr("x", point[0])
							.attr("y", point[1])
							.text(ip);
					})*/
					//}
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