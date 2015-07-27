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

app.factory('decks', ['colours', function(colours) {

	var ready_label = 'threads are waiting a core but none available; threads are prepared to run on the next available core';
	var standby_label = 'threads exiting the ready stack to run on an available core';
	var waiting_label = 'threads are not ready to be processed because they waiting ressource(s)';
	var l_wait_label = 'threads are not ready to be processed because they waiting lock(s)';

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

	var running = 	{ label: 'threads running',	title: 'running',	desc: 'processor executing threads',	unity: 'ms', cat: 'times', attr: 'r',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen };
	var readySB = 	{ label: 'threads ready',	title: 'ready',		desc: ready_label,						unity: 'ms', cat: 'times', attr: 'yb',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed };
	var ready = 	{ label: 'threads ready',	title: 'ready',		desc: ready_label,						unity: 'ms', cat: 'times', attr: 'y',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed };
	var standBy = 	{ label: 'threads standBy',	title: 'stand by',	desc: standby_label,					unity: 'ms', cat: 'times', attr: 'b',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed };
	var waiting = 	{ label: 'threads waiting',	title: 'waiting',	desc: waiting_label,					unity: 'ms', cat: 'times', attr: 'w',	color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange };
	var capacity = 	{ label: 'unused core',		title: 'unused',	desc: 'processor is not fully used',	unity: 'ms', cat: 'times', attr: 'uu',	color: colours.list.eBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.lBlue };
	var system = 	{ label: 'system',			title: 'system',	desc: 'processor is used by the OS (soon)',	unity: 'ms', cat: 'times', attr: '-',	color: colours.list.black,		fcolor: colours.list.black,		gcolor: colours.list.black };

	var ipc = 		{ label: 'executing',			title: 'Executing',			desc: 'executing',				unity: 'ms', cat: 'locality',	attr: 'ipc',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen };
	var miss = 		{ label: 'Cache misses',		title: 'Cache misses',		desc: '',						unity: 'ms', cat: 'locality',	attr: 'miss',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed };
	var tlbmiss = 	{ label: 'address translation',	title: 'TLB misses',		desc: 'address translation',	unity: 'ms', cat: 'locality',	attr: 'tlb',	color: colours.list.lGrey };
	var l1miss = 	{ label: 'loading from L2',		title: 'L1 misses',			desc: 'loading data from L2',	unity: 'ms', cat: 'locality',	attr: 'l1',		color: colours.list.lRed };
	var l2miss = 	{ label: 'loading from L3',		title: 'L2 misses',			desc: 'loading data from L3',	unity: 'ms', cat: 'locality',	attr: 'l2',		color: colours.list.eRed };
	var l3miss = 	{ label: 'loading from RAM',	title: 'L3 misses',			desc: 'loading data from RAM',	unity: 'ms', cat: 'locality',	attr: 'l3',		color: colours.list.dRed };
	var swapping = 	{ label: 'Swapping',			title: 'Swapping',			desc: 'hard page faults',		unity: 'ms', cat: 'locality',	attr: 'hpf',	color: colours.list.black };
	
	var ipc_blank = { label: ipc.label,	title: ipc.title,	desc: ipc.desc,	unity: ipc.unity, cat: ipc.cat,	attr: ipc.attr,	color: colours.list.white,	fcolor: colours.list.white,	gcolor: colours.list.white };

	var sw = 		{ label: 'switches',	title: 'context switches',	desc: 'cores switching the working thread',	list: 'switches',	cat: 'switches',	attr: 's',											color: colours.list.eGrey,		fcolor: colours.list.dGrey,		gcolor: colours.list.lGrey };
	var mg = 		{ label: 'migrations',	title: 'thread migrations',	desc: 'thread migrate to another core',		list: 'migrations',	cat: 'migrations',	attr: 'm',											color: colours.list.eViolet,	fcolor: colours.list.dViolet,	gcolor: colours.list.lViolet };
	var mg2 = 		{ label: 'migrations',	title: 'thread migrations',	desc: mg.desc,								list: 'migrations',	cat: 'migrations',	attr: 'm',	colors: [colours.base, colours.alt],	color: colours.list.eViolet,	fcolor: colours.list.dViolet,	gcolor: colours.list.lViolet };
	var mg_tmp = 	{ label: 'migrations',	title: 'migrations',		desc: 'migrations',												cat: 'migrations',	attr: 'm',	color2: colours.alt,	color: colours.list.eViolet,	fcolor: colours.list.dViolet,	gcolor: colours.list.lViolet };

	var l_success = { label: 'lock success',	title: 'lock success',	desc: 'number of lock acquisition success',					list: 'slocks', cat: 'locks', attr: 's',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen };
	var l_failure = { label: 'lock failure',	title: 'lock failure',	desc: 'number of lock acquisition failure',					list: 'flocks', cat: 'locks', attr: 'f',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed };
	var l_wait = 	{ label: 'lock waiting',	title: 'waiting',		desc: l_wait_label,							unity: 'ms',					cat: 'times', attr: 'lw',	color: colours.list.eYellow,	fcolor: colours.list.dYellow,	gcolor: colours.list.lYellow };

	return {
		r:		{ data: [running] },
		uu:		{ data: [capacity] },
		yb:		{ data: [readySB] },
		lw:		{ data: [l_wait] },
		miss:	{ data: [miss] },
		sw:		{ data: [sw],		graph : { expected:	function(profile) { return profile.data.dash.info.duration * profile.hardware.data.threads * profile.hardware.calibration.switches; }} },
		mg:		{ data: [mg],		graph : { expected:	function(profile) { return profile.data.dash.info.duration * profile.hardware.data.threads * profile.hardware.calibration.migrations; }} },
		gauge_states:	{ data: [running, readySB, l_wait] },
		gauge_unused:	{ data: [running, capacity] },
		gauge_miss:		{ data: [miss, ipc_blank] },
		states: {
			graph : {
				v:		[readySB],	// data over the limit (like other graphs)
				r:		running,	// data under the limit (specials)
				limit:	capacity
			},
			data : [running, ready, standBy],
			legend : [capacity, system],
			clues: [
				{ color: colours.bad,	tax: 'Oversubscription', 							text: 'too many threads' },
				{ color: colours.bad,	tax: 'Thread migrations', 							text: 'too many threads' },
				{ color: colours.bad,	tax: 'Bad thread to core ratio', 					text: 'too many threads' },
				{ color: colours.plus,	tax: 'Underscubscription', 							text: 'not enough threads' }
			],
			settings: [
				{ property: 'crenellate', value: false, type: 'flag', label: 'Round by core' },
				{ property: 'upsidedown', value: true, type: 'flag', label: 'Upsidedown running' }/*,
				{ property: 'vMirror', value: true, type: 'flag', label: 'Vertical mirror' }*/
			]
		},
		inactivity: {
			graph : {
				v:		[],
				limit:	limit
			},
			data : [],
			legend : [running, capacity, system],
			clues: [],
			settings: []
		},
		switches: {
			graph : {
				v:			[sw],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.switches; },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.switches * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.switches; }
			},
			data : [sw],
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
				v:		[mg],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.migrations; },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.migrations * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.migrations; }
			},
			data : [mg],
			legend : [],
			clues: [
				{ color: colours.base,	tax: 'Thread migrations',							text: 'too many migrations' },
				{ color: colours.base,	tax: 'Alternating sequential/parallel execution',	text: 'alternating period of high and low thread migrations' }
			],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		lifetime: {
			axis : {
				x:		{ color: colours.base, colors: [colours.base, colours.alt] }
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
			settings: []
		},
		locality: {
			graph : {
				v:		[swapping, l3miss, l2miss, l1miss, tlbmiss, ipc],
				limit:	limit
			},
			axis : {
				x:		{ colors: [colours.good, colours.list.lGrey, colours.list.lRed, colours.list.eRed, colours.list.dRed, colours.list.black] }
			},
			data : [ipc, tlbmiss, l1miss, l2miss, l3miss, swapping],
			legend : [],
			clues: [],
			settings: []
		},
		counts: {
			graph : {
				v:			[l_success, l_failure],
				limit:		limit_th,
				limitLabel:	'threads',
				expected:	function(profile) { return profile.currentData.stats.h; },
				displayed:	function(profile) { return profile.currentData.stats.h + 2; },
				vStep:		function(profile) { return profile.currentData.stats.h; }
			},
			data : [l_success, l_failure],
			legend : [],
			clues: [],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		contentions: {
			graph : {
				v:		[l_wait],	// data over the limit (like other graphs)
				r:		running,	// data under the limit (specials)
				limit:	capacity
			},
			data : [running, l_wait, waiting],
			legend : [capacity, system],
			clues: [],
			settings: [
				{ property: 'crenellate', value: false, type: 'flag', label: 'Round by core' },
				{ property: 'upsidedown', value: true, type: 'flag', label: 'Upsidedown running' }
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
		threadLifetime:		{ id: 3,	v: 3, file: 'thread-lifetime',		deck: decks.lifetime,		tag: 'thread-running',		title: 'Life states of threads',								subtitle: 'creation, running, moving between cores, termination'},
		threadLocks:		{ id: 4,	v: 3, file: 'generic-to-delete',	deck: null,					tag: 'thread-locks',		title: 'Waiting for locks',										subtitle: ''},
		threadStates:		{ id: 6,	v: 3, file: 'chart-capacity',		deck: decks.states,			tag: 'thread-states',		title: 'Potential parallelism',									subtitle: 'number of running threads compared to number of cores'},
		threadMigrations:	{ id: 7,	v: 3, file: 'chart-units',			deck: decks.migrations,		tag: 'thread-migrations',	title: 'Thread switching the core on which it is executing',	subtitle: 'thread migrations'},
		threadSwitchs:		{ id: 8,	v: 3, file: 'chart-units',			deck: decks.switches,		tag: 'thread-switchs',		title: 'Core swhitching the thread it is executing',			subtitle: 'thread switches'},
	};
}]);


