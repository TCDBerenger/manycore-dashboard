xpapp.controller('TaskController',
	['$rootScope', '$scope', '$sce', '$uibModal', '$controller', '$stateParams',
	function($rootScope, $scope, $sce, $uibModal, $controller, $stateParams) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Controller inheritance
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope, $uibModal: $uibModal});

	// Task ID
	var taskID = $stateParams.id;

	// Form data
	$scope.path = $sce.trustAsResourceUrl('/#/xp/nofeedback-nonavbar' + $scope.step.path);
	
	// Tabs
	$scope.tabIndex = 0;
	$scope.tabs = [
		{ l: 'task presentation',	t: 'Presentation' },
		{ l: 'task',				t: 'Task' },
		{ l: 'task comments',		t: 'Comments' }
	];
	
	
	/************************************************/
	/* Functions - Data								*/
	/************************************************/
	
	/************************************************/
	/* Functions - UI								*/
	/************************************************/
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Expose UI
	$scope.taskID = taskID;
}]);