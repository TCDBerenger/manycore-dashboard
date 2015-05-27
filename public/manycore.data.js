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

	return {
		tg: {
			graph: {

			},
			data: [running, ready]
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
			data : [
				{ title: 'Swapping',			desc: 'hard page faults',	unity: '',	cat: 'locality',	attr: 'hpf',	color: colours.list.black },
				{ title: 'loading from RAM',	desc: 'L3 misses',			unity: '',	cat: 'locality',	attr: 'l3',		color: colours.list.dRed },
				{ title: 'loading from L3',		desc: 'L2 misses',			unity: '',	cat: 'locality',	attr: 'l2',		color: colours.list.eRed },
				{ title: 'loading from L2',		desc: 'L1 misses',			unity: '',	cat: 'locality',	attr: 'l1',		color: colours.list.lRed },
				{ title: 'address translation',	desc: 'TLB',				unity: '',	cat: 'locality',	attr: 'tlb',	color: colours.list.lGrey },
				{ title: 'executing',			desc: 'executing',			unity: '',	cat: 'locality',	attr: 'ipc',	color: colours.good }
			],
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
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks', deck: decks.tg,
		widgets: [widgets.threadDivergence, widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'cutlery', deck: null,
		widgets: [widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		tag: 'ds', cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'share-alt', deck: null,
		widgets: [widgets.lockContentions, widgets.cacheInvalid, widgets.cacheMisses]
	};
	var lb = {
		tag: 'lb', cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'code-fork', deck: null,
		widgets: [widgets.coreInactivity, widgets.lockContentions, widgets.threadMigrations, widgets.threadDivergence, widgets.threadPaths, widgets.threadChains]
	};
	var dl = {
		tag: 'dl', cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'location-arrow', deck: null,
		widgets: [widgets.cacheMisses]
	};
	var rs = {
		tag: 'rs', cat: 'rs', label: 'Resource sharing', title: 'Resource sharing', icon: 'exchange', deck: null,
		widgets: []
	};
	var io = {
		tag: 'io', cat: 'io', label: 'Input/Output', title: 'Input/Output', icon: 'plug', deck: null,
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
	function labelPercent(dp, getter) {return Math.round(getter(dp) * 100) + '%'; }

	function timeRunning(dp) {		return dp.stats.r / (dp.info.cores * dp.info.duration); }
	function timeAvailable(dp) {	return ((dp.info.cores * dp.info.duration) - dp.stats.r) / (dp.info.cores * dp.info.duration); }
	function timeWaiting(dp) {		return (dp.stats.y + dp.stats.b) / (dp.info.cores * dp.info.duration); }

	function evCapacity(dp) {	return 35 * dp.info.duration; }
	function evSwitches(dp) {	return dp.stats.s / evCapacity(dp); }
	function evMigrations(dp) {	return dp.stats.m / evCapacity(dp); }

	function cmIPC(dp) { return dp.stats.locality.ipc; }
	function cmMisses(dp) { return dp.stats.locality.tlb + dp.stats.locality.l1 + dp.stats.locality.l2 + dp.stats.locality.l3 + dp.stats.locality.hpf; }
	function cmTotal(dp) { return cmIPC(dp) + cmMisses(dp); }

	function percentIPC(dp) { return cmIPC(dp) / cmTotal(dp); }
	function percentMisses(dp) { return cmMisses(dp) / cmTotal(dp); }


	//
	//	Indicators
	//
	var indic_p = {
		title:	'Parallelism',
		icon:	'info-circle',
		graph:	'widgetDashTrack',
		links:	[categories.tg, categories.lb],
		deck: [[{
				t: 'running',
				l: function(dp) { return labelPercent(dp, timeRunning); },
				v: timeRunning,
				c: colours.list.dGreen,
				b: colours.list.lGreen
			}, {
				t: 'unused ressources',
				l: function(dp) { return labelPercent(dp, timeAvailable); },
				v: timeAvailable,
				c: colours.list.dBlue,
				b: colours.list.lBlue
			}, {
				t: 'waiting',
				l: function(dp) { return labelPercent(dp, timeWaiting); },
				v: timeWaiting,
				c: colours.list.dRed,
				b: colours.list.lRed
			}], []]
	};
	
	var indic_b = {
		title:	'Core balancing',
		icon:	'info-circle',
		graph:	'widgetDashTrack',
		links:	[categories.tg, categories.lb],
		deck: [[{
					t: 'context switches',
				l: function(dp) { return labelPercent(dp, evSwitches); },
				v: function(dp) { return Math.min(evSwitches(dp) * 10, 1); },	// Focus on 10 %
				c: colours.list.dGrey,
				b: colours.list.lGrey
			}, {
				t: 'migrations',
				l: function(dp) { return labelPercent(dp, evMigrations); },
				v: function(dp) { return Math.min(evMigrations(dp) * 20, 1); },	// Focus on 5 %
				c: colours.list.dViolet,
				b: colours.list.lViolet
			}], []]
	};
	
	var indic_m = {
		title:	'Cache misses',
		icon:	'info-circle',
		graph:	'widgetDashTrack',
		links:	[categories.dl],
		deck: [[{
				t: 'executing',
				l: function(dp) { return labelPercent(dp, percentIPC); },
				v: percentIPC,
				c: colours.list.dGreen,
				b: colours.list.lGreen
			}, {
				t: 'cache misses',
				l: function(dp) { return labelPercent(dp, percentMisses); },
				v: percentMisses,
				c: colours.list.dRed,
				b: colours.list.lRed
			}], []]
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