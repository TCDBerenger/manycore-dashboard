app.factory('widgets', [function(){
	var output = {};
	
	output.cacheInvalid		= {id: 10,	file: 'generic-to-delete',	tag: 'cache-invalid',		title: 'Cache misses from updating shared data',				subtitle: ''};
	output.cacheMisses		= {id: 11,	file: 'generic-to-delete',	tag: 'cache-misses',		title: 'Cache misses',											subtitle: ''};
	output.coreInactivity	= {id: 5,	file: 'generic-to-delete',	tag: 'core-idle',			title: 'Idle cores',											subtitle: ''};
	output.lockContentions	= {id: 9,	file: 'generic-to-delete',	tag: 'lock-contentions',	title: 'Lock contentions',										subtitle: 'cost and waiting time of lock acquisition'};
	output.threadPaths		= {id: 1,	file: 'generic-to-delete',	tag: 'thread-paths',		title: 'Single thread execution phases',						subtitle: 'alternating sequential/parallel execution'};
	output.threadChains		= {id: 2,	file: 'generic-to-delete',	tag: 'thread-chains',		title: 'Chains of dependencies',								subtitle: 'synchronisations and waiting between threads'};
	output.threadRunning	= {id: 3,	file: 'generic-to-delete',	tag: 'thread-running',		title: 'Life cycles of threads',								subtitle: 'creation, running, moving between cores, termination'};
	output.threadLocks		= {id: 4,	file: 'generic-to-delete',	tag: 'thread-locks',		title: 'Waiting for locks',										subtitle: ''};
	output.threadDivergence	= {id: 6,	file: 'generic-to-delete',	tag: 'thread-divergence',	title: 'potential parallelism',									subtitle: 'number of running threads compared to number of cores'};
	output.threadMigrations	= {id: 7,	file: 'generic-to-delete',	tag: 'thread-migrations',	title: 'Thread switching the core on which it is executing',	subtitle: 'thread migrations'};
	output.threadSwitchs	= {id: 8,	file: 'generic-to-delete',	tag: 'thread-switchs',		title: 'Core swhitching the thread it is executing',			subtitle: 'Thread switches'};
	
	return output;
}]);

app.factory('categories', ['widgets', function(widgets){
	var tg = {
		cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks',
		widgets: [widgets.threadSwitchs, widgets.threadMigrations, widgets.threadRunning, widgets.threadDivergence]
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