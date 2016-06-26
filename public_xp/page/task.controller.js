xpapp.controller('TaskController',
	['$rootScope', '$scope', '$sce', '$uibModal', '$controller', '$stateParams', 'taxonomy',
	function($rootScope, $scope, $sce, $uibModal, $controller, $stateParams, taxonomy) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Controller inheritance
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope, $uibModal: $uibModal});

	// Task ID
	var taskID = $stateParams.id;

	// Form data
	$scope.tempForm = [{}, {}];
	$scope.listContextProblems = [taxonomy.all.issues.slice(), taxonomy.all.issues.slice()];
	$scope.form.aProblems = [];
	$scope.form.bProblems = [];

	// Iframe path
	$scope.path = $sce.trustAsResourceUrl('/#/xp/nofeedback-nonavbar' + $scope.step.path);
	$scope.path = $sce.trustAsResourceUrl('');
	
	// Taxonomy
	$scope.taxonomy = taxonomy;
	$scope.categories = taxonomy.all.categories;
	$scope.issues = taxonomy.all.issues;

	// Tabs
	$scope.tabIndex = 1;
	$scope.tabs = [
		{ l: 'task presentation',	t: 'Presentation' },
		{ l: 'task',				t: 'Task' },
		{ l: 'task comments',		t: 'Comments' }
	];

	// Confidences
	$scope.confidences = [
		{ v: 1, l: 'doubtful',	i: 'fa-frown-o' },
		{ v: 2, l: '←',			i: 'fa-frown-o' },
		{ v: 3, l: 'neutral',	i: 'fa-meh-o' },
		{ v: 4, l: '→',			i: 'fa-smile-o' },
		{ v: 5, l: 'confident',	i: 'fa-smile-o' }
	];
	$scope.confidencesWithNull = $scope.confidences.slice();
	$scope.confidencesWithNull.unshift({ v: 0, l: '',	i: '' });
	
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
		var provider = $scope.listContextProblems[this.pIndex];
		var tempForm = $scope.tempForm[this.pIndex];
		var list = (this.pIndex == 0) ? $scope.form.aProblems : $scope.form.bProblems;
		
		var problem = {
			i: tempForm.i.id,
			c: (tempForm.c) ? tempForm.c.v : 0
		};

		// Add the problem
		list.push(problem);

		// Remove in available problem list
		provider.splice(provider.indexOf(tempForm.i), 1);

		// Clean temp form
		tempForm.i = undefined;
		tempForm.c = undefined;
	}

	$scope.removeProblem = function() {
		var provider = $scope.listContextProblems[this.pIndex];
		var list = (this.pIndex == 0) ? $scope.form.aProblems : $scope.form.bProblems;
		
		// Remove the problem
		list.splice(this.$index, 1);
		
		// Inject in available problem list
		provider.push(taxonomy[this.problem.i]);
		provider.sort(function(a, b) { return a.id - b.id; });
	}

	$scope.upProblem = function() {
		var list = (this.pIndex == 0) ? $scope.form.aProblems : $scope.form.bProblems;

		// Cache the element
		var problem = list[this.$index];
		
		// Remove the problem
		list.splice(this.$index, 1);
		
		// Add the problem before
		list.splice(this.$index - 1, 0, problem);
	}

	$scope.downProblem = function() {
		var list = (this.pIndex == 0) ? $scope.form.aProblems : $scope.form.bProblems;

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