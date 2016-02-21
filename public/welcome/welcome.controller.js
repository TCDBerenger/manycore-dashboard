app.controller('WelcomeController', ['$scope', function($scope) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	
	
	
	/************************************************/
	/* Functions - Data								*/
	/************************************************/
	$scope.quicklinks = [
		{ label: 'Dining philosophers (for 5 and 45 covers)', ids: '21-22' },
		{ label: 'Accounts (A and B)', ids: '6-7' },
		{ label: 'Phases  (A and B)', ids: '10-11' },
		{ label: 'Merge & Sort (serial vs. parallel)', ids: '9-8' },
		{ label: 'Particules (serial vs. parallel)', ids: '5-4' },
	]
	$scope.experiments = [
	]
	
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	
}]);