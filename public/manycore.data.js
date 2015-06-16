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
	var waiting_label = 'threads are not ready to be processed because they waiting ressource(s)';
	var l_wait_label = 'threads are not ready to be processed because they waiting lock(s)';

	var limit = 	{ color: colours.list.eGrey, fcolor: colours.list.dGrey, gcolor: colours.list.gGrey };
	var limit_th = 	{ color: limit.color, fcolor: limit.fcolor, gcolor: limit.gcolor, label: 'threads',  value: function(profile) { return profile.currentData.stats.h; } };

	var running = 	{ label: 'threads running',	title: 'running',	desc: 'processor executing threads',	unity: 'ms', cat: 'times', attr: 'r',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.gGreen };
	var readySB = 	{ label: 'threads ready',	title: 'ready',		desc: ready_label,						unity: 'ms', cat: 'times', attr: 'yb',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.gRed };
	var ready = 	{ label: 'threads ready',	title: 'ready',		desc: ready_label,						unity: 'ms', cat: 'times', attr: 'y',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.gRed };
	var standBy = 	{ label: 'threads standBy',	title: 'stand by',	desc: ready_label,						unity: 'ms', cat: 'times', attr: 'b',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.gRed };
	var waiting = 	{ label: 'threads waiting',	title: 'waiting',	desc: waiting_label,					unity: 'ms', cat: 'times', attr: 'w',	color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.gOrange };
	var capacity = 	{ label: 'unused core',		title: 'unused',	desc: 'processor is not fully used',	unity: 'ms', cat: 'times', attr: 'uu',	color: colours.list.eBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.gBlue };
	var system = 	{ label: 'system',			title: 'system',	desc: 'processor is used by the OS',	unity: 'ms', cat: 'times', attr: '-',	color: colours.list.black,		fcolor: colours.list.black,		gcolor: colours.list.black };

	var ipc = 		{ label: 'executing',			title: 'Executing',			desc: 'executing',				unity: '',	cat: 'locality',	attr: 'ipc',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.gGreen };
	var miss = 		{ label: 'Cache misses',		title: 'Cache misses',		desc: '',						unity: '',	cat: 'locality',	attr: 'miss',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.gRed };
	var tlbmiss = 	{ label: 'address translation',	title: 'TLB misses',		desc: 'address translation',	unity: '',	cat: 'locality',	attr: 'tlb',	color: colours.list.lGrey };
	var l1miss = 	{ label: 'loading from L2',		title: 'L1 misses',			desc: 'loading data from L2',	unity: '',	cat: 'locality',	attr: 'l1',		color: colours.list.lRed };
	var l2miss = 	{ label: 'loading from L3',		title: 'L2 misses',			desc: 'loading data from L3',	unity: '',	cat: 'locality',	attr: 'l2',		color: colours.list.eRed };
	var l3miss = 	{ label: 'loading from RAM',	title: 'L3 misses',			desc: 'loading data from RAM',	unity: '',	cat: 'locality',	attr: 'l3',		color: colours.list.dRed };
	var swapping = 	{ label: 'Swapping',			title: 'Swapping',			desc: 'hard page faults',		unity: '',	cat: 'locality',	attr: 'hpf',	color: colours.list.black };

	var sw = 		{ label: 'switches',	title: 'context switches',	desc: 'cores switching the working thread',	list: 'switches',	cat: 'switches',	attr: 's',											color: colours.list.eGrey,		fcolor: colours.list.dGrey,		gcolor: colours.list.gGrey };
	var mg = 		{ label: 'migrations',	title: 'thread migrations',	desc: 'thread migrate to another core',		list: 'migrations',	cat: 'migrations',	attr: 'm',	colors: [colours.base, colours.alt],	color: colours.list.eViolet,	fcolor: colours.list.dViolet,	gcolor: colours.list.gViolet };
	var mg_tmp = 	{ label: 'migrations',	title: 'migrations',		desc: 'migrations',												cat: 'migrations',	attr: 'm',	color2: colours.alt,	color: colours.list.eViolet,	fcolor: colours.list.dViolet,	gcolor: colours.list.gViolet };

	var l_success = { label: 'lock success',	title: 'lock success',	desc: 'number of lock acquisition success',					list: 'slocks', cat: 'locks', attr: 's',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.gGreen };
	var l_failure = { label: 'lock failure',	title: 'lock failure',	desc: 'number of lock acquisition failure',					list: 'flocks', cat: 'locks', attr: 'f',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.gRed };
	var l_wait = 	{ label: 'threads waiting',	title: 'waiting',		desc: l_wait_label,							unity: 'ms',					cat: 'times', attr: 'lw',	color: colours.list.eYellow,	fcolor: colours.list.dYellow,	gcolor: colours.list.gYellow };

	return {
		tg: {
			axis: {
				v: {
					prefix: 'half_',
					start: [50, 50],
					invert: [true, false]
				},
				limit: {
					min: function(data) { return 0;},
					mid: function(data) { return data.info.threads * data.info.timeStep;},
					max: function(data) { return 2 * data.info.threads * data.info.timeStep;},
				}
			},
			data: [capacity, readySB],
			legend: [capacity, readySB]
		},
		dl: {
			data: [miss],
			legend: [miss]
		},
		states: {
			graph : {
				v:		[readySB],
				r:		running,
				limit:	capacity
			},
			axis : {
				v:		[running, readySB],
				limit:	capacity
			},
			data : [running, ready, standBy, waiting],
			legend : [running, readySB, capacity],
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
				v:		[sw],
				limit:	{ color: colours.list.black },
			},
			data : [sw],
			legend : [sw],
			clues: [
				{ color: colours.base,	tax: 'Oversubscription',							text: 'high frequency' }
			],
			settings: [
				{ property: 'pixelGroup', value: 5, type: 'range', label: 'Group by', unit: 'pixels', min: 1, max: 15, step: 1 }/*,
				{ property: 'vMirror', value: true, type: 'flag', label: 'Vertical mirror' }*/
			]
		},
		migrations: {
			graph : {
				v:		[mg],
				limit:	{ color: colours.list.black },
			},
			data : [mg],
			legend : [mg],
			clues: [
				{ color: colours.base,	tax: 'Thread migrations',							text: 'too many migrations' },
				{ color: colours.base,	tax: 'Alternating sequential/parallel execution',	text: 'alternating period of high and low thread migrations' }
			],
			settings: [
				{ property: 'pixelGroup', value: 5, type: 'range', label: 'Group by', unit: 'pixels', min: 1, max: 15, step: 1 }/*,
				{ property: 'vMirror', value: true, type: 'flag', label: 'Vertical mirror' }*/
			]
		},
		lifetime: {
			axis : {
				x:		{ color: colours.base, colors: [colours.base, colours.alt] }
			},
			data : [mg_tmp],
			legend : [mg],
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
			legend : [ipc, tlbmiss, l1miss, l2miss, l3miss, swapping],
			clues: [],
			settings: []
		},
		counts: {
			graph : {
				v:		[l_success, l_failure],
				limit:	limit_th
			},
			data : [l_success, l_failure],
			legend : [l_success, l_failure],
			clues: [],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		contentions_old: {
			graph : {
				v:		[capacity, running, l_wait],
				limit:	limit
			},
			data : [capacity, running, waiting, l_wait],
			legend : [capacity, running, waiting, l_wait],
			clues: [],
			settings: []
		},
		contentions: {
			graph : {
				v:		[waiting],
				r:		running,
				limit:	capacity
			},
			data : [running, l_wait, waiting],
			legend : [running, capacity, waiting],
			clues: [],
			settings: [
				{ property: 'crenellate', value: false, type: 'flag', label: 'Round by core' },
				{ property: 'upsidedown', value: true, type: 'flag', label: 'Upsidedown running' }
			]
		},
	};
}]);


