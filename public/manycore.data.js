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
	var running = 	{ label: 'running',	title: 'threads running',	desc: ' ',	unity: 'ms', cat: 'times', attr: 'r',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.gGreen };
	var ready = 	{ label: 'ready',	title: 'threads ready',		desc: ' ',	unity: 'ms', cat: 'times', attr: 'yb',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.gRed };
	var capacity = 	{ label: 'ready',	title: 'CPU capacity',		desc: ' ',	unity: 'ms', cat: null, attr: null,		color: colours.list.eBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.gBlue };

	var ipc = 		{ label: 'executing',		title: 'executing',				desc: 'executing',			unity: '',	cat: 'locality',	attr: 'ipc',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.gGreen };
	var ipc_blank = { label: 'executing',		title: 'executing',				desc: 'executing',			unity: '',	cat: 'locality',	attr: 'ipc',	color: colours.list.black,		fcolor: colours.list.black,		gcolor: colours.list.black };
	var miss = 		{ label: 'cache misses',	title: 'Cache misses',			desc: '',					unity: '',	cat: 'locality',	attr: 'miss',	color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.gRed };
	var tlbmiss = 	{ label: 'TLB misses',		title: 'address translation',	desc: 'TLB',				unity: '',	cat: 'locality',	attr: 'tlb',	color: colours.list.lGrey };
	var l1miss = 	{ label: 'L1 misses',		title: 'loading from L2',		desc: 'L1 misses',			unity: '',	cat: 'locality',	attr: 'l1',		color: colours.list.lRed };
	var l2miss = 	{ label: 'L2 misses',		title: 'loading from L3',		desc: 'L2 misses',			unity: '',	cat: 'locality',	attr: 'l2',		color: colours.list.eRed };
	var l3miss = 	{ label: 'L3 misses',		title: 'loading from RAM',		desc: 'L3 misses',			unity: '',	cat: 'locality',	attr: 'l3',		color: colours.list.dRed };
	var swapping = 	{ label: 'Swapping',		title: 'Swapping',				desc: 'hard page faults',	unity: '',	cat: 'locality',	attr: 'hpf',	color: colours.list.black };


	return {
		tg: {
			axis: {
				limit: {
					min: function(data) { return 0;},
					mid: function(data) { return data.info.cores * data.info.timeStep;},
					max: function(data) { return 2 * data.info.cores * data.info.timeStep;},
				}
			},
			data: [running, ready],
			legend: [running, ready]
		},
		dl: {
			data: [miss],// , ipc
			legend: [miss] // , ipc_blank
		},
		cycles: {
			axis : {
				limit: { color: colours.list.dBlue, background: colours.list.eBlue }
			},
			data : [running, ready],
			legend : [running, ready, capacity],
			clues: [
				{ color: colours.bad,	tax: 'Oversubscription', 							text: 'too many threads' },
				{ color: colours.bad,	tax: 'Thread migrations', 							text: 'too many threads' },
				{ color: colours.bad,	tax: 'Bad thread to core ratio', 					text: 'too many threads' },
				{ color: colours.plus,	tax: 'Underscubscription', 							text: 'not enough threads' }
			]
		},
		switches: {
			axis : {
				limit:	{ color: colours.list.black },
				x:		{ color: colours.list.dGrey, colors: [colours.list.eGrey, colours.list.dGrey, colours.list.eRed, colours.list.dRed] }
			},
			data : [
				{ title: 'switches',	desc: 'switches',	unity: null,	cat: 'switches',	attr: 's',	color: colours.base }
			],
			legend : [
			],
			clues: [
				{ color: colours.base,	tax: 'Oversubscription',							text: 'high frequency' }
			]
		},
		migrations: {
			axis : {
				limit:	{ color: colours.list.black },
				x:		{ color: colours.list.dGrey, colors: [colours.list.eGrey, colours.list.dGrey, colours.list.eRed, colours.list.dRed] }
			},
			data : [
				{ title: 'migrations',	desc: 'migrations',	unity: null,	cat: 'migrations',	attr: 'm',	color: colours.base }
			],
			legend : [
			],
			clues: [
				{ color: colours.base,	tax: 'Thread migrations',							text: 'too many migrations' },
				{ color: colours.base,	tax: 'Alternating sequential/parallel execution',	text: 'alternating period of high and low thread migrations' }
			]
		},
		lifetime: {
			axis : {
				x:		{ color: colours.base, colors: [colours.base, colours.alt] }
			},
			data : [
				{ title: 'migrations',	desc: 'migrations',	unity: null,	cat: 'migrations',	attr: 'm',	color: colours.base,	color2: colours.alt }
			],
			legend : [
			],
			clues: [
				{ color: colours.unkn,	tax: 'Task start/stop overhead',					text: 'too many creations' },
				{ color: colours.alt,	tax: 'Oversubscription',							text: 'too many threads' },
				{ color: colours.base,	tax: 'Thread migrations',							text: 'too many threads' },
				{ color: colours.alt,	tax: 'Thread migrations',							text: 'too many migrations' },
				{ color: colours.unkn,	tax: 'Task start/stop overhead',					text: 'too short lifetime' }
			]
		},
		locality: {
			axis : {
				x:		{ colors: [colours.good, colours.list.lGrey, colours.list.lRed, colours.list.eRed, colours.list.dRed, colours.list.black] }
			},
			data : [ipc, tlbmiss, l1miss, l2miss, l3miss, swapping],
			legend : [
			],
			clues: [
			]
		}
	};
}]);


