app.factory('colours', [function(){
	return {
		base:	'#797979',		// generic color
		plus:	'#9ED3FF',		// plus, capacity, more possible
		good:	'#8DD28A',		// correctly running
		bad:	'#D28A8D',		// Not expected
		alt:	'#7846B4'		// alternating
	};
}]);

app.factory('decks', ['colours', function(colours){

	return {
		common: [
			{ title: 'capacity',	desc: 'capacity',	unity: null,	cat: '',			attr: '',	color: colours.plus }
		],
		cycles: [
			{ title: 'running',		desc: 'running',	unity: 'ms',	cat: 'times',		attr: 'r',	color: colours.good },
			{ title: 'ready',		desc: 'ready',		unity: 'ms',	cat: 'times',		attr: 'ys',	color: colours.bad }
		],
		switches: 	[
			{ title: 'switches',	desc: 'switches',	unity: null,	cat: 'switches',	attr: 's',	color: colours.base }
		],
		migrations: [
			{ title: 'migrations',	desc: 'migrations',	unity: null,	cat: 'migrations',	attr: 'm',	color: colours.base }
		]
	};
}]);

app.factory('clues', ['colours', function(colours){
	return {
		cycles: [
			{ color: colours.bad,	tax: 'Oversubscription', 							text: 'too many threads' },
			{ color: colours.bad,	tax: 'Thread migrations', 							text: 'too many threads' },
			{ color: colours.bad,	tax: 'Bad thread to core ratio', 					text: 'too many threads' },
			{ color: colours.plus,	tax: 'Underscubscription', 							text: 'not enough threads' },
		],
		switches: 	[
			{ color: colours.base,	tax: 'Oversubscription',							text: 'high frequency' },
		],
		migrations: [
			{ color: colours.base,	tax: 'Thread migrations',							text: 'too many migrations' },
			{ color: colours.base,	tax: 'Alternating sequential/parallel execution',	text: 'alternating period of high and low thread migrations' },
		]
	};
}]);

app.factory('widgets', ['decks', 'clues', function(decks, clues){
	var output = {};
	
	output.cacheInvalid		= {id: 10,	file: 'generic-to-delete',	deck: null,				deck2: null,			clues: null,				tag: 'cache-invalid',		title: 'Cache misses from updating shared data',				subtitle: ''};
	output.cacheMisses		= {id: 11,	file: 'generic-to-delete',	deck: null,				deck2: null,			clues: null,				tag: 'cache-misses',		title: 'Cache misses',											subtitle: ''};
	output.coreInactivity	= {id: 5,	file: 'generic-to-delete',	deck: null,				deck2: null,			clues: null,				tag: 'core-idle',			title: 'Idle cores',											subtitle: ''};
	output.lockContentions	= {id: 9,	file: 'generic-to-delete',	deck: null,				deck2: null,			clues: null,				tag: 'lock-contentions',	title: 'Lock contentions',										subtitle: 'cost and waiting time of lock acquisition'};
	output.threadPaths		= {id: 1,	file: 'generic-to-delete',	deck: null,				deck2: null,			clues: null,				tag: 'thread-paths',		title: 'Single thread execution phases',						subtitle: 'alternating sequential/parallel execution'};
	output.threadChains		= {id: 2,	file: 'generic-to-delete',	deck: null,				deck2: null,			clues: null,				tag: 'thread-chains',		title: 'Chains of dependencies',								subtitle: 'synchronisations and waiting between threads'};
	output.threadLifetime	= {id: 3,	file: 'thread-lifetime',	deck: null,				deck2: null,			clues: null,				tag: 'thread-running',		title: 'Life cycles of threads',								subtitle: 'creation, running, moving between cores, termination'};
	output.threadLocks		= {id: 4,	file: 'generic-to-delete',	deck: null,				deck2: null,			clues: null,				tag: 'thread-locks',		title: 'Waiting for locks',										subtitle: ''};
	output.threadDivergence	= {id: 6,	file: 'thread-divergence',	deck: decks.cycles,		deck2: decks.common,	clues: clues.cycles,		tag: 'thread-divergence',	title: 'Potential parallelism',									subtitle: 'number of running threads compared to number of cores'};
	output.threadMigrations	= {id: 7,	file: 'thread-migrations',	deck: decks.migrations,	deck2: null,			clues: clues.switches,		tag: 'thread-migrations',	title: 'Thread switching the core on which it is executing',	subtitle: 'thread migrations'};
	output.threadSwitchs	= {id: 8,	file: 'thread-switches',	deck: decks.switches,	deck2: null,			clues: clues.migrations,	tag: 'thread-switchs',		title: 'Core swhitching the thread it is executing',			subtitle: 'thread switches'};
	
	return output;
}]);

app.factory('categories', ['widgets', function(widgets){
	var tg = {
		cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks',
		widgets: [widgets.threadSwitchs, widgets.threadMigrations, widgets.threadLifetime, widgets.threadDivergence]
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