app.controller('SidebarController', ['$scope', '$rootScope', '$stateParams', 'categories', function($scope, $rootScope, $stateParams, categories) {
	// Metadata
	$scope.meta = {};
	$scope.meta.cat = "";
	
	// Profiles
	$scope.profiles = [];
	
	// Details
	$scope.categories = categories.all;
	$scope.selectedCategory = null;
	


	/************************************************/
	/* Bind - Style									*/
	/************************************************/
	/**
	 * Detail & expand
	 */
	$rootScope.$on('$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams) {
			if (toState.name == 'dashboard') {
				$scope.selectedCategory = null;
				document.getElementById('wrapper').className = '';
			} else {
				$scope.selectedCategory = categories[toParams.cat];
				document.getElementById('wrapper').className = 'min';
			}
		});
	
	
	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	
	/**
	 * Flag - detail
	 */
	$scope.hasDetail = function() {
		return $scope.selectedCategory != null;
	};
}]);