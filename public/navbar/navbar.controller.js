app.controller('NavbarController', ['$scope', '$rootScope', '$stateParams', 'categories', function($scope, $rootScope, $stateParams, categories) {
	// Metadata
	$scope.meta = {};
	$scope.meta.cat = "";
	$scope.meta.ids = $rootScope;
	
	// Profiles
	$scope.profiles = []; //selected;
	
	// Details
	$scope.categories = categories.all;
	$scope.selectedCategory = null;
	


	/************************************************/
	/* UI - Details - Collapse						*/
	/************************************************/
	/**
	 * Details - collapse tabs
	 */
	$scope.collapseAll = function() {
		Array.prototype.forEach.call(document.getElementsByClassName('uib-tab-collapse-hide'), function(element) {
			angular.element(element).isolateScope().active = true;
		}, this);
	}


	/************************************************/
	/* Bind - Style									*/
	/************************************************/
	/**
	 * Detail
	 */
	$rootScope.$on('$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams) {
			if (toState.name == 'dashboard') {
				$scope.selectedCategory = null;
			} else {
				$scope.selectedCategory = categories[toParams.cat];
			}
		});
	
	
	
	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	
	/**
	 * Flag - detail
	 */
//	$scope.hasDetail = function() {
//		return $scope.selectedCategory != null;
//	};
}]);