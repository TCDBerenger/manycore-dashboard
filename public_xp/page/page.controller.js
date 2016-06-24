xpapp.controller('PageController', ['$scope', '$rootScope', '$uibModal', function($scope, $rootScope, $uibModal) {
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
	
	/************************************************/
	/* Functions - UI - Tab							*/
	/************************************************/
	$scope.allRequiredFileds = function() {
		var canContinue = true;
		if ($rootScope.step.required)
			$rootScope.step.required.forEach(function(field) {
				canContinue = canContinue && !! $scope.form[field];
			});
		return canContinue; 
	}
	
	/**
	 * Action - Next tab
	 */
	$scope.actionNextTab = function() {
		if ($scope.tabIndex == $scope.tabs.length - 1) {
			$rootScope.actionNext();
		} else {
			$scope.tabIndex++;
		}
	}
	
	/**
	 * Action - Previous tab
	 */
	$scope.actionPreviousTab = function() {
		if ($scope.tabIndex != 0) {
			$scope.tabIndex--;
		}
	}
	
	/**
	 * Could - Previous tab
	 */
	$scope.couldPreviousTab = function() {
		return $scope.tabIndex != 0;
	}
	
	/************************************************/
	/* Functions - UI - Sub tab						*/
	/************************************************/
	/**
	 * Style - Is sub tab active
	 */
	$scope.isSubTabActive = function(variable, index) {
		if (! $scope.hasOwnProperty(variable + 'Index')) $scope[variable + 'Index'] = 0;
		return (index != undefined) ? $scope[variable + 'Index'] == index : $scope[variable + 'Index'] == this.$index;
	}
	
	/**
	 * Action - Select the subtab
	 */
	$scope.selectSubTabActive = function(variable) {
		$scope[variable + 'Index'] = this.$index;
	}
	
	/************************************************/
	/* Functions - UI - Modal						*/
	/************************************************/
	$scope.openModal = function (template, okHandle, koHandle) {
		var modalInstance = $uibModal.open({
			templateUrl: template,
			controller: function ($scope, $uibModalInstance) {
				$scope.ok = function () {
					$uibModalInstance.close();
					if (okHandle) okHandle();
				};
				$scope.cancel = function () {
					$uibModalInstance.dismiss();
					if (koHandle) koHandle();
				};
			}
		});
	};
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
}]);