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
	var desc_r = 'threads are excuted';
	var desc_y = 'threads are waiting a core but none available; threads are prepared to run on the next available core';
	var desc_b = 'threads exiting the ready stack to run on an available core';
	var desc_w = 'threads are not ready to be processed because they waiting ressource(s)';
	var desc_lw = 'threads are not ready to be processed because they waiting lock(s)';
	var desc_uu = 'processor is available (idle)';
	var desc_sys = 'processor is used by the OS';
	var desc_ipc = 'executing';
	var desc_miss = '';
	var desc_tlb = 'address translation';
	var desc_l1 = 'loading data from L2';
	var desc_l2 = 'loading data from L3';
	var desc_l3 = 'loading data from RAM';
	var desc_hpf = 'hard page faults';
	var desc_s = 'cores switching the working thread';
	var desc_m = 'thread migrate to another core';
	var desc_ls = 'number of lock acquisition success';
	var desc_lf = 'number of lock acquisition failure';

	return {
		r:		{ label: 'threads running',		title: 'running',			desc: desc_r,		unity: 'ms',		cat: 'times',		attr: 'r',		color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
		y:	 	{ label: 'threads ready',		title: 'ready',				desc: desc_y,		unity: 'ms',		cat: 'times',		attr: 'y',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		b:	 	{ label: 'threads standBy',		title: 'stand by',			desc: desc_b,		unity: 'ms',		cat: 'times',		attr: 'b',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		yb: 	{ label: 'threads ready',		title: 'ready',				desc: desc_y,		unity: 'ms',		cat: 'times',		attr: 'yb',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		w: 		{ label: 'threads waiting',		title: 'waiting',			desc: desc_w,		unity: 'ms',		cat: 'times',		attr: 'w',		color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange },
		lw:		{ label: 'lock waiting',		title: 'waiting',			desc: desc_lw,		unity: 'ms',		cat: 'times',		attr: 'lw',		color: colours.list.eYellow,	fcolor: colours.list.dYellow,	gcolor: colours.list.lYellow },
		uu: 	{ label: 'unused core',			title: 'unused',			desc: desc_uu,		unity: 'ms',		cat: 'times',		attr: 'uu',		color: colours.list.eBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.lBlue },
		sys: 	{ label: 'system',				title: 'system',			desc: desc_sys,		unity: 'ms',		cat: 'times',		attr: 'sys',	color: colours.list.white,		fcolor: colours.list.lGrey,		gcolor: colours.list.white },
	
		ipc:	{ label: 'executing',			title: 'Executing',			desc: desc_ipc,		unity: 'ms',		cat: 'locality',	attr: 'ipc',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
		miss:	{ label: 'Cache misses',		title: 'Cache misses',		desc: desc_miss,	unity: 'ms',		cat: 'locality',	attr: 'miss',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		tlb:	{ label: 'address translation',	title: 'TLB misses',		desc: desc_tlb,		unity: 'ms',		cat: 'locality',	attr: 'tlb',	color: colours.list.lGrey },
		l1:		{ label: 'loading from L2',		title: 'L1 misses',			desc: desc_l1,		unity: 'ms',		cat: 'locality',	attr: 'l1',		color: colours.list.lRed },
		l2:		{ label: 'loading from L3',		title: 'L2 misses',			desc: desc_l2,		unity: 'ms',		cat: 'locality',	attr: 'l2',		color: colours.list.eRed },
		l3:		{ label: 'loading from RAM',	title: 'L3 misses',			desc: desc_l3,		unity: 'ms',		cat: 'locality',	attr: 'l3',		color: colours.list.dRed },
		hpf:	{ label: 'Swapping',			title: 'Swapping',			desc: desc_hpf,		unity: 'ms',		cat: 'locality',	attr: 'hpf',	color: colours.list.black },
		
		s:		{ label: 'switches',			title: 'context switches',	desc: desc_s,		list: 'switches',	cat: 'switches',	attr: 's',		color: colours.list.eGrey,		fcolor: colours.list.dGrey,		gcolor: colours.list.lGrey },
		m:		{ label: 'migrations',			title: 'thread migrations',	desc: desc_m,		list: 'migrations',	cat: 'migrations',	attr: 'm',		color: colours.list.eViolet,	fcolor: colours.list.dViolet,	gcolor: colours.list.lViolet },
		ls:		{ label: 'lock success',		title: 'lock success',		desc: desc_ls,		list: 'slocks',		cat: 'locks',		attr: 'ls',		color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
		lf:		{ label: 'lock failure',		title: 'lock failure',		desc: desc_lf,		list: 'flocks',		cat: 'locks',		attr: 'lf',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed }
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

	var limit = 	{ color: colours.list.eGrey, fcolor: colours.list.dGrey, gcolor: colours.list.lGrey,	expected: function(profile) { return 100; },																displayed: function(profile) { return 110; } };
	var limit_th = 	{ color: limit.color, fcolor: limit.fcolor, gcolor: limit.gcolor, label: 'threads',		expected: function(profile) { return profile.currentData.stats.h; },										displayed: function(profile) { return profile.currentData.stats.h + 2; } };

	var mg2 = 		{ label: facets.m.label,   title: facets.m.title,	desc: facets.m.desc,							cat: facets.m.cat,	 attr: facets.m.attr,	colors: [colours.base, colours.alt], color: colours.list.eViolet, fcolor: colours.list.dViolet,	gcolor: colours.list.lViolet };


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
			clues: [
				{ color: colours.bad,	tax: 'Oversubscription', 							text: 'too many threads' },
				{ color: colours.bad,	tax: 'Thread migrations', 							text: 'too many threads' },
				{ color: colours.bad,	tax: 'Bad thread to core ratio', 					text: 'too many threads' },
				{ color: colours.plus,	tax: 'Underscubscription', 							text: 'not enough threads' }
			],
			settings: [
				{ property: 'crenellate', value: false, type: 'flag', label: 'Round by core' }
			]
		},
		inactivity: {
			graph : {
				v:		[],
				limit:	limit
			},
			data : [],
			legend : [facets.r, facets.uu, facets.sys],
			clues: [],
			settings: []
		},
		switches: {
			graph : {
				v:			[facets.s],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.switches; },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.switches * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.switches; }
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
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.migrations; },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.migrations * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.migrations; }
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
				limit:		limit_th,
				limitLabel:	'threads',
				expected:	function(profile) { return profile.currentData.stats.h; },
				displayed:	function(profile) { return profile.currentData.stats.h + 2; },
				vStep:		function(profile) { return profile.currentData.stats.h; }
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
				{ property: 'crenellate', value: false, type: 'flag', label: 'Round by core' }
			]
		},
		migrationLT: {
			axis : {
				x:		{ color: colours.base, colors: [colours.base, colours.alt] }
			},
			graph : {
				h:		limit,		// threads (color)
				ticks:	[facets.m],
			},
			data : [mg2],
			legend : [],
			clues: [
				{ color: colours.unkn,	tax: 'Task start/stop overhead',					text: 'too many creations' },
				{ color: colours.alt,	tax: 'Oversubscription',							text: 'too many threads' },
				{ color: colours.base,	tax: 'Thread migrations',							text: 'too many threads' },
				{ color: colours.alt,	tax: 'Thread migrations',							text: 'too many migrations' },
				{ color: colours.unkn,	tax: 'Task start/stop overhead',					text: 'too short lifetime' }
			],
			settings: [
				{ property: 'disableTicks', value: false, type: 'flag', label: 'Disable ticks' }
			]
		},
		lockLT: {
			graph : {
				h:	limit,		// threads (color)
				ticks:	[facets.ls, facets.lf],
			},
			data : [],
			legend : [],
			clues: [],
			settings: [
				{ property: 'disableTicks', value: false, type: 'flag', label: 'Disable ticks' }
			]
		},
	};
}]);


