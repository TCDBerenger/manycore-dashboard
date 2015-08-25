/* global app */

app.factory('colours', [function() {
	var list = {
		black:		'#000000',		white:		'#FFFFFF',
		dGrey:		'#797979',		eGrey:		'#ABABAB',		lGrey:		'#DEDEDE',
		dBlue:		'#4682B4',		eBlue:		'#9ED3FF',		lBlue:		'#D0E0ED',
		dGreen:		'#4BB446',		eGreen:		'#8DD28A',		lGreen:		'#D2EDD0',
		dRed:		'#B4464B',		eRed:		'#D28A8D',		lRed:		'#EDD0D2',
		dOrange:	'#B47846',		eOrange:	'#D2AB8A',		lOrange:	'#EDDDD0',
		dMagenta:	'#AF46B4',		eMagenta:	'#CE8AD2',		lMagenta:	'#ECD0ED',
		dViolet:	'#7846B4',		eViolet:	'#AB8AD2',		lViolet:	'#DDD0ED',
		dYellow:	'#b4a646',		eYellow:	'#D2C88A',		lYellow:	'#EDE9D0',
		dTurquoise:	'#5EB8C0',		eTurquoise:	'#9ad3d8',		lTurquoise:	'#d7edef',
		dFuschia:	'#812559',		eFuschia:	'#cf589b',		lFuschia:	'#ecbcd7',
	};

	return {
		unkn:	list.black,		// unkown color
		base:	list.dGrey,		// generic color
		plus:	list.eBlue,		// plus, capacity, more possible
		good:	list.eGreen,	// correctly running
		bad:	list.eRed,		// Not expected
		alt:	list.eViolet,	// alternating
		list:	list
	};
}]);


