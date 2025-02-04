app.controller('AdminController', ['$scope', '$rootScope', '$http', 'profileService', function($scope, $rootScope, $http, profileService) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	$scope.profiles = profileService.all;
	$scope.p_exclude_sm = [5, 9, 31, 32, 33, 34, 35, 36, 37, 38, 39];
	
	// Versions
	$scope.versions = null;
	$scope.versions_expected = null;
	$scope.versions_loaded = false;
	
	// Stats
	$scope.stats = null;
	$scope.stats_loaded = false;

	// Results
	$scope.results_all = null;
	$scope.results_xps = null;
	$scope.results_loaded = false;
	
	// Waiting
	$scope.waiting = 0;
	$scope.selectedTab = null;
	$scope.couldRefresh = false;
	
	
	
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
	 * State - serial
	 */
	$scope.isExclude = function(profile, exclude) {
		return exclude.indexOf(profile.id) >= 0;
	};
	
	/**
	 * Text - version
	 */
	$scope.renderVersion = function(profile) {
		var v = $scope.versions[profile.id];
		return (!isNaN(parseFloat(v)) && isFinite(v)) ? v : "no cache";
	};
	$scope.renderVersion_stats = function(profile) {
		var v = $scope.stats.versions[profile.id];
		return (!isNaN(parseFloat(v)) && isFinite(v)) ? v : "no cache";
	};

	/**
	 * Text - mean
	 */
	$scope.mean = function(profile, attr, round) {
		if ($scope.stats[attr][profile.id])
			return Math.round(round * $scope.stats[attr][profile.id] / profile.hardware.data.lcores / $scope.stats.durations[profile.id]) / round;
		else
			return '';
	};

	/**
	 * Text - average
	 */
	$scope.average = function(attr, round, excludes) {
		if (! excludes) excludes = [];
		
		var sum = 0;
		var count = 0;
		
		$scope.profiles.forEach(function (profile) {
			if ($scope.stats[attr][profile.id] && excludes.indexOf(profile.id) < 0) {
				sum += $scope.stats[attr][profile.id] / profile.hardware.data.lcores / $scope.stats.durations[profile.id];
				count++;
			}
		});
		
		return Math.round(round * sum / count) / round;
	};
	
	
	/************************************************/
	/* Functions - UI Tab selection					*/
	/************************************************/
	/**
	 * Tab - Select - Roadmap
	 */
	$scope.selectRoadmap = function() {
		$scope.selectedTab = 1;
		$scope.couldRefresh = false;
	}
	
	/**
	 * Tab - Select - Cache
	 */
	$scope.selectCache = function() {
		if (! $scope.versions_loaded) reloadCacheVersions();
		$scope.selectedTab = 2;
		$scope.couldRefresh = true;
	}
	
	/**
	 * Tab - Select - Stats
	 */
	$scope.selectStats = function() {
		if (! $scope.stats_loaded) reloadStats();
		$scope.selectedTab = 3;
		$scope.couldRefresh = true;
	}
	
	/**
	 * Tab - Select - Cache
	 */
	$scope.selectResults = function() {
		if (! $scope.results_loaded) reloadResults();
		$scope.selectedTab = 4;
		$scope.couldRefresh = true;
	}
	
	
	
	/************************************************/
	/* Functions - UI Tab actions					*/
	/************************************************/
	/**
	 * Refresh
	 */
	$scope.refresh = function(id) {
		if ($scope.selectedTab == 2) {
			reloadCacheVersions();
		} else if ($scope.selectedTab == 3) {
			reloadStats();
		} else if ($scope.selectedTab == 4) {
			reloadResults();
		}
	};
	 
	 
	/**
	 * Reset cache
	 */
	$scope.resetCache = function(id) {
		if ($scope.isWaiting()) return;
		$scope.waiting++;
		$http.get('/service/admin/cache-reload/' + id).success(function(data) {
			for(var i in data.versions){
				$scope.versions[i] = data.versions[i];
			}
			$scope.waiting--;
		});
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
	function reloadCacheVersions() {
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
	 * Load stats
	 */
	function reloadStats() {
		$scope.waiting++;
		loadProfiles(loadStats);
	};
	function loadStats() {
		$http.get('/service/admin/stats').success(function(data) {
			$scope.stats = data;
			$scope.stats_loaded = true;
			$scope.waiting--;
		});
	};
	
	
	/**
	 * Load results
	 */
	function reloadResults() {
		$scope.waiting++;
		$http.get('/service/admin/xp-results').success(function(data) {
			$scope.results_all = data;
			$scope.results_xps = Object.keys(data);
			$scope.results_loaded = true;
			$scope.waiting--;
			console.log('results_all', $scope.results_all);
			console.log('results_xps', $scope.results_xps);
		});
	};
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
}]);