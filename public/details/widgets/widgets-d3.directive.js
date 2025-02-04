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
var LAYOUT_CACHES_CORE_HEIGHT = 50;
var LAYOUT_CACHES_STRIP_HEIGHT = 40;
var LAYOUT_CACHES_LINK_HEIGHT = 20;
var LAYOUT_CACHES_COLUMN_WIDTH = 100;

/**
 * Layout for external graphs
 */
var d3_layout = function(initialVars) {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	// Constants
	this.padding = {	top: initialVars.paddingTop | 30,
						right: initialVars.paddingRight | 0,
						bottom: initialVars.paddingBottom | 20,
						left: initialVars.paddingLeft | 0,
						inner: initialVars.paddingInner | 0 };
	this.vars = initialVars;

	// Compute
	this.refresh = function(container, items, callback) {
		self.width =	container.clientWidth;
		self.height	=	self.padding.top + items * self.vars.favoriteHeight + (items - 1) * self.padding.inner + self.padding.bottom;

		if (callback !== undefined) callback();
	};
};

/**
 * Meta for external graphs
 */
var d3_meta = function(scope, attributes, params, properties) {
	// Allow seld reference (otherwise this is the caller object)
	var self = this;

	// Save params
	this.scope =		scope;

	// Common
	this.begin =		NaN;		// When the user selection starts
	this.end =			NaN;		// When the user selection ends (could be before or after timeMax)
	this.duration =		NaN;		// Duration of the user selection

	// Common
	this.ends =			[NaN, NaN];	// When profiles ends (could be before or after timeMax)
	this.durations =	[NaN, NaN];	// Duration of profiles
	this.steps =		[NaN, NaN];	// Time step of profiles

	// On demand - params
	if (params)
		params.forEach(function(p) {
			try { self[p.property] = JSON.parse(p.value) } catch(e) { self[p.property] = p.value };
		});
	
	// On demand - settings
	properties.forEach(function(a) {
		if (attributes.hasOwnProperty(a))
			try { self[a] = JSON.parse(attributes[a]) } catch(e) { self[a] = attributes[a] };
	});


	this.refresh		= function(r) {
		self.begin =	self.scope.selection.begin;
		self.end =		self.scope.selection.end;
		self.duration =	self.end - self.begin;

		self.ends[0] =		Math.min(self.scope.selection.end, r.profiles[0].currentData.info.duration);
		self.durations[0] =	Math.max(0, self.ends[0] - self.begin);
		self.steps[0] =	r.profiles[0].currentData.info.timeStep;

		if (r.profiles[1] != null) {
			self.ends[1] =		Math.min(self.scope.selection.end, r.profiles[1].currentData.info.duration);
			self.durations[1] =	Math.max(0, self.ends[1] - self.begin);
			self.steps[1] =	r.profiles[1].currentData.info.timeStep;
		}
	}
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
	var meta =		new d3_meta(scope, attrs, scope.widget.deck.params, properties);

	// Data
	var profiles =	scope.profiles;

	// Canvas
	var svg =		d3.select(container).append('svg').attr('class', 'svg-d3');

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
		groupO:		overflow,
		groupP:		[null, null],
		iData:		null,
		iSelection:	[null, null]
	};
}

/**
 * Repaint - container
 */
