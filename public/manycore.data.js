app.factory('chartColours', [function(){
	return {
		generic:	'#797979',
		available:	'#9ED3FF',
		good:		'#8DD28A',
		bad:		'#D28A8D'
	};
}]);

app.factory('chartSets', ['chartColours', function(chartColours){

	return {
		common: [
			{ title: 'capacity',	desc: 'capacity',	unity: null,	cat: '',			attr: '',	color: chartColours.available }
		],
		cycles: [
			{ title: 'running',		desc: 'running',	unity: 'ms',	cat: 'times',		attr: 'r',	color: chartColours.good },
			{ title: 'ready',		desc: 'ready',		unity: 'ms',	cat: 'times',		attr: 'ys',	color: chartColours.bad }
		],
		switches: 	[
			{ title: 'switches',	desc: 'switches',	unity: null,	cat: 'switches',	attr: 's',	color: chartColours.generic }
		],
		migrations: [
			{ title: 'migrations',	desc: 'migrations',	unity: null,	cat: 'migrations',	attr: 'm',	color: chartColours.generic }
		]
	};
}]);

app.factory('clues', ['chartColours', function(chartColours){
	return {
		cycles: [
			{ color: chartColours.bad,		tax: 'Oversubscription', 							text: 'too many threads' },
			{ color: chartColours.bad,		tax: 'Thread migrations', 							text: 'too many threads' },
			{ color: chartColours.bad,		tax: 'Bad thread to core ratio', 					text: 'too many threads' },
			{ color: chartColours.available,	tax: 'Underscubscription', 							text: 'not enough threads' },
		],
		switches: 	[
			{ color: chartColours.generic,	tax: 'Oversubscription',							text: 'high frequency' },
		],
		migrations: [
			{ color: chartColours.generic,	tax: 'Thread migrations',							text: 'too many migrations' },
			{ color: chartColours.generic,	tax: 'Alternating sequential/parallel execution',	text: 'alternating period of high and low thread migrations' },
		]
	};
}]);

app.factory('widgets', ['chartSets', 'clues', function(chartSets, clues){
	var output = {};
	
	output.cacheInvalid		= {id: 10,	file: 'generic-to-delete',	set: null,					set2: null,				clues: clues.x,				tag: 'cache-invalid',		title: 'Cache misses from updating shared data',				subtitle: ''};
	output.cacheMisses		= {id: 11,	file: 'generic-to-delete',	set: null,					set2: null,				clues: clues.x,				tag: 'cache-misses',		title: 'Cache misses',											subtitle: ''};
	output.coreInactivity	= {id: 5,	file: 'generic-to-delete',	set: null,					set2: null,				clues: clues.x,				tag: 'core-idle',			title: 'Idle cores',											subtitle: ''};
	output.lockContentions	= {id: 9,	file: 'generic-to-delete',	set: null,					set2: null,				clues: clues.x,				tag: 'lock-contentions',	title: 'Lock contentions',										subtitle: 'cost and waiting time of lock acquisition'};
	output.threadPaths		= {id: 1,	file: 'generic-to-delete',	set: null,					set2: null,				clues: clues.x,				tag: 'thread-paths',		title: 'Single thread execution phases',						subtitle: 'alternating sequential/parallel execution'};
	output.threadChains		= {id: 2,	file: 'generic-to-delete',	set: null,					set2: null,				clues: clues.x,				tag: 'thread-chains',		title: 'Chains of dependencies',								subtitle: 'synchronisations and waiting between threads'};
	output.threadLifetime	= {id: 3,	file: 'thread-lifetime',	set: null,					set2: null,				clues: clues.x,				tag: 'thread-running',		title: 'Life cycles of threads',								subtitle: 'creation, running, moving between cores, termination'};
	output.threadLocks		= {id: 4,	file: 'generic-to-delete',	set: null,					set2: null,				clues: clues.x,				tag: 'thread-locks',		title: 'Waiting for locks',										subtitle: ''};
	output.threadDivergence	= {id: 6,	file: 'thread-divergence',	set: chartSets.cycles,		set2: chartSets.common,	clues: clues.cycles,		tag: 'thread-divergence',	title: 'Potential parallelism',									subtitle: 'number of running threads compared to number of cores'};
	output.threadMigrations	= {id: 7,	file: 'thread-migrations',	set: chartSets.migrations,	set2: null,				clues: clues.switches,		tag: 'thread-migrations',	title: 'Thread switching the core on which it is executing',	subtitle: 'thread migrations'};
	output.threadSwitchs	= {id: 8,	file: 'thread-switches',	set: chartSets.switches,	set2: null,				clues: clues.migrations,	tag: 'thread-switchs',		title: 'Core swhitching the thread it is executing',			subtitle: 'thread switches'};
	
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