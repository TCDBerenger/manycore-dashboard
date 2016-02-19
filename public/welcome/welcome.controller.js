app.controller('WelcomeController', ['$cookies', '$scope', function($cookies, $scope) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	
	
	
	/************************************************/
	/* Functions - Data								*/
	/************************************************/
	$scope.experiments = [
		{ label: 'Dining philosophers', ids: '21-22' },
		{ label: 'Account A and B', ids: '6-7' },
		{ label: 'Phase A and B', ids: '10-11' },
		{ label: 'Merge/Sort serial vs. parallel', ids: '9-8' },
		{ label: 'Particule serial vs. parallel', ids: '5-4' },
	]
	
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	
}]);