app.factory('strips', ['decks', function(decks) {
	var r		= { title: 'Running',				deck: decks.r,		reverse: false };
	var uu		= { title: 'Unused cores',			deck: decks.uu,		reverse: true };
	var yb		= { title: 'Waiting cores',			deck: decks.yb,		reverse: false };
	var lw		= { title: 'Waiting ressources',	deck: decks.lw,		reverse: false };
	var miss	= { title: 'Cache misses',			deck: decks.miss,	reverse: false };
	
	return {
		r: r, uu: uu, yb: yb, lw: lw, miss: miss,
		all: [r, uu, yb, lw, lw, miss]
	}
}]);


app.factory('gauges', ['decks', function(decks) {
	var states	= { title: 'Thread states',	deck: decks.gauge_states,	graph: 'gaugeCompare',		isBig: true};
	var uu		= { title: 'CPU usage',		deck: decks.gauge_unused,	graph: 'gaugeProportion',	isBig: false};
	var sw		= { title: 'Switches',		deck: decks.sw,				graph: 'gaugeUnits',		isBig: false};
	var mg		= { title: 'Migrations',	deck: decks.mg,				graph: 'gaugeUnits',		isBig: false};
	var miss	= { title: 'Cache misses',	deck: decks.gauge_miss,		graph: 'gaugeProportion',	isBig: false};
	
	return {
		states: states, uu: uu, sw: sw, mg: mg, miss: miss, 
		all: [states, uu, sw, mg, miss]
	}
}]);