app.factory('widgets', ['decks', function(decks) {
	return {
		cacheInvalid:		{ id: 10,	v: 3, file: 'generic-to-delete',	deck: null,					tag: 'cache-invalid',		title: 'Cache misses from updating shared data',				subtitle: ''},
		cacheMisses:		{ id: 11,	v: 3, file: 'chart-percent',		deck: decks.locality,		tag: 'cache-misses',		title: 'Cache misses',											subtitle: ''},
		coreInactivity:		{ id: 5,	v: 3, file: 'core-inactivity',		deck: decks.inactivity,		tag: 'core-idle',			title: 'Idle cores',											subtitle: ''},
		lockCounts:			{ id: 12,	v: 4, file: 'chart-units',			deck: decks.counts,			tag: 'lock-counts',			title: 'Lock contentions',										subtitle: 'lock failure versus lock acquisition'},
		lockContentions:	{ id: 9,	v: 4, file: 'chart-capacity',		deck: decks.contentions,	tag: 'lock-contentions',	title: 'Time waiting for a lock',								subtitle: 'waiting for ressources'},
		threadPaths:		{ id: 1,	v: 3, file: 'generic-to-delete',	deck: null,					tag: 'thread-paths',		title: 'Single thread execution phases',						subtitle: 'alternating sequential/parallel execution'},
		threadChains:		{ id: 2,	v: 3, file: 'generic-to-delete',	deck: null,					tag: 'thread-chains',		title: 'Chains of dependencies',								subtitle: 'synchronisations and waiting between threads'},
		threadLifetime:		{ id: 3,	v: 3, file: 'thread-lifetime',	/*'chart-threads'*/	deck: decks.migrationLT,		tag: 'thread-facets.r',		title: 'Life states of threads',								subtitle: 'creation, running, moving between cores, termination'},
		threadLocks:		{ id: 4,	v: 4, file: 'chart-threads',		deck: decks.lockLT,					tag: 'thread-locks',		title: 'Waiting for locks',										subtitle: ''},
		threadStates:		{ id: 6,	v: 3, file: 'chart-capacity',		deck: decks.states,			tag: 'thread-states',		title: 'Potential parallelism',									subtitle: 'number of running threads compared to number of cores'},
		threadMigrations:	{ id: 7,	v: 3, file: 'chart-units',			deck: decks.migrations,		tag: 'thread-migrations',	title: 'Thread switching the core on which it is executing',	subtitle: 'thread migrations'},
		threadSwitchs:		{ id: 8,	v: 3, file: 'chart-units',			deck: decks.switches,		tag: 'thread-switchs',		title: 'Core swhitching the thread it is executing',			subtitle: 'thread switches'},
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
	var common = {
		label: 'Profile', title: 'Profile', icon: 'heartbeat',
		strips: [strips.r],
		gauges: [],
		widgets: [widgets.threadStates, widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime]
	};
	var tg = {
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks', enabled: true,
		strips: [strips.yb, strips.uu],
		gauges: [[facets.r, facets.uu, facets.yb], [facets.s, facets.m]],
		widgets: [widgets.threadStates, widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'cutlery', enabled: true,
		strips: [strips.lw],
		gauges: [[facets.lw], [facets.ls, facets.lf]],
		widgets: [widgets.lockCounts, widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		tag: 'ds', cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'share-alt', enabled: true,
		strips: [],
		gauges: [],
		widgets: [widgets.lockContentions, widgets.cacheInvalid, widgets.cacheMisses]
	};
	var lb = {
		tag: 'lb', cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'code-fork', enabled: true,
		strips: [],
		gauges: [],
		widgets: [widgets.coreInactivity, widgets.lockContentions, widgets.threadMigrations, widgets.threadStates, widgets.threadPaths, widgets.threadChains]
	};
	var dl = {
		tag: 'dl', cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'location-arrow', enabled: true,
		strips: [strips.miss],
		gauges: [[facets.ipc, facets.miss]],
		widgets: [widgets.cacheMisses]
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