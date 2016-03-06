app.controller('RawController', ['$scope', '$rootScope', '$http', 'selectedProfiles', 'categories', 'facets', function($scope, $rootScope, $http, selectedProfiles, categories, facets) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	var profiles =		selectedProfiles;
	var profileIDs =	selectedProfiles.map(function(profile) { return profile.id; });
	var encodedIDs =	profileIDs.join('-');
	
	
	/************************************************/
	/* Graphics - Scope								*/
	/************************************************/
	$scope.sets = [
		{
			title:			'Locks',
			version:		4,
			eventFacets:	[facets.ls, facets.lf],
			timeFacets:		[facets.lw],
		}, {
			title:			'Switches',
			version:		3,
			eventFacets:	[facets.s, facets.m],
		}
	];
	
	
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
				$scope.minVersion = Math.min($scope.minVersion, profile.version);
				$scope.maxVersion = Math.max($scope.maxVersion, profile.version);
				$scope.canV4 = $scope.canV4 || profile.version >= 4;
				$scope.canV5 = $scope.canV5 || profile.version >= 5;
			});

		
			//
			//	Finish to wait
			//
			$scope.isWaiting = false;
		});
	}
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Init UI vars
	$scope.isWaiting = true;
	$scope.minVersion = 5;
	$scope.maxVersion = 3;
	$scope.canV3 = true;
	$scope.canV4 = false;
	$scope.canV5 = false;
	
	// Export vars
	$scope.profiles = profiles;
	$scope.encodedIDs = encodedIDs;
	$scope.categories = categories.all;
	$scope.facets = facets;
	
	// Data
	retreiveData();
	$rootScope.saveSelectedIDs(profileIDs);
}]);