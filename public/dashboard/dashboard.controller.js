app.controller('DashboardController', ['$scope', '$rootScope', '$http', 'profileService', 'categories', function($scope, $rootScope, $http, profileService, categories) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	$scope.profiles = profileService.all;
	$scope.selectedProfiles = []
	$scope.availableProfiles = [];
	$scope.profileData = {};
	
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
	
	/**
	 * Flag - selected
	 */
	$scope.waitingData = function(id) {
		return ! $scope.profileData.hasOwnProperty(id);
	};
	
	/**
	 * Flag - selected
	 */
	$scope.hasData = function(id) {
		return $scope.profileData.hasOwnProperty(id);
	};
	
	/************************************************/
	/* Functions - Select data						*/
	/************************************************/
	
	/**
	 * Select
	 */
	$scope.selectProfile = function(profile) {
		// remove to available
		$scope.availableProfiles.splice($scope.availableProfiles.indexOf(profile), 1);

		// add to selection
		$scope.selectedProfiles.push(profile);
		
		// Save new selection
		$rootScope.saveSelectedProfiles($scope.selectedProfiles);

		// Download data for graphs
		$scope.downloadData(profile.id);
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

		// retreive ids
		var ids = [];
		angular.copy($rootScope.selectedIDs, ids)

		// For each profile
		$scope.profiles.forEach(function(profile, index, array) {
			ids.forEach(function(id) {
				// If profile was selected in a previous session
				if (profile.id == id) {
					// Select this profile
					$scope.selectProfile(profile);
				}
			})
		});
	};
	
	
	/************************************************/
	/* Functions - Remote data						*/
	/************************************************/

	/**
	 * Load
	 */
	$scope.downloadData = function(id) {
		if (! $scope.profileData.hasOwnProperty(id)) {
			$http.get('/service/details/dash/'+ id).success(function(data) {
				$scope.profileData[id] = data;
			});
		}
	};
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Restore
	$scope.restoreSelectedProfiles();
}]);