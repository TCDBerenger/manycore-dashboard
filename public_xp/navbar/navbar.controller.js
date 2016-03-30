xpapp.controller('NavbarController', ['$scope', '$rootScope', '$stateParams', function($scope, $rootScope, $stateParams) {
	/************************************************/
	/* Controller - Init							*/
	/************************************************/
	$scope.xp = $rootScope.xp;
	$scope.thread = $rootScope.thread;
	
	
	/************************************************/
	/* Functions - UI								*/
	/************************************************/
	/**
	 * XP - is some experiment is currently running
	 */
	$scope.isXPset = function isXPset() {
		return $rootScope.isXPset;
	}
	
	/************************************************/
	/* Controller - State handling					*/
	/************************************************/
	
}]);