app.factory('widgets', ['decks', function(decks) {
	var output = {};
	
	output.cacheInvalid		= {id: 10,	file: 'generic-to-delete',	deck: null,					tag: 'cache-invalid',		title: 'Cache misses from updating shared data',				subtitle: ''};
	output.cacheMisses		= {id: 11,	file: 'cache-misses',		deck: decks.locality,		tag: 'cache-misses',		title: 'Cache misses',											subtitle: ''};
	output.coreInactivity	= {id: 5,	file: 'generic-to-delete',	deck: null,					tag: 'core-idle',			title: 'Idle cores',											subtitle: ''};
	output.lockContentions	= {id: 9,	file: 'generic-to-delete',	deck: null,					tag: 'lock-contentions',	title: 'Lock contentions',										subtitle: 'cost and waiting time of lock acquisition'};
	output.threadPaths		= {id: 1,	file: 'generic-to-delete',	deck: null,					tag: 'thread-paths',		title: 'Single thread execution phases',						subtitle: 'alternating sequential/parallel execution'};
	output.threadChains		= {id: 2,	file: 'generic-to-delete',	deck: null,					tag: 'thread-chains',		title: 'Chains of dependencies',								subtitle: 'synchronisations and waiting between threads'};
	output.threadLifetime	= {id: 3,	file: 'thread-lifetime',	deck: decks.lifetime,		tag: 'thread-running',		title: 'Life cycles of threads',								subtitle: 'creation, running, moving between cores, termination'};
	output.threadLocks		= {id: 4,	file: 'generic-to-delete',	deck: null,					tag: 'thread-locks',		title: 'Waiting for locks',										subtitle: ''};
	output.threadDivergence	= {id: 6,	file: 'thread-divergence',	deck: decks.cycles,			tag: 'thread-divergence',	title: 'Potential parallelism',									subtitle: 'number of running threads compared to number of cores'};
	output.threadMigrations	= {id: 7,	file: 'thread-migrations',	deck: decks.migrations,		tag: 'thread-migrations',	title: 'Thread switching the core on which it is executing',	subtitle: 'thread migrations'};
	output.threadSwitchs	= {id: 8,	file: 'thread-switches',	deck: decks.switches,		tag: 'thread-switchs',		title: 'Core swhitching the thread it is executing',			subtitle: 'thread switches'};
	
	return output;
}]);

app.factory('categories', ['widgets', 'decks', function(widgets, decks){
	var tg = {
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks',
		graph: 'chartDashDivergence', deck: decks.tg,
		widgets: [widgets.threadDivergence, widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'cutlery',
		graph: null, deck: decks.sy,
		widgets: [widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		tag: 'ds', cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'share-alt',
		graph: null, deck: decks.ds,
		widgets: [widgets.lockContentions, widgets.cacheInvalid, widgets.cacheMisses]
	};
	var lb = {
		tag: 'lb', cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'code-fork',
		graph: null, deck: decks.ld,
		widgets: [widgets.coreInactivity, widgets.lockContentions, widgets.threadMigrations, widgets.threadDivergence, widgets.threadPaths, widgets.threadChains]
	};
	var dl = {
		tag: 'dl', cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'location-arrow',
		graph: 'chartDashStack', deck: decks.dl,
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

	function timeRunning(dp) {		return dp.stats.r / (dp.info.cores * dp.info.duration); }
	function timeAvailable(dp) {	return ((dp.info.cores * dp.info.duration) - dp.stats.r) / (dp.info.cores * dp.info.duration); }
	function timeWaiting(dp) {		return (dp.stats.y + dp.stats.b) / (dp.info.cores * dp.info.duration); }

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