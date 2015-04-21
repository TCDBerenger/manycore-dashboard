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
	$scope.hasDetail = function() {
		return $scope.selectedCategory != null;
	};

	/************************************************/
	/* Functions - Browsing							*/
	/************************************************/
	
	/**
	 * Join
	 */
	$scope.encodeSelectedProfile = function() {
		var output = "";
		
		$rootScope.selectedProfiles.forEach(function(element, index, array) {
			output += (output.length > 0) ? "-" : "";
			output += element.id;
		});
		
		return output;
	};

}]);