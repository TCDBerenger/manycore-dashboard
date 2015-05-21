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

	return {
		cycles: {
			axis : {
				limit: { color: colours.list.dBlue, background: colours.list.eBlue }
			},
			data : [
				{ title: 'running',		desc: 'running',	unity: 'ms',	cat: 'times',		attr: 'r',	color: colours.good },
				{ title: 'ready',		desc: 'ready',		unity: 'ms',	cat: 'times',		attr: 'yb',	color: colours.bad }
			],
			legend : [
				{ title: 'threads running',		desc: '',	color: colours.good },
				{ title: 'threads ready',		desc: '',	color: colours.bad },
				{ title: 'CPU capacity',		desc: '',	color: colours.list.dBlue }
			],
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

app.factory('categories', ['widgets', function(widgets){
	var tg = {
		cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks',
		widgets: [widgets.threadDivergence, widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime]
	};
	var sy = {
		cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'cutlery',
		widgets: [widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'share-alt',
		widgets: [widgets.lockContentions, widgets.cacheInvalid, widgets.cacheMisses]
	};
	var lb = {
		cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'code-fork',
		widgets: [widgets.coreInactivity, widgets.lockContentions, widgets.threadMigrations, widgets.threadDivergence, widgets.threadPaths, widgets.threadChains]
	};
	var dl = {
		cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'location-arrow',
		widgets: [widgets.cacheMisses]
	};
	var rs = {
		cat: 'rs', label: 'Resource sharing', title: 'Resource sharing', icon: 'exchange',
		widgets: []
	};
	var io = {
		cat: 'io', label: 'Input/Output', title: 'Input/Output', icon: 'plug',
		widgets: []
	};

	var output = {
		'all': [tg, sy, ds, lb, dl, rs, io],
		'tg': tg, 'sy': sy, 'ds': ds, 'lb': lb, 'dl': dl, 'rs': rs, 'io': io
	};
	
	return output;
}]);