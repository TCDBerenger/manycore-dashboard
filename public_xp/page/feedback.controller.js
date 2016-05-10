xpapp.controller('FeedbackController', ['$controller', '$scope', '$rootScope', '$http', function($controller, $scope, $rootScope, $http) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope});
	
	
	/************************************************/
	/* Constructor - Data							*/
	/************************************************/
	// Taxonomy
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
	
	
	/************************************************/
	/* Scope - Data									*/
	/************************************************/
	// Tabs
	$scope.tabIndex = 0;
	$scope.tabs = [
		{ l: 'usability',		t: 'Usability' },
		{ l: 'usefulness',		t: 'Usefulness' },
		{ l: 'taxonomy',		t: 'Taxonomy' },
		{ l: 'charts',			t: 'Charts' },
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
}]);