xpapp.controller('PageController', ['$scope', '$rootScope', function($scope, $rootScope) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Form data
	$scope.form = $rootScope.step.form;
	
	
	/************************************************/
	/* Functions - Data								*/
	/************************************************/
	
	/************************************************/
	/* Functions - UI								*/
	/************************************************/
	$scope.allRequiredFileds = function() {
		var canContinue = true;
		$rootScope.step.required.forEach(function(field) {
			canContinue = canContinue && !! $scope.form[field];
		});
		return canContinue; 
	}
	
	/**
	 * Action - Next tab
	 */
	$rootScope.actionNextTab = function() {
		if ($scope.tabIndex == $scope.tabs.length - 1) {
			$rootScope.actionNext();
		} else {
			$scope.tabIndex++;
		}
	}
	
	/**
	 * Action - Previous tab
	 */
	$rootScope.actionPreviousTab = function() {
		if ($scope.tabIndex != 0) {
			$scope.tabIndex--;
		}
	}
	
	/**
	 * Could - Previous tab
	 */
	$rootScope.couldPreviousTab = function() {
		return $scope.tabIndex != 0;
	}
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
}]);