function d3_directive_repaint_container(r, layoutItems) {
	// Parameters - Data
	r.meta.refresh(r);

	// Sizes
	r.layout.refresh(r.container, layoutItems);

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
		var colorScale_locality = d3.scale.linear().range([r.deck.c_scale[0], r.deck.c_scale[1], r.deck.c_scale[0]]);
		
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
			d3_directive_repaint_container(r, 1);
			
			// Plots
			r.scaleX.rangePoints([0, r.layout.width], 1);
			
			// Color
			colorScale_locality.domain([0, r.meta.colorThreshold, 100]);
			
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



/**
 * CPU / Cores / Caches
 */
app.directive('chartCaches', function() {

	function chart_link(scope, element, attrs, controller) {
		console.log('== directive == chartCaches ==');
		
		// Layout vars
		var layoutVars = {	paddingTop: 20, paddingBottom: 20, paddingInner: 20,
							head: {		height: 	20,
										tickHeight:	12,
										text:		12/* ,		textShift:	8*/ },
							core: {		height:		LAYOUT_CACHES_CORE_HEIGHT,
										paddingOutter:	6,		paddingInner:	10,
										paddingHeader:	20,		paddingSubOut:	6,		paddingSubIn:	10,
										text:		12 },
							strip: {	height:		LAYOUT_CACHES_STRIP_HEIGHT },
							column: {	width:		LAYOUT_CACHES_COLUMN_WIDTH,
										textShift:	8 },
							linkHeight: LAYOUT_CACHES_LINK_HEIGHT };

		// Init vars
		var r = d3_directive_init(scope, element, attrs, layoutVars);
		r.meta.ProfileCount = r.profiles.length;
		r.meta.levelCount = r.deck.levels.length;
		
		// Enhance meta
		r.meta.pcores = [r.profiles[0].hardware.data.pcores, (r.profiles.length > 1) ? r.profiles[0].hardware.data.pcores : NaN];
		r.meta.lcores = [r.profiles[0].hardware.data.lcores / r.profiles[0].hardware.data.pcores, (r.profiles.length > 1) ? r.profiles[0].hardware.data.lcores / r.profiles[0].hardware.data.pcores : NaN];
		r.meta.counts = [];
		for (var l = 0 ; l < r.meta.levelCount; l++) {
			r.meta.counts.push([]);
			r.profiles.forEach(function(profile) {
				r.meta.counts[l].push(r.deck.levels[l].count(profile));
			}, this);
		}
		
		// Enhance layout
		r.layout.profile = {
			height:	r.layout.vars.head.height + r.layout.vars.core.height + r.meta.levelCount * (r.layout.vars.strip.height + r.layout.vars.linkHeight),
			width:	NaN,
		}
		r.layout.core = {
			height: r.layout.vars.core.height,		subHeight:	r.layout.vars.core.height - r.layout.vars.core.paddingHeader - r.layout.vars.core.paddingSubOut,
			width:	NaN,							subWidth:	NaN,
		}
		r.layout.strips = [
			{ height: r.layout.vars.strip.height,	width:	NaN },
			{ height: r.layout.vars.strip.height,	width:	NaN }
		]
		
		// Init layout height
		r.layout.vars.favoriteHeight = r.layout.profile.height;
		
		// SVG groups
		r.groupP[0] = r.groupO.append('g')
						.attr('class', 'svg-profile svg-profile-1')
						.attr("height", r.layout.profile.height)
						.attr('transform', 'translate(' + r.layout.vars.column.width + ',0)');
		r.groupP[1] = r.groupO.append('g')
						.attr('class', 'svg-profile svg-profile-2')
						.attr("height", r.layout.profile.height)
						.attr('transform', 'translate(' + r.layout.vars.column.width + ',' + (r.layout.vars.favoriteHeight + r.layout.padding.inner) + ')');
		
		// Plots position scales
		// domain is depending of the size of the box (depending how many)
		// range is usually fixed by the incremental y is added to directly find the absolute position depending of the level
		r.scalesX = [];
		for (var l = r.meta.levelCount; l--; ) {
			r.scalesX.push(d3.scale.linear());
		}
		
		// Plot value scale
		// domain is fixed from 0% to 100%
		// range is usually fixed by the incremental y is added to directly find the absolute position depending of the level
		r.scaleV = d3.scale.linear().domain([0, 100]);
		
		
		// Build internal data
		r.iData = {};
		for (var l = r.meta.levelCount - 1; l--; ) {
			r.iData[l] = [[], []];
		}
		
		//
		// Draw
		//
		var yInc;
		var xInc = r.layout.vars.column.width - r.layout.vars.column.textShift;
		var storeys = [
			{ l: 'CPU',					y: r.layout.vars.head.tickHeight / 2,	yInc: 0 },
			{ l: 'cores',				y: r.layout.core.height / 2,			yInc: r.layout.vars.head.height },
			{ l: r.deck.levels[0].l,	y: r.layout.strips[0].height / 2,		yInc: r.layout.core.height + r.layout.vars.linkHeight },
			{ l: r.deck.levels[1].l,	y: r.layout.strips[1].height / 2,		yInc: r.layout.strips[0].height + r.layout.vars.linkHeight },
		]
		r.profiles.forEach(function(profile, iP) {
			// Profile title
			if (r.profiles.length > 1) r.groupO.append('text')
				.attr('class', "svg-text svg-profile-label")
				.attr('text-anchor', 'middle')
				.attr('font-size', '12px')
				.attr('font-weight', 'bold')
				.attr('fill', '#000000')
				.attr('transform', (iP == 0) ? ('translate(12,' + (r.layout.profile.height / 2) + ")rotate(270)") : ('translate(12,' + (1.5 * r.layout.profile.height + r.layout.padding.inner) + ")rotate(270)"))
				.text(profile.label);
			
			// Labels
			yinc = 0
			storeys.forEach(function(element) {
				yinc += element.yInc;
				r.groupO.append('text')
					.attr('class', 'svg-text')
					.attr('y', yinc + element.y)
					.attr('x', r.layout.vars.column.width - r.layout.vars.column.textShift)
					.attr('text-anchor', 'end')
					.attr('font-size', '12px')
					.attr('alignment-baseline', 'central')
					.attr('dominant-baseline', 'central')
					.text(element.l);
			}, this);
		}, this);
		
		//
		// Redraw
		//
		function repaint() {
			// Repaint container
			d3_directive_repaint_container(r, r.profiles.length);
			
			// Layout - Profile
			r.layout.profile.width = r.layout.width - r.layout.padding.left - r.layout.padding.right - r.layout.vars.column.width;
			
			// By profile
			var beginID, endID, endMaxID;
			var yInc, xInc, xSub;
			var facet, points, value;
			r.profiles.forEach(function(profile, iP) {
				// Time
				beginID = r.meta.begin / r.meta.steps[iP];
				endID = r.meta.durations[iP] / r.meta.steps[iP];
				endMaxID = r.meta.duration / r.meta.steps[iP];
			
				// Layout - Cores
				r.layout.core.width = (r.layout.profile.width - 2 * r.layout.vars.core.paddingOutter - (r.meta.pcores[iP] - 1) * r.layout.vars.core.paddingInner) / r.meta.pcores[iP];
				r.layout.core.subWidth = (r.layout.core.width - 2 * r.layout.vars.core.paddingSubOut - (r.meta.lcores[iP] - 1) * r.layout.vars.core.paddingSubIn) / r.meta.lcores[iP];
				r.layout.strips[0].width = (r.layout.profile.width - 2 * r.layout.vars.core.paddingOutter - (r.meta.counts[0][iP] - 1) * r.layout.vars.core.paddingInner) / r.meta.counts[0][iP];
				r.layout.strips[1].width = (r.layout.profile.width - 2 * r.layout.vars.core.paddingOutter - (r.meta.counts[1][iP] - 1) * r.layout.vars.core.paddingInner) / r.meta.counts[1][iP];
			
				// Clean all
				r.groupP[iP]
					.attr("width", r.layout.profile.width)
					.selectAll('*').remove();
				
				// CPU
				r.groupP[iP].append('path')
					.attr('class', 'svg-line')
					.attr('fill', '#FFFFFF')
					.attr('stroke', '#222222')
					.attr('stroke-width', 2)
					.attr('d', 'M1,' + r.layout.vars.head.tickHeight + ' v-' + r.layout.vars.head.tickHeight + ' h' + (r.layout.profile.width - 2) + ' v' + r.layout.vars.head.tickHeight);
				/*
				r.groupP[iP].append('text')
					.attr('class', 'svg-text')
					.attr('y', r.layout.vars.head.textShift)
					.attr('x', r.layout.profile.width / 2)
					.attr('text-anchor', 'middle')
					.attr('alignment-baseline', 'central')
					.attr('dominant-baseline', 'central')
					.attr('font-size', r.layout.vars.head.text + 'px')
					.text('CPU 0');
				*/
				
				// Cores
				yInc = storeys[1].yInc;
				for (var iPC = 0; iPC < r.meta.pcores[iP]; iPC++) {
					xInc = r.layout.vars.core.paddingOutter + iPC * (r.layout.vars.core.paddingInner + r.layout.core.width);
					
					// Physical core
					r.groupP[iP].append('rect')
						.attr('x', xInc)
						.attr('y', yInc)
						.attr('width', r.layout.core.width)
						.attr('height', r.layout.core.height)
						.attr('fill', '#F9F9F9')
						.attr('stroke', '#222222');
						
					// Physical core label
					r.groupP[iP].append('text')
						.attr('class', 'svg-text')
						.attr('x', xInc + r.layout.core.width / 2)
						.attr('y', yInc + r.layout.vars.core.paddingHeader / 2)
						.attr('text-anchor', 'middle')
						.attr('alignment-baseline', 'central')
						.attr('dominant-baseline', 'central')
						.attr('font-size', r.layout.vars.head.text + 'px')
						.text('physical core ' + iPC);
					
					for (var iLC = 0; iLC < r.meta.lcores[iP]; iLC++) {
						xSub = xInc + r.layout.vars.core.paddingSubOut + iLC * (r.layout.vars.core.paddingSubIn + r.layout.core.subWidth);
						
						// Logical core
						r.groupP[iP].append('rect')
							.attr('x', xSub)
							.attr('y', yInc + r.layout.vars.core.paddingHeader)
							.attr('width', r.layout.core.subWidth)
							.attr('height', r.layout.core.subHeight)
							.attr('fill', '#FFFFFF')
							.attr('stroke', '#222222');
						
						// Logical core label
						r.groupP[iP].append('text')
							.attr('class', 'svg-text')
							.attr('x', xSub + r.layout.core.subWidth / 2)
							.attr('y', yInc + r.layout.vars.core.paddingHeader + r.layout.core.subHeight / 2)
							.attr('text-anchor', 'middle')
							.attr('alignment-baseline', 'central')
							.attr('dominant-baseline', 'central')
							.attr('font-size', r.layout.vars.head.text + 'px')
							.text('logical core ' + (iPC * r.meta.lcores[iP] + iLC));
					}
					
					// Links
					xInc += r.layout.core.width / 2;
					r.groupP[iP].append('line')
							.attr('class', "svg-line")
							.attr('x1', xInc).attr('x2', xInc)
							.attr('y1', yInc + r.layout.core.height).attr('y2', yInc + r.layout.core.height + r.layout.vars.linkHeight)
							.attr('stroke', '#222222')
							.attr('stroke-width', 2)
							.attr('fill', 'none');

				}
				
				// By level
				for (var l = 0 ; l < r.meta.levelCount; l++) {
					// Positions
					yInc += storeys[2 + l].yInc;
					
					// Scale
					r.scalesX[l].domain([beginID, endMaxID]);
					
					// Facet
					facet = r.deck.levels[l].f;
					
					// Scale
					r.scaleV.range([yInc + LAYOUT_CACHES_STRIP_HEIGHT, yInc]);
					
					// All elements
					for (var iL = 0; iL < r.meta.counts[l][iP] ; iL++) {
						xInc = r.layout.vars.core.paddingOutter + iL * (r.layout.vars.core.paddingInner + r.layout.strips[l].width);
						
						// Scale
						r.scalesX[l].range([xInc, xInc + r.layout.strips[l].width]);
						
						// Cache data
						points = [r.scalesX[l](beginID), r.scaleV(0)];
						for (var tID = beginID; tID < endID; tID++) {
							value = profile.raw.amountPercent[tID][facet.attr + '_c' + iL];
							points.push.apply(points, [r.scalesX[l](tID), r.scaleV(value), r.scalesX[l](tID + 1), r.scaleV(value)]);
						}
						points.push.apply(points, [r.scalesX[l](endID), r.scaleV(0)]);
						
						// Cache graph
						r.groupP[iP].append("polygon")
							.attr('class', "svg-limit")
							.attr("points", p2s(points))
							.attr('fill', facet.colours.n);
						
						// Cache border
						r.groupP[iP].append('rect')
							.attr('x', xInc)
							.attr('y', yInc)
							.attr('width', r.layout.strips[l].width)
							.attr('height', r.layout.strips[l].height)
							.attr('fill', 'none')
							.attr('stroke', '#222222');
					
						// Links
						if (l < r.meta.levelCount - 1) {
							xInc += r.layout.strips[l].width / 2;
							r.groupP[iP].append('line')
									.attr('class', "svg-line")
									.attr('x1', xInc).attr('x2', xInc)
									.attr('y1', yInc + r.layout.strips[l].height).attr('y2', yInc + r.layout.strips[l].height + r.layout.vars.linkHeight)
									.attr('stroke', '#222222')
									.attr('stroke-width', 2)
									.attr('fill', 'none');
						}
					}
				}
			}, this);
		}

		// Bind
		d3_directive_bind(scope, r, repaint);
	}

	return {
		link: chart_link,
		restrict: 'E'
	}
});