app.factory('widgets', ['decks', function(decks) {
	var output = {};
	
	output.cacheInvalid		= {id: 10,	file: 'generic-to-delete',	deck: null,					tag: 'cache-invalid',		title: 'Cache misses from updating shared data',				subtitle: ''};
	output.cacheMisses		= {id: 11,	file: 'cache-misses',		deck: decks.locality,		tag: 'cache-misses',		title: 'Cache misses',											subtitle: ''};
	output.coreInactivity	= {id: 5,	file: 'core-inactivity',	deck: decks.inactivity,		tag: 'core-idle',			title: 'Idle cores',											subtitle: ''};
	output.lockCounts		= {id: 12,	file: 'lock-counts',		deck: decks.counts,			tag: 'lock-counts',			title: 'Lock contentions',										subtitle: 'lock failure versus lock acquisition'};
	output.lockContentions	= {id: 9,	file: 'lock-contentions',	deck: decks.contentions,	tag: 'lock-contentions',	title: 'Lock contentions',										subtitle: 'cost and waiting time of lock acquisition'};
	output.threadPaths		= {id: 1,	file: 'generic-to-delete',	deck: null,					tag: 'thread-paths',		title: 'Single thread execution phases',						subtitle: 'alternating sequential/parallel execution'};
	output.threadChains		= {id: 2,	file: 'generic-to-delete',	deck: null,					tag: 'thread-chains',		title: 'Chains of dependencies',								subtitle: 'synchronisations and waiting between threads'};
	output.threadLifetime	= {id: 3,	file: 'thread-lifetime',	deck: decks.lifetime,		tag: 'thread-running',		title: 'Life states of threads',								subtitle: 'creation, running, moving between cores, termination'};
	output.threadLocks		= {id: 4,	file: 'generic-to-delete',	deck: null,					tag: 'thread-locks',		title: 'Waiting for locks',										subtitle: ''};
	output.threadStates		= {id: 6,	file: 'thread-states',		deck: decks.states,			tag: 'thread-states',		title: 'Potential parallelism',									subtitle: 'number of running threads compared to number of cores'};
	output.threadMigrations	= {id: 7,	file: 'thread-migrations',	deck: decks.migrations,		tag: 'thread-migrations',	title: 'Thread switching the core on which it is executing',	subtitle: 'thread migrations'};
	output.threadSwitchs	= {id: 8,	file: 'thread-switches',	deck: decks.switches,		tag: 'thread-switchs',		title: 'Core swhitching the thread it is executing',			subtitle: 'thread switches'};
	
	return output;
}]);

