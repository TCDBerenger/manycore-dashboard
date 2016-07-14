xpapp.controller('FeedbackController', ['$controller', '$scope', '$rootScope', '$uibModal', function($controller, $scope, $rootScope, $uibModal) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope, $uibModal: $uibModal});
	
	
	/************************************************/
	/* Constructor - Data							*/
	/************************************************/
	// Taxonomy
	/*
	var taxonomy = [
		{
			l: 'Task granularity',
			s: ['oversubscription', 'task start/stop overhead', 'thread migration'],
		}, {
			l: 'Synchronisation',
			s: ['Low work to synchronisation ratio', 'Lock contention', 'Lock convoy', 'Badly-behaved spinlocks'],
		}, {
			l: 'Data sharing',
			s: ['True sharing of updated data', 'Sharing of data between CPUs on NUMA systems', 'Sharing of lock data structures', 'Sharing data between distant cores'],
		}, {
			l: 'Load balancing',
			s: ['Undersubscription', 'Alternating sequential/parallel execution', 'Chains of data dependencies, too little parallelism', 'Bad threads to cores ratio'],
		}, {
			l: 'Data locality',
			s: ['Cache Locality', 'TLB Locality', 'DRAM memory pages', 'Page faults'],
		}, {
			l: 'Resource sharing',
			s: ['Exceeding memory bandwidth', 'Competition between threads sharing a cache', 'False data sharing'],
		}
	];
	*/
	
	// Feedback elements
	var feedbackParts = [
		{ id: 'q1',	l: 'Tool',				t: 'I thought the tool was easy to use' },
		{ id: 'q2',	l: 'Visualisations',	t: 'I found the visualizations generally hard to understand.' },
		{ id: 'q3',	l: 'Categories',		t: 'I think it is helpful to have displays organized around potential problem categories' },
		{ id: 'q4',	l: 'Problems',			t: 'I had difficulty understanding the problems in the taxonomy' },
		{ id: 'q5',	l: 'Usefulness',		t: 'I think tools like this could be useful for working programmers' },
		{ id: 'q6',	l: 'Tasks',				t: 'I found the tasks (diagnosis of potential problems) difficult to carry out' },
		{ id: 'q7',	l: 'Usefulness',		t: 'I think tools like this would be useful for people learning about parallel programming' },
	];

	// Prepare form
	feedbackParts.forEach(function(part) {
		if (! $scope.form[part.id]) $scope.form[part.id] = {};
	}, this);
	console.log('form', $scope.form);
	
	/************************************************/
	/* Scope - Data									*/
	/************************************************/
	// Expose data
	$scope.allParts = feedbackParts;

	/*
	// Tabs
	$scope.tabIndex = 0;
	$scope.tabs = [
		{ l: 'usability',		t: 'Usability' },
		{ l: 'usefulness',		t: 'Usefulness' },
		{ l: 'taxonomy',		t: 'Taxonomy (categories)' },
		{ l: 'graphs',			t: 'Graphs (visualisations)' },
		{ l: 'comments',		t: 'Comments' },
	];
	
	// Usability UI
	$scope.usability = [
		{ l: 'Overall tool' },
		{ l: 'Dashboard (graphical)' },
		{ l: 'profiles',	isSub: true },
		{ l: 'comparison',	isSub: true },
		{ l: 'strips',		isSub: true },
		{ l: 'gauges',		isSub: true },
		{ l: 'Numerical dashboard' },
	];
	$scope.usability.push.apply($scope.usability, taxonomy);
	
	// Usefulness UI
	$scope.usefulness = [
		{ l: 'Dashboard (graphical)' },
		{ l: 'profile selection',	isSub: true },
		{ l: 'profile data',		isSub: true },
		{ l: 'duration comparison',	isSub: true },
		{ l: 'categories',			isSub: true },
		{ l: 'strips',				isSub: true },
		{ l: 'gauges',				isSub: true },
		{ l: 'Numerical dashboard' },
		{ l: 'hardware',			isSub: true },
		{ l: 'stats & categories',	isSub: true },
		{ l: 'all other parts',		isSub: true },
		{ l: 'Categories' },
		{ l: 'descriptions',			isSub: true },
		{ l: 'hardware comparison',		isSub: true },
		{ l: 'visualisations (graphs)',	isSub: true },
		{ l: 'statistics (side)',		isSub: true },
		{ l: 'legends (tab)',			isSub: true },
		{ l: 'help (tab)',				isSub: true },
		{ l: 'customisation (tab)',		isSub: true },
		{ l: 'mouse hovering',			isSub: true },
	];
	
	// Taxonomy UI
	$scope.taxonomy = [];
	$scope.taxonomy.push.apply($scope.taxonomy, taxonomy);
	
	// Graphs UI
	$scope.graphs =  [
		{ // 00
			l: 'Breakdown of cost by cause of locality misses',
			desc: '',
			c: [taxonomy[4]]
		}, { // 01
			l: 'Proportion of cache line invalidations',
			desc: 'A cache line invalidation can occur when multiple cores modify a shared memory location',
			c: [taxonomy[2], taxonomy[5]]
		}, { // 02
			l: 'Proportion of locality misses',
			desc: 'Data cache misses as a proportion of instructions executed',
			c: [taxonomy[2], taxonomy[4], taxonomy[5]]
		}, { // 03
			l: 'Remote memory access by core',
			desc: 'Memory bandwidth',
			c: [taxonomy[2], taxonomy[5]]
		}, { // 04
			l: 'Idle cores',
			desc: 'Times that cores are idle',
			c: [taxonomy[3]]
		}, { // 05
			l: 'Breakdown of cache line invalidations by core',
			desc: '',
			c: [taxonomy[2], taxonomy[5]]
		}, { // 06
			l: 'Execution phases',
			desc: 'phase of execution (sequential or parallel)',
			c: [taxonomy[3]]
		}, { // 07
			l: 'Lock contentions',
			desc: 'Locking with and without contention',
			c: [taxonomy[1], taxonomy[5]]
		}, { // 08
			l: 'Time waiting for a lock',
			desc: '',
			c: [taxonomy[1], taxonomy[2]]
		}, { // 09
			l: 'Remote memory access',
			desc: 'Memory bandwidth',
			c: [taxonomy[2], taxonomy[5]]
		}, { // 10
			l: 'Chains of dependencies on locks',
			desc: 'synchronisations and waiting between threads',
			c: [taxonomy[2], taxonomy[3]]
		}, { // 11a
			l: 'Migrations by thread (rate)',
			desc: 'creation, running, moving between cores, termination',
			c: [taxonomy[0]]
		}, { // 11b
			l: 'Migrations by thread (events)',
			desc: 'creation, running, moving between cores, termination',
			c: [taxonomy[0]]
		}, { // 11c
			l: 'Migrations by thread (core affinity)',
			desc: 'creation, running, moving between cores, termination',
			c: [taxonomy[0]]
		}, { // 12
			l: 'Time each thread spends waiting for locks',
			desc: '',
			c: [taxonomy[1]]
		}, { // 13
			l: 'Rate of thread migrations',
			desc: 'thread switching the core on which it is executing',
			c: [taxonomy[0], taxonomy[3]]
		}, { // 14
			l: 'Breakdown of thread states compared to number of cores',
			desc: 'number of threads compared to number of cores',
			c: [taxonomy[0]]
		}, { // 15
			l: 'Breakdown of thread states compared to number of cores',
			desc: 'number of threads compared to number of cores',
			c: [taxonomy[3]]
		}, { // 16
			l: 'Core switching the thread it is executing',
			desc: 'thread switches',
			c: [taxonomy[0]]
		},
	];
	$scope.graphs.forEach(function(element) {
		element.p = [];
		element.c.forEach(function(tax, index_tax) {
			tax.s.forEach(function(issue, index_issue) {
				element.p.push({
					id: (index_tax + 1) + '_' + (index_issue + 1),
					l: issue + ' (' + tax.l + ')' });
			}, this);
		}, this);
	}, this);
	
	// Comments UI
	$scope.comments = [
		{ l: 'Overall appreciation' },
		{ l: 'Unexpected or surprising elements' },
		{ l: 'Expected (predictable) things' },
		{ l: 'Missing features' },
		{ l: 'Comments' },
	];
	*/
}]);