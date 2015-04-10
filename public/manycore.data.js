app.factory('widgets', [function(){
	var output = {};
	
	output.cacheInvalid		= {id: 10,	tag: 'cache-invalid',		title: 'Cache misses from updating shared data',				subtitle: ''};
	output.cacheMisses		= {id: 11,	tag: 'cache-misses',		title: 'Cache misses',											subtitle: ''};
	output.coreInactivity	= {id: 5,	tag: 'core-idle',			title: 'Idle cores',											subtitle: ''};
	output.lockContentions	= {id: 9,	tag: 'lock-contentions',	title: 'Lock contentions',										subtitle: 'cost and waiting time of lock acquisition'};
	output.threadPaths		= {id: 1,	tag: 'thread-paths',		title: 'Single thread execution phases',						subtitle: 'alternating sequential/parallel execution'};
	output.threadChains		= {id: 2,	tag: 'thread-chains',		title: 'Chains of dependencies',								subtitle: 'synchronisations and waiting between threads'};
	output.threadRunning	= {id: 3,	tag: 'thread-running',		title: 'Life cycles of threads',								subtitle: 'creation, running, moving between cores, termination'};
	output.threadLocks		= {id: 4,	tag: 'thread-locks',		title: 'Waiting for locks',										subtitle: ''};
	output.threadDivergence	= {id: 6,	tag: 'thread-divergence',	title: 'potential parallelism',									subtitle: 'number of running threads compared to number of cores'};
	output.threadMigrations	= {id: 7,	tag: 'thread-migrations',	title: 'Thread switching the core on which it is executing',	subtitle: 'thread migrations'};
	output.threadSwitchs	= {id: 8,	tag: 'thread-switchs',		title: 'Core swhitching the thread it is executing',			subtitle: 'Thread switches'};
	
	return output;
}]);

app.factory('details', ['widgets', function(widgets){
	var output = [
		{
			cat: 'tg', label: 'Task granularity', icon: 'tasks',
			widgets: [widgets.threadSwitchs, widgets.threadMigrations, widgets.threadRunning, widgets.threadDivergence]
		},
		{
			cat: 'sy', label: 'Synchronisation', icon: 'cutlery',
			widgets: [widgets.lockContentions, widgets.threadLocks]
		},
		{
			cat: 'ds', label: 'Data sharing', icon: 'share-alt',
			widgets: [widgets.lockContentions, widgets.cacheInvalid, widgets.cacheMisses]
		},
		{
			cat: 'lb', label: 'Load balancing', icon: 'code-fork',
			widgets: [widgets.coreInactivity, widgets.lockContentions, widgets.threadMigrations, widgets.threadDivergence, widgets.threadPaths, widgets.threadChains]
		},
		{
			cat: 'dl', label: 'Data locality', icon: 'location-arrow',
			widgets: [widgets.cacheMisses]
		},
		{
			cat: 'rs', label: 'Resource sharing', icon: 'exchange',
			widgets: []
		},
		{
			cat: 'io', label: 'Input/Output', icon: 'plug',
			widgets: []
		}
	]
	
	return output;
}]);