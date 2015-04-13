app.controller('DashboardController', ['$scope', '$rootScope', 'profiles', 'details', function($scope, $rootScope, profiles, details) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	$scope.profiles = profiles.all;
	$scope.selectedProfiles = []
	$scope.availableProfiles = [];
	
	// Details
	$scope.details = details;
	
	
	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	
	/**
	 * Flag - add
	 */
	$scope.canAddProfile = function() {
		return $scope.selectedProfiles.length < 2;
	};
	
	/**
	 * Flag - selected
	 */
	$scope.hasSelectedProfile = function() {
		return $scope.selectedProfiles.length > 0;
	};
	
	/************************************************/
	/* Functions - Select data						*/
	/************************************************/
	
	/**
	 * Select
	 */
	$scope.selectProfile = function(profile) {
		$scope.availableProfiles.splice($scope.availableProfiles.indexOf(profile), 1);
		$scope.selectedProfiles.push(profile);
		
		// Save new selection
		$scope.flushSelectedProfiles();
	};
	
	/**
	 * Unselect
	 */
	$scope.unselectProfile = function(profile) {
		$scope.selectedProfiles.splice($scope.selectedProfiles.indexOf(profile), 1);
		$scope.availableProfiles.push(profile);
		
		// Save new selection
		$scope.flushSelectedProfiles();
	};
	
	/**
	 * Unselect all
	 */
	$scope.unselectAllProfiles = function() {
		while($scope.selectedProfiles.length > 0) {
			$scope.availableProfiles.push($scope.selectedProfiles.pop());
		}
		
		// Save new selection
		$scope.flushSelectedProfiles();
	};
	
	/************************************************/
	/* Functions - Data store						*/
	/************************************************/
	
	/**
	 * Restore
	 */
	$scope.restoreSelectedProfiles = function() {
		// Init: all profiles are available
		$scope.availableProfiles = $scope.profiles;

		// For each profile
		$scope.profiles.forEach(function(profile_element, profile_index, profile_array) {
			$rootScope.selectedProfiles.forEach(function(selected_element, selected_index, selected_array) {
				// If selected in a previous session
				if (profile_element.id == selected_element.id) {
					// add to selection
					$scope.selectedProfiles.push(profile_element);
					// remove to available
					$scope.availableProfiles.splice(profile_index, 1);
				}
			})
		});
	};
	
	/**
	 * Save
	 */
	$scope.flushSelectedProfiles = function() {
		$rootScope.selectedProfiles = $scope.selectedProfiles;
	};
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Restore
	$scope.restoreSelectedProfiles();
}]);