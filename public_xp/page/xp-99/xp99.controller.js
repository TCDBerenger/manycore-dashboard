xpapp.controller('XP99Controller', ['$controller', '$scope', '$rootScope', '$http', function($controller, $scope, $rootScope, $http) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	$controller('PageController', {$scope: $scope, $rootScope: $rootScope});
	
	
	/************************************************/
	/* Constructor - Data							*/
	/************************************************/
	
	// Load the code snippets
	$http.get('assets/xp-' + $rootScope.thread.id + '/src-data.json').then(function(res) {
		$scope.group = res.data.groups[$rootScope.xp.group - 1];
		$scope.groupHalf = $scope.group.length / 2;
		$scope.srcData = res.data;
		$scope.current = $scope.group[0];
	});
	
	// Load the questions on the code
	$http.get('assets/xp-' + $rootScope.thread.id + '/src-survey.json').then(function(res) {
		$scope.srcSurvey = res.data;
	});

	// Load the visualisation URLs
	$http.get('assets/xp-' + $rootScope.thread.id + '/vis-data.json').then(function(res) {
		$scope.visData = res.data;
	});

	// Load the questions on the code
	$http.get('assets/xp-' + $rootScope.thread.id + '/vis-survey.json').then(function(res) {
		$scope.visSurvey = res.data;
	});
	
	
	
	/************************************************/
	/* Functions - Data								*/
	/************************************************/
	
	/************************************************/
	/* Functions - UI								*/
	/************************************************/
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	
	
}]);