app.factory('categories', ['widgets', 'strips', 'gauges',  function(widgets, strips, gauges) {
	var common = {
		label: 'Profile', title: 'Profile', icon: 'heartbeat',
		strips: [strips.r],
		gauges: [gauges.states],
		widgets: [widgets.threadStates, widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime]
	};
	var tg = {
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks', enabled: true,
		strips: [strips.yb, strips.uu],
		gauges: [gauges.uu, gauges.sw, gauges.mg],
		widgets: [widgets.threadStates, widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'cutlery', enabled: true,
		strips: [strips.lw, strips.uu],
		gauges: [],
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
		gauges: [strips.miss],
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

app.factory('indicators', ['colours', 'categories', function(colours, categories) {
	//
	//	Getter function
	//
	function labelPercent(p, getter) {return Math.round(getter(p) * 100) + '%'; }
	function labelTimes(p, getter) {return '×' + (Math.round(getter(p) * 10) / 10); }

	function timeRunning(dp) {		return dp.stats.r / (dp.info.threads * dp.info.duration); }
	function timeAvailable(dp) {	return ((dp.info.threads * dp.info.duration) - dp.stats.r) / (dp.info.threads * dp.info.duration); }
	function timeWaiting(dp) {		return (dp.stats.y + dp.stats.b) / (dp.info.threads * dp.info.duration); }

	function evSwCapacity(profile) {	return (profile.hardware.calibration.switches * profile.hardware.data.threads * profile.data.dash.info.duration); }
	function evMgCapacity(profile) {	return (profile.hardware.calibration.migrations * profile.hardware.data.threads * profile.data.dash.info.duration); }
	function evSwitches(profile) {		return profile.data.dash.stats.s / evSwCapacity(profile); }
	function evMigrations(profile) {	return profile.data.dash.stats.m / evMgCapacity(profile); }

	function cmIPC(profile) { return profile.data.dash.stats.locality.ipc; }
	function cmMisses(profile) { return profile.data.dash.stats.locality.tlb + profile.data.dash.stats.locality.l1 + profile.data.dash.stats.locality.l2 + profile.data.dash.stats.locality.l3 + profile.data.dash.stats.locality.hpf; }
	function cmTotal(profile) { return cmIPC(profile) + cmMisses(profile); }

	function percentIPC(profile) { return cmIPC(profile) / cmTotal(profile); }
	function percentMisses(profile) { return cmMisses(profile) / cmTotal(profile); }


	//
	//	Indicators
	//
	var indic_p = {
		title:	'Parallelism',
		icon:	'info-circle',
		graph:	'widgetDashTrack',
		links:	[categories.tg, categories.lb],
		legend:	[
			{ label: 'running',				color: colours.list.dGreen	},
			{ label: 'unused ressources',	color: colours.list.dBlue	},
			{ label: 'waiting',				color: colours.list.dRed	}
		],
		deck: [[{
				t: '',
				l: function(dp) { return labelPercent(dp, timeRunning); },
				v: timeRunning,
				c: colours.list.dGreen,
				b: colours.list.lGreen,
				g: 2 // group the 2 firsts
			}, {
				t: '',
				l: function(dp) { return labelPercent(dp, timeAvailable); },
				v: timeAvailable,
				c: colours.list.dBlue,
				b: colours.list.lBlue
			}, {
				t: '',
				l: function(dp) { return labelPercent(dp, timeWaiting); },
				v: timeWaiting,
				c: colours.list.dRed,
				b: colours.list.lRed
			}]]
	};
	
	var indic_b = {
		title:	'Thread swhitching',
		icon:	'info-circle',
		graph:	'widgetDashDeviation',
		links:	[categories.tg, categories.lb],
		legend:	[
			{ label: 'context switches',	color: colours.list.dGrey	},
			{ label: 'core migrations',		color: colours.list.dViolet }/*,
			{ label: 'calibration',			color: colours.list.black,		icon: '×1' }*/
		],
		deck: [{
				t: '',
				l: function(profile) { return labelTimes(profile, evSwitches); },
				v: evSwitches,			// value
				c: colours.list.eGrey,	// color: foreground
				b: colours.list.lGrey,	// color: background
				o: colours.list.dGrey	// color: over
			}, {
				t: '',
				l: function(profile) { return labelTimes(profile, evMigrations); },
				v: evMigrations,			// value
				c: colours.list.eViolet,	// color: foreground
				b: colours.list.lViolet,	// color: background
				o: colours.list.dViolet		// color: over
			}]
	};
	
	var indic_m = {
		title:	'Cache misses',
		icon:	'info-circle',
		graph:	'widgetDashCompare',
		links:	[categories.dl],
		legend:	[
			{ label: 'executing',		color: colours.list.dGreen	},
			{ label: 'cache misses',	color: colours.list.dRed	}
		],
		deck: [{
				l: function(profile) { return labelPercent(profile, percentIPC); },
				v: percentIPC,
				c: colours.list.dGreen
			}, {
				l: function(profile) { return labelPercent(profile, percentMisses); },
				v: percentMisses,
				c: colours.list.dRed
			}]
	};


	// 
	//	Output
	//
	return {
		parallelism:	indic_p,
		balancing:		indic_b,
		misses:			indic_m,
		all:			[indic_p, indic_b, indic_m]
	}
}]);