app.controller('NavbarController', ['$scope', '$rootScope', '$stateParams', 'categories', function($scope, $rootScope, $stateParams, categories) {
	// Metadata
	$scope.meta = {};
	$scope.meta.cat = "";
	$scope.meta.ids = $rootScope;
	
	// Profiles
	$scope.profiles = []; //selected;
	
	// Dash
	$scope.isRawDashSelected = false;
	
	// Details
	$scope.categories = categories.all;
	$scope.selectedCategory = null;
	


	/************************************************/
	/* UI - Details - Collapse						*/
	/************************************************/
	/**
	 * Details - collapse tabs
	 */
	$scope.collapseAllTabs = function() {
		Array.prototype.forEach.call(document.getElementsByClassName('uib-tab-collapse-hide'), function(element) {
			angular.element(element).isolateScope().active = true;
		}, this);
	}
	
	/**
	 * Details - collapse tabs
	 */
	$scope.collapseAllAccordions = function() {
		Array.prototype.forEach.call(document.getElementsByClassName('panel-accordion'), function(element) {
			angular.element(element).isolateScope().isOpen = false;
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
			$scope.isRawDashSelected = (toState.name == 'raw');
			$scope.selectedCategory = (toState.name == 'detail') ? categories[toParams.cat] : null;
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