xpapp.controller('XP1Controller', ['$controller', '$scope', '$rootScope', '$http', function($controller, $scope, $rootScope, $http) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope});
	
	
	/************************************************/
	/* Constructor - Data							*/
	/************************************************/
	// Taxonomy
	$scope.taxonomy = [
		{
			t: 'Task granularity',
			i: 'sliders',
			d: 'In parallel programs it is often a challenge to find enough parallelism to keep the machine busy. A key focus of parallel software development is designing algorithms that expose more parallelism. However, there are overheads associated with starting, managing and switching between parallel threads. If there are too many threads, the cost of these overheads can exceed the benefits',
			s: ['oversubscription', 'task start/stop overhead', 'thread migration'],
		}, {
			t: 'Synchronisation',
			i: 'refresh',
			d: 'Our focus is on multicore systems with a shared-memory programming model. Where data is shared and updated some sort of synchronisation is needed to ensure that all threads get a consistent view of memory. Synchronization always causes some overhead. If the algorithm requires a large amount of synchronization, the overhead can offset much of the benefits of parallelism. Perhaps the most common synchronisation mechanism is the lock; other mechanisms include barriers, semaphores, and the atomic instructions used in so-called “lock-free” and “wait-free” data structures.',
			s: ['Low work to synchronisation ratio', 'Lock contention', 'Lock convoy', 'Badly-behaved spinlocks'],
		}, {
			t: 'Data sharing',
			i: 'exchange',
			d: 'Threads within a process communicate through data in shared memory. Sharing data between cores involves physically transmitting the data along wires between the cores. On shared memory computers these data transfers happen automatically through the caching hardware. However these transfers nonetheless take time, with the result that there is typically a cost to data sharing, particularly when shared variables and data structures are modified.',
			s: ['True sharing of updated data', 'Sharing of data between CPUs on NUMA systems', 'Sharing of lock data structures', 'Sharing data between distant cores'],
		}, {
			t: 'Load balancing',
			i: 'list-ol',
			d: 'Load balancing is the attempt to divide work evenly among the cores. Dividing the work in this way is usually, but not always, beneficial. There is an overhead in dividing work between parallel cores and it can sometimes be more efficient to not use all the available cores. Nonetheless, a poor load balance is one of the most easily understood performance problems.',
			s: ['Undersubscription', 'Alternating sequential/parallel execution', 'Chains of data dependencies, too little parallelism', 'Bad threads to cores ratio'],
		}, {
			t: 'Data locality',
			i: 'compass',
			d: 'This is not a specifically multicore problem, but it is impossible to talk about single or multicore performance without talking about locality. In the early 1980s a typical computer could read a value from main memory in one or two CPU cycles. However, between 1984 and 2004 processing speeds increased by around 50% per year, whereas the time to access DRAM memory fell by only 10%-15% per year. The result is that it now takes hundreds of processor cycles to read a value from main memory. This problem is often called the “memory wall”.',
			s: ['Cache Locality', 'TLB Locality', 'DRAM memory pages', 'Page faults'],
		}, {
			t: 'Resource sharing',
			i: 'sitemap',
			d: 'Those who are new to parallel programming often expect linear performance scaling: code running on four cores will be four times faster than on one core. There are many reasons why this is seldom true, but perhaps the most self-explanatory is that those four cores share and must compete for access to other parts of the hardware that have not been replicated four times. For example, all cores will typically share a single connection to main memory.',
			s: ['Exceeding memory bandwidth', 'Competition between threads sharing a cache', 'False data sharing'],
		}
	];
	
	// Terminology
	$scope.terminology = [
		{
			t: 'Sorftware performance',
			d: '',
			link: 'Wikipedia',
			url: 'http://',
		}, {
			t: 'Parallel performance',
			d: '',
			link: 'Wikipedia',
			url: 'http://',
		}
	];
	
	// Init data for each context
	switch ($rootScope.step.pageID) {
		case 'habits':		initHabits();		break;
		case 'info':		initInfo();			break;
		case 'start':		initStart();		break;
		case 'questions':	initQuestions();	break;
		case 'feedback':	initFeedback();		break;
	}
	
	
	/************************************************/
	/* Habits										*/
	/************************************************/
	function initHabits() {
		// Existing tools
		$scope.existingTools = [
			{ id: 'vtune',		l: 'Intel VTune'},
			{ id: 'amdca',		l: 'AMD CodeAnalyst'},
			{ id: 'valgrind',	l: 'Valgrind'},
			{ id: 'papi',		l: 'PAPI',	t: 'Performance Application Programming Interface' },
			{ id: 'gprof',		l: 'gprof',	t: 'display call graph profile data ' },
			{ id: 'gdb',		l: 'GDB',	t: 'GDB: The GNU Project Debugger' },
		];
		
		// Other tools
		$scope.form.addedTools = [];
		
		// Add another tool
		$scope.addExistingTool = function() {
			$scope.form.addedTools.push({});
		}
		// Remove another tool
		$scope.removeExistingTool = function() {
			$scope.form.addedTools.splice(this.$index, 1);
		}
	}
	
	
	/************************************************/
	/* Info											*/
	/************************************************/
	function initInfo() {
		// Tabs
		$scope.tabIndex = 0;
		$scope.tabs = [
			{ l: 'the experimentation',		t: 'Explainations about the experimentation' },
			{ l: 'parallel performance',	t: 'Explainations about parallel performance' },
			{ l: 'our approach',			t: 'Explainations about our approach' },
			{ l: 'our tool',				t: 'Explainations about our tool' },
			{								t: 'Before continue' },
		];
	};
	
	
	/************************************************/
	/* Start the XP									*/
	/************************************************/
	function initStart() {
		// Tabs
		$scope.tabIndex = 0;
		$scope.tabs = [
			{ l: 'the experiment',		t: 'Start the experiment' },
			{							t: 'Sample questions' },
		];
	};
	
	
	/************************************************/
	/* Questions									*/
	/************************************************/
	function initQuestions() {
		// Tabs
		$scope.tabIndex = 0;
		$scope.tabs = [
			{ l: 'q1',		t: 'Q1' },
			{				t: 'Q2' },
		];
	};
	
	
	/************************************************/
	/* Feedback										*/
	/************************************************/
	function initFeedback() {
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
		$scope.taxonomy.forEach(function(tax) {
			$scope.usability.push({ l: tax.t });
		}, this);
		
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
		$scope.taxonomyUI = [];
		$scope.taxonomy.forEach(function(tax) {
			$scope.taxonomyUI.push({ l: tax.t, s: tax.s });
		}, this);
	};
}]);