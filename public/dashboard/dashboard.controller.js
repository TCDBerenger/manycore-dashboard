app.controller('DashboardController', ['$scope', '$rootScope', 'profileService', 'categories', function($scope, $rootScope, profileService, categories) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	$scope.profiles = profileService.all;
	$scope.selectedProfiles = []
	$scope.availableProfiles = [];
	
	// Details
	$scope.categories = categories.all;

	// References
	$scope.encodeSelectedProfile = $rootScope.encodeSelectedProfile;
	
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
	
	/**
	 * Flag - selected
	 */
	$scope.hasSelectedProfiles = function() {
		return $scope.selectedProfiles.length > 1;
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
		$rootScope.saveSelectedProfiles($scope.selectedProfiles);
	};
	
	/**
	 * Unselect
	 */
	$scope.unselectProfile = function(profile) {
		$scope.selectedProfiles.splice($scope.selectedProfiles.indexOf(profile), 1);
		$scope.availableProfiles.push(profile);
		
		// Save new selection
		$rootScope.saveSelectedProfiles($scope.selectedProfiles);
	};
	
	/**
	 * Unselect all
	 */
	$scope.unselectAllProfiles = function() {
		while($scope.selectedProfiles.length > 0) {
			$scope.availableProfiles.push($scope.selectedProfiles.pop());
		}
		
		// Save new selection
		$rootScope.saveSelectedProfiles($scope.selectedProfiles);
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
		$scope.profiles.forEach(function(profile, index, array) {
			$rootScope.selectedIDs.forEach(function(id) {
				// If selected in a previous session
				if (profile.id == id) {
					// add to selection
					$scope.selectedProfiles.push(profile);
					// remove to available
					$scope.availableProfiles.splice(index, 1);
				}
			})
		});
	};
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Restore
	$scope.restoreSelectedProfiles();
}]);