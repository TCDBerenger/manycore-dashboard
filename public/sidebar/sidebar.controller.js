app.controller('SidebarController', ['$scope', '$stateParams', 'details', function($scope, $stateParams, details) {
	// Metadata
	$scope.meta = {};
	
	// Profiles
	$scope.profiles = []; //selected;
	
	// Details
	$scope.details = details;
	
	
	/************************************************/
	/* Functions - Browsing							*/
	/************************************************/
	
	/**
	 * Join
	 */
	$scope.encodeSelectedProfile = function() {
		var output = "";
		
		$scope.selectedProfiles.forEach(function(element, index, array) {
			output += (output.length > 0) ? "-" : "";
			output += element.id;
		});
		
		return output;
	};
}]);