app.factory('categories', ['widgets', 'decks', function(widgets, decks){
	var tg = {
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks',
		graph: 'chartDashDivergence', deck: decks.tg,
		widgets: [widgets.threadStates, widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'cutlery',
		graph: null, deck: decks.sy,
		widgets: [widgets.lockCounts, widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		tag: 'ds', cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'share-alt',
		graph: null, deck: decks.ds,
		widgets: [widgets.lockContentions, widgets.cacheInvalid, widgets.cacheMisses]
	};
	var lb = {
		tag: 'lb', cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'code-fork',
		graph: null, deck: decks.ld,
		widgets: [widgets.coreInactivity, widgets.lockContentions, widgets.threadMigrations, widgets.threadStates, widgets.threadPaths, widgets.threadChains]
	};
	var dl = {
		tag: 'dl', cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'location-arrow',
		graph: 'chartDashProfile', deck: decks.dl,
		widgets: [widgets.cacheMisses]
	};
	var rs = {
		tag: 'rs', cat: 'rs', label: 'Resource sharing', title: 'Resource sharing', icon: 'exchange',
		graph: null, deck: decks.rs,
		widgets: []
	};
	var io = {
		tag: 'io', cat: 'io', label: 'Input/Output', title: 'Input/Output', icon: 'plug',
		graph: null, deck: decks.io,
		widgets: []
	};

	var output = {
		'all': [tg, sy, ds, lb, dl, rs, io],
		'tg': tg, 'sy': sy, 'ds': ds, 'lb': lb, 'dl': dl, 'rs': rs, 'io': io
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