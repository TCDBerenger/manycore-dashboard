xpapp.controller('NavbarController', ['$scope', '$rootScope', '$stateParams', function($scope, $rootScope, $stateParams) {
	/************************************************/
	/* Controller - Init							*/
	/************************************************/
	$scope.xp = $rootScope.xp;
	$scope.errors = $rootScope.network.errors;
	
	
	/************************************************/
	/* Functions - UI								*/
	/************************************************/
	/**
	 * XP - is some experiment is currently running
	 */
	$scope.isXPset = function() {
		return $rootScope.isXPset;
	}
	/**
	 * XP - could display next button
	 */
	$scope.hasNext = function() {
		return $rootScope.step && $rootScope.step.nextInSidebar;
	}
	
	/**
	 * XP - get steps
	 */
	$scope.getSteps = function() {
		return ($rootScope.thread && $rootScope.thread.steps) ? $rootScope.thread.steps : [];
	}
	
	/**
	 * XP - Style - Step active
	 */
	$scope.isStepActive = function() {
		return this.$index <= $rootScope.xp.step;
	}
	
	/**
	 * XP - Style - Step disabled
	 */
	$scope.isStepDisabled = function() {
		return this.$index > $rootScope.xp.step;
	}
	
	/**
	 * Network - is some error occurs during the server exchange
	 */
	$scope.hasNetworkError = function() {
		return $rootScope.network.hasErrors;
	}
	
	/************************************************/
	/* Controller - State handling					*/
	/************************************************/
	
}]);