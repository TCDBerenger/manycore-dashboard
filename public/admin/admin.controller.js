app.controller('AdminController', ['$scope', '$rootScope', '$http', 'profileService', function($scope, $rootScope, $http, profileService) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	$scope.profiles = profileService.all;
	
	// Versions
	$scope.versions = null;
	$scope.versions_expected = null;
	$scope.versions_loaded = false;
	
	// Waiting
	$scope.waiting = 0;
	
	
	
	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	/**
	 * Waiting - global
	 */
	$scope.isWaiting = function() {
		return $scope.waiting > 0;
	};
	
	/**
	 * Text - version
	 */
	$scope.renderVersion = function(profile) {
		var v = $scope.versions[profile.id];
		return (!isNaN(parseFloat(v)) && isFinite(v)) ? v : "no cache";
	};

	
	
	/************************************************/
	/* Functions - Remote data						*/
	/************************************************/
	/**
	 * Load profiles
	 */
	function loadProfiles(handler) {
		// Check loaded profiles
		if ($scope.profiles.length == 0) {
			profileService.getAll().success(function() {
				handler();
			});
		} else {
			handler();
		}
	};
	 
	 
	/**
	 * Load cache versions
	 */
	$scope.loadCacheVersions = function() {
		if (! $scope.versions_loaded) $scope.reloadCacheVersions();
	};
	$scope.reloadCacheVersions = function() {
		$scope.waiting++;
		loadProfiles(loadCacheVersions);
	};
	function loadCacheVersions() {
		$http.get('/service/admin/cache-versions').success(function(data) {
			$scope.versions = data.versions;
			$scope.versions_expected = data.expected;
			$scope.versions_loaded = true;
			$scope.waiting--;
		});
	};
	 
	 
	/**
	 * Reset cache
	 */
	$scope.resetCache = function(id) {
		if ($scope.isWaiting()) return;
		console.log('click');
		$scope.waiting++;
		$http.get('/service/admin/cache-reload/' + id).success(function(data) {
			for(var i in data.versions){
				$scope.versions[i] = data.versions[i];
				console.log(i, data.versions[i], $scope.versions[i], $scope.versions);
			}
			$scope.waiting--;
		});
	};
	
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
}]);