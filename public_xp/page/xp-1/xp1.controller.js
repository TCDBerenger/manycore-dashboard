xpapp.controller('XP1Controller',
	['$controller', '$scope', '$rootScope', '$uibModal', '$sce', 'taxonomy',
	function($controller, $scope, $rootScope, $uibModal, $sce, taxonomy) {

	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope, $uibModal: $uibModal});
	
	
	/************************************************/
	/* Constructor - Data							*/
	/************************************************/
	// Taxonomy
	$scope.taxonomy = taxonomy.all.categories;
	
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
			{ isTool: false,	t: 'Example' },
			{ isTool: true,		path: $sce.trustAsResourceUrl('/#/xp/nofeedback-nonavbar-nounselect-noselect/dashboard/252') },
			{ isTool: true,		path: $sce.trustAsResourceUrl('/#/xp/nofeedback-nonavbar-nounselect-noselect/detail/dl/252') },
		];
	};
}]);