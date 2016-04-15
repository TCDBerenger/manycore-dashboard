xpapp.controller('XP1Controller', ['$controller', '$scope', '$rootScope', '$http', function($controller, $scope, $rootScope, $http) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope});
	
	switch ($rootScope.step.pageID) {
		case 'habits':	initHabits();	break;
		case 'info':	initInfo();	break;
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
	/* Info										*/
	/************************************************/
	function initInfo() {
		// Tabs
		$scope.tabIndex = 0;
		$scope.tabs = [
			'the experimentations',
			'our tool',
			'how to use it',
		];
	}
}]);