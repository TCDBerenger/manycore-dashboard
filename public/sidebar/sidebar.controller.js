app.controller('SidebarController', ['$scope', '$rootScope', '$stateParams', 'details', function($scope, $rootScope, $stateParams, details) {
	// Metadata
	$scope.meta = {};
	$scope.meta.cat = "";
	$scope.meta.ids = $rootScope;
	
	// Profiles
	$scope.profiles = []; //selected;
	
	// Details
	$scope.details = details;
	


	/************************************************/
	/* Bind - Style									*/
	/************************************************/
	/**
	 * Expand
	 */
	$rootScope.$on('$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams) {
			if (toState.name == 'dashboard') {
				document.getElementById('wrapper').className = 'expanded';
			} else {
				document.getElementById('wrapper').className = '';
			}
		});

	
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