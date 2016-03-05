app.controller('RawController', ['$scope', '$rootScope', '$http', 'selectedProfiles', 'categories', function($scope, $rootScope, $http, selectedProfiles, categories) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	var profiles =		selectedProfiles;
	var profileIDs =	selectedProfiles.map(function(profile) { return profile.id; });
	var encodedIDs =	profileIDs.join('-');
	
	// Scope UI
	var waiting = true;
	
	
	/************************************************/
	/* Graphics - Scope							*/
	/************************************************/
	/**
	 * Waiting - is waiting some data
	 */
	$scope.isWaiting = function() {
		return waiting;
	};
	
	/************************************************/
	/* Network - retreive data						*/
	/************************************************/
	/**
	 * Retreive - data
	 */
	function retreiveData() {	
		$http.get('/service/raw/' + encodedIDs).success(function(data) {
			//	
			//	Profiles
			//
			profiles.forEach(function(profile) {
				profile.raw = data[profile.id];
			});

		
			//
			//	Finish to wait
			//
			waiting = false;
			console.log(profiles[0].raw.gauges);
		});
	}
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Export vars
	$scope.profiles = profiles;
	$scope.encodedIDs = encodedIDs;
	$scope.categories = categories.all;
	
	// Data
	retreiveData();
	$rootScope.saveSelectedIDs(profileIDs);
}]);