app.factory('facets', ['colours', function(colours) {
	var desc_r = 'thread is actively executing';
	var desc_y = 'thread is ready to run but is is waiting for a core to become available';
	var desc_b = 'thread is ready to execute and is on standby to be executed';
	var desc_w = 'threads are not ready to be processed because they waiting ressource(s)';
	var desc_lw = 'threads are not ready to be processed because they waiting t oacquire a lock';
	var desc_i = 'no thread running on core';
	var desc_sys = 'processor is used by the OS';
	var desc_ipc = 'executing';
	var desc_miss = '';
	var desc_tlb = 'address translation';
	var desc_l1 = 'loading data from L2 cache';
	var desc_l2 = 'loading data from L3 cache';
	var desc_l3 = 'loading data from RAM';
	var desc_hpf = 'hard page faults';
	var desc_s = 'cores switching from one thread to another';
	var desc_m = 'thread migrates to another core';
	var desc_ls = 'number of lock acquisition success';
	var desc_lf = 'number of lock acquisition failure';
	var desc_q_s = 'core is idle or execute only one thread sequentially';
	var desc_q_p = 'core executing more than one thread in parallel';

	return {
		r:		{ label: 'executing',		title: 'Thread executing',				desc: desc_r,	unity: 'ms',	cat: 'times',	attr: 'r',		color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
		y:	 	{ label: 'ready',			title: 'Thread ready to run',			desc: desc_y,	unity: 'ms',	cat: 'times',	attr: 'y',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		b:	 	{ label: 'standby',			title: 'Thread on standby to execute',	desc: desc_b,	unity: 'ms',	cat: 'times',	attr: 'b',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		yb: 	{ label: 'ready',			title: 'Thread ready to execute',		desc: desc_y,	unity: 'ms',	cat: 'times',	attr: 'yb',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		w: 		{ label: 'waiting',			title: 'Waiting',						desc: desc_w,	unity: 'ms',	cat: 'times',	attr: 'w',		color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange },
		lw:		{ label: 'lock waiting',	title: 'Thread waiting for lock',		desc: desc_lw,	unity: 'ms',	cat: 'times',	attr: 'lw',		color: colours.list.eYellow,	fcolor: colours.list.dYellow,	gcolor: colours.list.lYellow },
		uu: 	{ label: 'idle core',		title: 'Core is idle',					desc: desc_i,	unity: 'ms',	cat: 'times',	attr: 'uu',		color: colours.list.eBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.lBlue },
		sys: 	{ label: 'system',			title: 'Core occupied by other program',desc: desc_sys,	unity: 'ms',	cat: 'times',	attr: 'sys',	color: colours.list.white,		fcolor: colours.list.lGrey,		gcolor: colours.list.white },
	
		ipc:	{ label: 'executed',		title: 'Instructions per clock cycle',		desc: desc_ipc,		unity: 'ms',	cat: 'locality',	attr: 'ipc',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
		miss:	{ label: 'Cache misses',	title: 'Time spent on locality misses',		desc: desc_miss,	unity: 'ms',	cat: 'locality',	attr: 'miss',	color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange },
		tlb:	{ label: 'TLB misses',		title: 'Address translation (TLB) misses',	desc: desc_tlb,		unity: 'ms',	cat: 'locality',	attr: 'tlb',	color: colours.list.lGrey },
		l1:		{ label: 'L1 misses',		title: 'Level 1 cache miss',				desc: desc_l1,		unity: 'ms',	cat: 'locality',	attr: 'l1',		color: colours.list.lOrange },
		l2:		{ label: 'L2 misses',		title: 'Level 2 cache miss',				desc: desc_l2,		unity: 'ms',	cat: 'locality',	attr: 'l2',		color: colours.list.eOrange },
		l3:		{ label: 'L3 misses',		title: 'Level 3 cache miss',				desc: desc_l3,		unity: 'ms',	cat: 'locality',	attr: 'l3',		color: colours.list.dOrange },
		hpf:	{ label: 'Swapping',		title: 'Swapping to disk',					desc: desc_hpf,		unity: 'ms',	cat: 'locality',	attr: 'hpf',	color: colours.list.black },
		
		s:		{ label: 'switches',		title: 'Context switches',			desc: desc_s,	list: 'switches',	unity: 'events',	cat: 'switches',	attr: 's',		color: colours.list.eGrey,		fcolor: colours.list.dGrey,		gcolor: colours.list.lGrey },
		m:		{ label: 'migrations',		title: 'Thread migrations',			desc: desc_m,	list: 'migrations',	unity: 'events',	cat: 'migrations',	attr: 'm',		color: colours.list.eViolet,	fcolor: colours.list.dViolet,	gcolor: colours.list.lViolet },
		ls:		{ label: 'lock success',	title: 'Lock without contention',	desc: desc_ls,	list: 'slocks',		unity: 'events',	cat: 'locks',		attr: 'ls',		color: colours.list.eTurquoise,	fcolor: colours.list.dTurquoise,gcolor: colours.list.lTurquoise },
		lf:		{ label: 'lock failure',	title: 'Lock with contention',		desc: desc_lf,	list: 'flocks',		unity: 'events',	cat: 'locks',		attr: 'lf',		color: colours.list.eFuschia,	fcolor: colours.list.dFuschia,	gcolor: colours.list.lFuschia },
		
		q_s:	{ label: 'sequential',		title: 'Sequential sequence',	desc: desc_q_s,	unity: '', cat: '', attr: '',	color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange },
		q_p:	{ label: 'parallel',		title: 'Parallel sequence',		desc: desc_q_p,	unity: '', cat: '', attr: '',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
	};
}]);

app.factory('decks', ['facets', 'colours', function(facets, colours) {

	function n2ft(v) {
		switch(v) {
			case 0.25:	return '¼';
			case 0.5:	return '½';
			case 0.75:	return '¾';
			default:	return v + '×';
		}
	}
	function n2p(v) {
		return (Math.round(v * 1000) / 10) + ' %';
	}
	function n2fp(v) {
		switch(v) {
			case 0.25:	return '¼';
			case 0.5:	return '½';
			case 0.75:	return '¾';
			default:	return (v * 100) + ' %';
		}
	}
	
	function buildThreads(profile, begin, end) {
		var lines = [];
		profile.currentData.threads.info.forEach(function(thread) {
			lines.push({
				id: thread.h,
				l: thread.h,
				s: Math.max(thread.s, begin),
				e: (thread.e) ? Math.min(thread.e, end) : end
			});
		});
		return lines;
	}
	function buildThreadsAndFailure(profile, begin, end) {
		var lines = buildThreads(profile, begin, end);
		lines.push({
			id: 0,
			l: '?',
			s: begin,
			e: end
		});
		return lines;
	}
	function buildCores(profile, begin, end) {
		var lines = [];
		for (var l = 0; l < profile.hardware.data.threads; l++)
			lines.push({ id: l, l: 'core ' + l, s: begin, e: end });
		return lines;
	}
	function buildCoresAnonymously(profile, begin, end) {
		var lines = [];
		for (var l = 0; l < profile.hardware.data.threads; l++)
			lines.push({ id: l, l: 'core', s: begin, e: end });
		return lines;
	}

	var limit = 	{ color: colours.list.eGrey, fcolor: colours.list.dGrey, gcolor: colours.list.lGrey };
	var text = 		{ color: colours.list.black, fcolor: colours.list.black, gcolor: colours.list.black };
	
	// Texts on axis
	var a_threads =		JSON.parse(JSON.stringify(limit));
	a_threads.title =	'Threads';
	a_threads.desc =	'vertical list of thread\'s identifier';
	var a_uu =		JSON.parse(JSON.stringify(facets.uu));
	a_uu.title =	'CPU';
	a_uu.desc =		'capacity of thread executing by the cores';
	var a_cores =	JSON.parse(JSON.stringify(text));
	a_cores.title =	'cores';
	a_cores.desc =	'below CPU it represents core capacity, above CPU it is in equivalent core';

	// Fruit salad
	var m =		JSON.parse(JSON.stringify(facets.m));
	m.colors = ['#b6e3bc', '#b6e3da', '#b6cee3', '#bcb6e3', '#dab6e3', '#e3b6ce', '#e3bcb6', '#e3dab6'];

	return {
		states: {
			graph : {
				v:		[facets.yb],	// data over the limit (like other graphs)
				r:		facets.r,		// data under the limit
				s:		facets.sys,		// data amputated by the system, under the limit
				limit:	facets.uu
			},
			data : [facets.r, facets.uu, facets.y, facets.b],
			legend : [facets.sys],
			texts : [a_uu, a_cores],
			clues: [
				{ color: colours.bad,	tax: 'Oversubscription', 							text: 'too many threads' },
				{ color: colours.bad,	tax: 'Thread migrations', 							text: 'too many threads' },
				{ color: colours.bad,	tax: 'Bad thread to core ratio', 					text: 'too many threads' },
				{ color: colours.plus,	tax: 'Underscubscription', 							text: 'not enough threads' }
			],
			settings: [
				{ property: 'crenellate', value: false, type: 'flag', label: 'Round by core', desc: 'average of core activity among thread states' }
			]
		},
		switches: {
			graph : {
				v:			[facets.s],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.s; },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.s * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.s; }
			},
			data : [facets.s],
			legend : [],
			clues: [
				{ color: colours.base,	tax: 'Oversubscription',							text: 'high frequency' }
			],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		migrations: {
			graph : {
				v:		[facets.m],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.m; },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.m * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.m; }
			},
			data : [facets.m],
			legend : [],
			clues: [
				{ color: colours.base,	tax: 'Thread migrations',							text: 'too many migrations' },
				{ color: colours.base,	tax: 'Alternating sequential/parallel execution',	text: 'alternating period of high and low thread migrations' }
			],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		locality: {
			graph : {
				v:		[facets.hpf, facets.l3, facets.l2, facets.l1, facets.tlb, facets.ipc],
				limit:	limit
			},
			axis : {
				x:		{ colors: [colours.good, colours.list.lGrey, colours.list.lRed, colours.list.eRed, colours.list.dRed, colours.list.black] }
			},
			data : [facets.ipc, facets.tlb, facets.l1, facets.l2, facets.l3, facets.hpf],
			legend : [],
			clues: [],
			settings: []
		},
		counts: {
			graph : {
				v:			[facets.ls, facets.lf],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * (profile.hardware.calibration.ls + profile.hardware.calibration.lf); },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * (profile.hardware.calibration.ls + profile.hardware.calibration.lf) * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * (profile.hardware.calibration.ls + profile.hardware.calibration.lf); }
			},
			data : [facets.ls, facets.lf],
			legend : [],
			clues: [],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		contentions: {
			graph : {
				v:		[facets.lw],	// data over the limit (like other graphs)
				r:		facets.r,		// data under the limit
				s:		facets.sys,		// data amputated by the system, under the limit
				limit:	facets.uu
			},
			data : [facets.r, facets.uu, facets.lw],
			legend : [facets.sys],
			clues: [],
			settings: [
				{ property: 'crenellate', value: false, type: 'flag', label: 'Round by core', desc: 'average of core activity among thread states' }
			]
		},
		migrationLT: {
			graph : {
				h:			limit,		// threads (color)
				ticks:		[facets.m],
				periods:	[m],
			},
			data : [facets.m],
			legend : [],
			texts: [a_threads],
			clues: [
				{ color: colours.unkn,	tax: 'Task start/stop overhead',					text: 'too many creations' },
				{ color: colours.alt,	tax: 'Oversubscription',							text: 'too many threads' },
				{ color: colours.base,	tax: 'Thread migrations',							text: 'too many threads' },
				{ color: colours.alt,	tax: 'Thread migrations',							text: 'too many migrations' },
				{ color: colours.unkn,	tax: 'Task start/stop overhead',					text: 'too short lifetime' }
			],
			settings: [
				{ property: 'disableTicks', value: false, type: 'flag', label: 'Disable ticks' },
				{ property: 'groupTicks', value: false, type: 'flag', label: 'Group ticks' },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10, depends: 'groupTicks' },
				{ property: 'disablePeriods', value: true, type: 'flag', label: 'Disable fruit salad' },
			]
		},
		lockLT: {
			graph : {
				h:	limit,		// threads (color)
				ticks:		[facets.ls, facets.lf],
				periods:	[facets.lw],
			},
			data : [facets.lw],
			legend : [facets.ls, facets.lf],
			clues: [],
			settings: [
				{ property: 'disableTicks', value: false, type: 'flag', label: 'Disable ticks' },
				{ property: 'disablePeriods', value: false, type: 'flag', label: 'Disable periods' }
			]
		},
		sequences: {
			graph : {
				h:			limit,		// threads (color)
				lines:		buildCoresAnonymously,
				sequences:	{ under: facets.q_s, count: facets.q_p }
			},
			data : [],
			legend : [facets.q_s, facets.q_p],
			clues: [],
			params: [
				{ property: 'lineHeight', value: 10 }
			],
			settings: [
				{ property: 'disableLine', value: false, type: 'flag', label: 'Core line', desc: 'hide core line' },
				{ property: 'disableSequenceDashs', value: false, type: 'flag', label: 'Core executing', desc: 'hide core executing' },
				{ property: 'disableSequenceBackgound', value: false, type: 'flag', label: 'Parallel sequences', desc: 'hide backgound sequences (parallel/sequential)' },
				{ property: 'sequenceThreshold', value: 1, type: 'range', label: 'Parallel threshold', unit: 'running threads', min: 0, max: 3, step: 1 },
			]
		},
		coreUU: {
			graph : {
				h:			limit,		// threads (color)
				lines:		buildCores,
				melody:		[facets.uu],
				melody_cat:	'cores',
			},
			data : [facets.uu],
			legend : [],
			clues: [],
			settings: [
				{ property: 'melodyHeight', value: 9, type: 'range', label: 'Inactivity height', unit: 'pixels', min: 6, max: 12, step: 1 }
			]
		},
		chains: {
			graph : {
				h:			limit,		// color
				lines:		buildThreadsAndFailure,
				depends:	{
					start: facets.ls,
					end: facets.lf,
					color: facets.lw,
					from: 'hl',
					to: 'h',
					failID: 0
				}
			},
			data : [facets.ls, facets.lf],
			legend : [facets.lw],
			clues: [],
			settings: [
			]
		},
	};
}]);


app.factory('widgets', ['decks', function(decks) {
	var i = 0;
	function id() { return ++i; }
	
	return {
		cacheInvalid:		{ id: id(),	v: 3, file: 'generic-to-delete',	deck: null,					wide: false,	title: 'Cache misses from updating shared data',					desc: ''},
		cacheMisses:		{ id: id(),	v: 3, file: 'chart-percent',		deck: decks.locality,		wide: false,	title: 'Percentage of time spent on locality misses',				desc: ''},
		cacheBreackdown:	{ id: id(),	v: 3, file: 'generic-to-delete',	deck: null,					wide: true,		title: 'Breackdown of time spent on locality misses',				desc: ''},
		coreIdle:			{ id: id(),	v: 3, file: 'chart-lines',			deck: decks.coreUU,			wide: false,	title: 'Idle cores',												desc: 'Times that cores are idle'},
		coreSequences:		{ id: id(),	v: 3, file: 'chart-lines',			deck: decks.sequences,		wide: false,	title: 'Single thread execution phases',							desc: 'alternating sequential/parallel execution'},
		lockCounts:			{ id: id(),	v: 4, file: 'chart-units',			deck: decks.counts,			wide: false,	title: 'Lock contentions',											desc: 'Locking with and without contention'},
		lockContentions:	{ id: id(),	v: 4, file: 'chart-capacity',		deck: decks.contentions,	wide: false,	title: 'Time waiting for a lock',									desc: ''},
		threadChains:		{ id: id(),	v: 3, file: 'chart-lines',			deck: decks.chains,			wide: false,	title: 'Chains of dependencies on locks',							desc: 'synchronisations and waiting between threads'},
		threadFruitSalad:	{ id: id(),	v: 3, file: 'chart-threads',		deck: decks.migrationLT,	wide: false,	title: 'Thread migrating to a different core',						desc: 'creation, running, moving between cores, termination'},
		threadLocks:		{ id: id(),	v: 4, file: 'chart-threads',		deck: decks.lockLT,			wide: false,	title: 'Time each thread spends waiting for locks',					desc: ''},
		threadStates:		{ id: id(),	v: 3, file: 'chart-capacity',		deck: decks.states,			wide: false,	title: 'Breakdown of thread states compared to number of cores',	desc: 'number of threads compared to number of cores'},
		threadMigrations:	{ id: id(),	v: 3, file: 'chart-units',			deck: decks.migrations,		wide: false,	title: 'Thread switching the core on which it is executing',		desc: 'thread migrations'},
		threadSwitches:		{ id: id(),	v: 3, file: 'chart-units',			deck: decks.switches,		wide: false,	title: 'Core swhitching the thread it is executing',				desc: 'thread switches'},
	};
}]);


app.factory('strips', ['facets', function(facets) {
	return {
		r:		{ title: 'Running',				facet: facets.r,	reverse: false },
		uu:		{ title: 'Unused cores',		facet: facets.uu,	reverse: true },
		yb:		{ title: 'Waiting a core',		facet: facets.yb,	reverse: false },
		lw:		{ title: 'Waiting a ressource',	facet: facets.lw,	reverse: false },
		miss:	{ title: 'Cache misses',		facet: facets.miss,	reverse: false }
	};
}]);


app.factory('categories', ['widgets', 'strips', 'facets',  function(widgets, strips, facets) {
	var yb =	JSON.parse(JSON.stringify(facets.yb));
	var lw =	JSON.parse(JSON.stringify(facets.lw));
	var miss =	JSON.parse(JSON.stringify(facets.miss));
	
	yb.shift = true;
	lw.shift = true;
	miss.shift = true;
	
	var common = {
		label: 'Profile', title: 'Profile', icon: 'heartbeat',
		strips: [strips.r],
		gauges: []
	};
	var tg = {
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks', enabled: true,
		strips: [strips.yb, strips.uu],
		gauges: [[yb, facets.uu], [facets.s, facets.m]], /* facets.r, */
		widgets: [widgets.threadStates, widgets.threadSwitches, widgets.threadMigrations, widgets.threadFruitSalad]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'cutlery', enabled: true,
		strips: [strips.lw],
		gauges: [[lw], [facets.ls, facets.lf]],
		widgets: [widgets.lockCounts, widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		tag: 'ds', cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'share-alt', enabled: true,
		strips: [],
		gauges: [[lw, miss]],
		widgets: [widgets.lockContentions, widgets.cacheInvalid, widgets.cacheMisses]
	};
	var lb = {
		tag: 'lb', cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'code-fork', enabled: true,
		strips: [],
		gauges: [[lw, facets.uu], [facets.m]],
		widgets: [widgets.coreIdle, widgets.lockContentions, widgets.threadMigrations, widgets.threadStates, widgets.coreSequences, widgets.threadChains]
	};
	var dl = {
		tag: 'dl', cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'location-arrow', enabled: true,
		strips: [strips.miss],
		gauges: [[miss]], /* facets.ipc, */
		widgets: [widgets.cacheMisses, widgets.cacheBreackdown]
	};
	var rs = {
		tag: 'rs', cat: 'rs', label: 'Resource sharing', title: 'Resource sharing', icon: 'exchange', enabled: true,
		strips: [],
		gauges: [],
		widgets: []
	};
	var io = {
		tag: 'io', cat: 'io', label: 'Input/Output', title: 'Input/Output', icon: 'plug', enabled: false,
		strips: [],
		gauges: [],
		widgets: []
	};

	var output = {
		all: [tg, sy, ds, lb, dl, rs, io],
		tg: tg, sy: sy, ds: ds, lb: lb, dl: dl, rs: rs, io: io, common: common
	};
	
	return output;
}]);