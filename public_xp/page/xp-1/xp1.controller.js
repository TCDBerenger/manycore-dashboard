xpapp.controller('XP1Controller', ['$controller', '$scope', '$rootScope', '$uibModal', '$sce', function($controller, $scope, $rootScope, $uibModal, $sce) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope, $uibModal: $uibModal});
	
	
	/************************************************/
	/* Constructor - Data							*/
	/************************************************/
	// Taxonomy
	$scope.taxonomy = [
		{
			t: 'Task granularity',
			i: 'sliders',
			d: '[XP.TG] In parallel programs it is often a challenge to find enough parallelism to keep the machine busy. A key focus of parallel software development is designing algorithms that expose more parallelism. However, there are overheads associated with starting, managing and switching between parallel threads. If there are too many threads, the cost of these overheads can exceed the benefits',
			s: ['oversubscription', 'task start/stop overhead', 'thread migration'],
		}, {
			t: 'Synchronisation',
			i: 'refresh',
			d: '[XP.SY] Our focus is on multicore systems with a shared-memory programming model. Where data is shared and updated some sort of synchronisation is needed to ensure that all threads get a consistent view of memory. Synchronization always causes some overhead. If the algorithm requires a large amount of synchronization, the overhead can offset much of the benefits of parallelism. Perhaps the most common synchronisation mechanism is the lock; other mechanisms include barriers, semaphores, and the atomic instructions used in so-called “lock-free” and “wait-free” data structures.',
			s: ['Low work to synchronisation ratio', 'Lock contention', 'Lock convoy', 'Badly-behaved spinlocks'],
		}, {
			t: 'Data sharing',
			i: 'exchange',
			d: '[XP.DS] Threads within a process communicate through data in shared memory. Sharing data between cores involves physically transmitting the data along wires between the cores. On shared memory computers these data transfers happen automatically through the caching hardware. However these transfers nonetheless take time, with the result that there is typically a cost to data sharing, particularly when shared variables and data structures are modified.',
			s: ['True sharing of updated data', 'Sharing of data between CPUs on NUMA systems', 'Sharing of lock data structures', 'Sharing data between distant cores'],
		}, {
			t: 'Load balancing',
			i: 'list-ol',
			d: '[XP.LB] Load balancing is the attempt to divide work evenly among the cores. Dividing the work in this way is usually, but not always, beneficial. There is an overhead in dividing work between parallel cores and it can sometimes be more efficient to not use all the available cores. Nonetheless, a poor load balance is one of the most easily understood performance problems.',
			s: ['Undersubscription', 'Alternating sequential/parallel execution', 'Chains of data dependencies, too little parallelism', 'Bad threads to cores ratio'],
		}, {
			t: 'Data locality',
			i: 'compass',
			d: '[XP.DL] This is not a specifically multicore problem, but it is impossible to talk about single or multicore performance without talking about locality. In the early 1980s a typical computer could read a value from main memory in one or two CPU cycles. However, between 1984 and 2004 processing speeds increased by around 50% per year, whereas the time to access DRAM memory fell by only 10%-15% per year. The result is that it now takes hundreds of processor cycles to read a value from main memory. This problem is often called the “memory wall”.',
			s: ['Cache Locality', 'TLB Locality', 'DRAM memory pages', 'Page faults'],
		}, {
			t: 'Resource sharing',
			i: 'sitemap',
			d: '[XP.RS] Those who are new to parallel programming often expect linear performance scaling: code running on four cores will be four times faster than on one core. There are many reasons why this is seldom true, but perhaps the most self-explanatory is that those four cores share and must compete for access to other parts of the hardware that have not been replicated four times. For example, all cores will typically share a single connection to main memory.',
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
		case 'training':	initTraining();		break;
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
			{ l: 'the experimentation',		t: 'Experiment about parallel performance' },
			{ l: 'our approach',			t: 'Explanations for our approach' },
			{ l: 'our tool',				t: 'Explanations for our tool' },
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
	/* Questions									*/
	/************************************************/
	function initTraining() {
		// Tabs
		$scope.tabIndex = 0;
		$scope.tabs = [
			{ isTool: false,	l: 'information',	t: 'Training: information' },
			{ isTool: true,							path: $sce.trustAsResourceUrl('/#/dashboard/252') },
			{ isTool: true,							path: $sce.trustAsResourceUrl('/#/detail/dl/252') },
			{ isTool: true,		l: 'explaination',	path: $sce.trustAsResourceUrl('/#/detail/dl/252') },
			{ isTool: false,						t: 'Before starting the experimentation' },
		];
	};
}]);