app.controller('DashboardController', ['$scope', '$rootScope', '$window', '$http', 'profileService', 'categories', 'colours' , function($scope, $rootScope, $window, $http, profileService, categories, colours) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	$scope.profiles = profileService.all;
	$scope.selectedProfiles = []
	$scope.availableProfiles = [];
	$scope.data = { c: {} };
	$scope.waitingDataCounter = 0;

	// Details
	$scope.categories = categories.all;

	// References
	$scope.encodeSelectedProfile = $rootScope.encodeSelectedProfile;

	// Global binds
	angular.element($window).on('resize', function() {
		$scope.$apply();
	});
	
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
	$scope.hasProfiles = function() {
		return $scope.selectedProfiles.length > 0;
	};

	/**
	 * Flag - selected
	 */
	$scope.has2Profiles = function() {
		return $scope.selectedProfiles.length == 2;
	};
	
	/**
	 * Flag - data not loaded
	 */
	$scope.waitingData = function() {
		return $scope.waitingDataCounter < 0;
	};


	//
	// OLD
	//
	

	/**
	 * Flag - selected
	 */
	$scope.hasSelectedProfile = function() {
		return $scope.selectedProfiles.length > 0;
	};
	
	/**
	 * Flag - selected (s)
	 */
	$scope.hasSelectedProfiles = function() {
		return $scope.selectedProfiles.length > 1;
	};
	
	/**
	 * Flag - data not loaded
	 */
	$scope.waitingDataFor = function(id) {
		return ! $scope.data.hasOwnProperty(id);
	};
	
	/**
	 * Flag - data loaded
	 */
	$scope.hasData = function(id) {
		return $scope.data.hasOwnProperty(id);
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

		// Download data for graphs
		if ($scope.data.hasOwnProperty(profile.id)) {
			$scope._selectProfile_withData(profile);
		} else {
			$scope.downloadData(profile);
		}
	};
	$scope._selectProfile_withData = function(profile) {
		// add to selection
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
	
	/**
	 * Reverse
	 */
	$scope.invertProfiles = function() {
		$scope.selectedProfiles.reverse();
		
		// Save new selection
		$rootScope.invert();
	};
	
	/************************************************/
	/* Functions - Data store						*/
	/************************************************/
	
	/**
	 * Restore
	 */
	$scope.restoreSelectedProfiles = function() {
		// Init: all profiles are available
		$scope.availableProfiles = $scope.profiles.slice(0);

		// retreive ids
		var ids = $rootScope.selectedIDs.slice(0);

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
	$scope.downloadData = function(profile) {
		$scope.waitingDataCounter--;

		$http.get('/service/details/dash/'+ profile.id).success(function(data) {
			$scope.data[profile.id] = data[profile.id];
			$scope.data[profile.id].profile = profile;
			$scope.data.c.timeMin = Math.min(data.c.timeMin, $scope.data.c.timeMin | 0);
			$scope.data.c.timeMax = Math.max(data.c.timeMax, $scope.data.c.timeMax | 0);
			$scope.data.c.duration = Math.max(data.c.duration, $scope.data.c.duration | 0);

			$scope._selectProfile_withData(profile);

			$scope.waitingDataCounter++;
		});
	};
	
	/**
	 * Get data
	 */
	$scope.getprofileData = function() {
		var datap = [];
		$scope.selectedProfiles.forEach(function(profile) {
			datap.push($scope.data[profile.id]);
		});
		return datap;
	};
	
	
	/************************************************/
	/* Functions - Widget data						*/
	/************************************************/

	/**
	 * Get
	 */
	$scope.getWigdetData = function(cat) {
		var wd = [];

		$scope.selectedProfiles.forEach(function(profile, i) {
			var dp = $scope.data[profile.id];

			switch(cat) {
				case 'tg':
					var timeCapacity = dp.info.cores * dp.info.duration;
					var timeRunning = dp.stats.r / timeCapacity;
					var timeAvailable = Math.max((timeCapacity - dp.stats.r - dp.stats.y - dp.stats.b) / timeCapacity, 0);
					var timeWaiting = (dp.stats.y + dp.stats.b) / timeCapacity;

					var evCapacity = 35 * dp.info.duration;
					var evSwitches = dp.stats.s / evCapacity;
					var evMigrations = dp.stats.m / evCapacity;

					wd.push([
						// top
						[
							// Running
							{
								t: 'running',
								l: Math.round(timeRunning * 100) + '%',
								v: timeRunning,
								c: colours.list.dGreen,
								b: colours.list.lGreen
							},
							// available
							{
								t: 'unused ressources',
								l: Math.round(timeAvailable * 100) + '%',
								v: timeAvailable,
								c: colours.list.dBlue,
								b: colours.list.lBlue
							},
							// waiting
							{
								t: 'waiting',
								l: Math.round(timeWaiting * 100) + '%',
								v: timeWaiting,
								c: colours.list.dRed,
								b: colours.list.lRed
							}
						],
						// Bottom
						[
							// Switches
							{
								t: 'context switches',
								l: Math.round(evSwitches * 100) + '%',
								v: Math.min(evSwitches * 10, 1),	// Focus on 10 %
								c: colours.list.dGrey,
								b: colours.list.lGrey
							},
							// Migrations
							{
								t: 'migrations',
								l: Math.round(evMigrations * 100) + '%',
								v: Math.min(evMigrations * 20, 1),	// Focus on 5 %
								c: colours.list.dViolet,
								b: colours.list.lViolet
							}
						]
					]);


					break;
				case 'sy':

					break;
				case 'ds':

					break;
				case 'lb':

					break;
				case 'dl':

					break;
				case 'rs':

					break;
				case 'io':

					break;
			}
		});

		return wd;
	};

	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Restore
	$scope.restoreSelectedProfiles();
}]);