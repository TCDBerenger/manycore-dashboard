xpapp.controller('TaskController',
	['$rootScope', '$scope', '$sce', '$uibModal', '$controller', '$stateParams', 'taxonomy', 'TYPES',
	function($rootScope, $scope, $sce, $uibModal, $controller, $stateParams, taxonomy, TYPES) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Controller inheritance
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope, $uibModal: $uibModal});
	// Tasks
	var tasks =		$rootScope.thread.tasks;
	var taskID =	$stateParams.id;
	var groupID =	$rootScope.xp.group;
	var task =		tasks[tasks.distribution[groupID - 1][taskID - 1]];

	// UI data
	$scope.taskType = task.type;

	// Form data
	$scope.form.taskID = task.id;
	$scope.form.problems = [];

	// Temp data
	$scope.tempForm = {};
	$scope.listContextProblems = taxonomy.all.issues.slice();

	// Iframe path
	$scope.path = $sce.trustAsResourceUrl('/#/xp/nofeedback-nonavbar-nounselect-noselect' + task.path);
	
	// Taxonomy
	$scope.taxonomy = taxonomy;
	$scope.categories = taxonomy.all.categories;
	$scope.issues = taxonomy.all.issues;

	// Tabs
	$scope.tabIndex = 0;
	$scope.tabs = [
			{ id: 1, l: 'task',				t: 'Task' },
	];
	if (taskID == 0 || taskID == 3) {
		$scope.tabs.unshift(
			{ id: 0,  l: 'task presentation',	t: 'Presentation' }
		)
	}
	if (taskID == 2 || taskID == 6) {
		$scope.tabs.push(
			{ id: 2,  l: 'task comments',		t: 'Comments' }
		)
	}

	// Confidences
	$scope.confidences = [
		{ v: 1, l: 'very doubtful',			smiley: '😒', i: 'fa-frown-o' },
		{ v: 2, l: 'doubtful',				smiley: '😑', i: 'fa-frown-o' },
		{ v: 3, l: 'moderately confident',	smiley: '😐', i: 'fa-meh-o' },
		{ v: 4, l: 'confident',				smiley: '😔', i: 'fa-smile-o' },
		{ v: 5, l: 'very confident',		smiley: '😉', i: 'fa-smile-o' }
	];
	$scope.confidencesWithNull = $scope.confidences.slice();
	$scope.confidencesWithNull.unshift({ v: 0, l: '',	i: '' });

	// Sections
	$scope.uiSections = [];
	if (task.type == TYPES.TASK_STANDALONE_A) {
		$scope.uiSections.push(
			{
				l: $sce.trustAsHtml('Select or list potential problem(s) for this profile:')
			}
		);
	}
	if (task.type == TYPES.TASK_COMPARISON_B) {
		$scope.uiSections.push(
			{
				l: $sce.trustAsHtml('Comparing to the Program A (first), select or list potential problem(s) for the Program B (second):')
			}
		);
	}

	
	/************************************************/
	/* Functions - Data								*/
	/************************************************/
	
	/************************************************/
	/* Functions - UI								*/
	/************************************************/
	$scope.getCategoryTitle = function(issue) {
		return issue.cat.t;
	};

	$scope.addProblem = function() {
		var provider = $scope.listContextProblems;
		var tempForm = $scope.tempForm;
		
		var problem = {
			i: tempForm.i.id,
			c: tempForm.c
		};

		// Add the problem
		$scope.form.problems.push(problem);

		// Remove in available problem list
		provider.splice(provider.indexOf(tempForm.i), 1);

		// Clean temp form
		tempForm.i = undefined;
		tempForm.c = undefined;
	}

	$scope.removeProblem = function() {
		var provider = $scope.listContextProblems;
		
		// Remove the problem
		$scope.form.problems.splice(this.$index, 1);
		
		// Inject in available problem list
		provider.push(taxonomy[this.problem.i]);
		provider.sort(function(a, b) { return a.id - b.id; });
	}

	$scope.upProblem = function() {
		var list = $scope.form.problems;

		// Cache the element
		var problem = list[this.$index];
		
		// Remove the problem
		list.splice(this.$index, 1);
		
		// Add the problem before
		list.splice(this.$index - 1, 0, problem);
	}

	$scope.downProblem = function() {
		var list = $scope.form.problems;

		// Cache the element
		var problem = list[this.$index];
		
		// Remove the problem
		list.splice(this.$index, 1);
		
		// Add the problem before
		list.splice(this.$index + 1, 0, problem);
	}
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Expose UI
	$scope.taskID = taskID;
}]);