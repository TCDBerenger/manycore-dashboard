/* global app */
/* global angular */
app.controller('DashboardController', ['$scope', '$rootScope', '$window', '$http', 'profileService', 'categories', 'strips', 'gauges' , function($scope, $rootScope, $window, $http, profileService, categories, strips, gauges) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	$scope.profiles = profileService.all;
	$scope.selectedProfiles = []
	$scope.availableProfiles = [];
	$scope.data = {};					// to delete : already replaced by profile.data.dash
	$scope.waitingDataCounter = 0;

	// Details
	$scope.categories = categories.all;
	$scope.strips = strips;
	$scope.gauges = gauges;

	// References
	$scope.encodeSelectedProfile = $rootScope.encodeSelectedProfile;

	// Global binds
	angular.element($window).on('resize', function() {
		$scope.$apply();
	});

	// Brushing
	$scope.brushing = {
		timeMin:	0,
		timeMax:	0,
		selectMin:	NaN,
		selectMax:	NaN
	}
	
	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	/**
	 * Layout - main col
	 */
	$scope.mainColSize = function() {
		return 12 - Math.ceil(($scope.selectedProfiles.length + Math.min(1, $scope.waitingDataCounter)) * 2.5);
	};

	/**
	 * Layout - section Y postiion
	 */
	$scope.sectionY = function(index) {
		if (! $scope.hasOwnProperty('ctrlLegendY')) {
			$scope.ctrlLegendY = document.getElementById('ctrl-legend').getBoundingClientRect().y
		}
		var section = document.getElementById('section0' + index);
		if (section != null) {
			return section.getBoundingClientRect().y - $scope.ctrlLegendY;
		} else {
			return index * 61;
		}
	};

	/**
	 * Profile - can add
	 */
	$scope.canAddProfile = function() {
		return ($scope.selectedProfiles.length + $scope.waitingDataCounter) < 2;
	};

	/**
	 * Profile - has at least one selected
	 */
	$scope.hasProfiles = function() {
		return $scope.selectedProfiles.length > 0;
	};

	/**
	 * Profile - has a complete selection
	 */
	$scope.has2Profiles = function() {
		return $scope.selectedProfiles.length == 2;
	};

	/**
	 * Profile - has a complete selection even without loaded data
	 */
	$scope.will2Profiles = function() {
		return ($scope.selectedProfiles.length + $scope.waitingDataCounter) == 2;
	};

	/**
	 * Profile - duration percent
	 */
	$scope.durationPercent = function(profile) {
		return Math.round(100 * profile.data.dash.info.duration / Math.max($scope.selectedProfiles[0].data.dash.info.duration, $scope.selectedProfiles[1].data.dash.info.duration));
	};
	
	/**
	 * Profile - data not loaded
	 */
	$scope.waitingData = function() {
		return $scope.waitingDataCounter > 0;
	};

	/**
	 * Data - main col
	 */
	$scope.getIndicatorData = function() {
		var output = [];

		$scope.selectedProfiles.forEach(function(profile) {
			output.push($scope.data[profile.id]);
		})

		return output;
	};
	
	/**
	 * Blur - var
	 */
	$scope.needModalBG = false;
	
	/**
	 * Blur - handlers
	 */
	$scope.blur = function() {
		$scope.needModalBG = true;
	}
	$scope.unblur = function() {
		$scope.needModalBG = false;
	}

	

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
		if (profile.data.hasOwnProperty('dash')) {
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
		$scope.waitingDataCounter++;

		$http.get('/service/dash/'+ profile.id).success(function(data) {
			profile.data.dash = data;
			$scope.data[profile.id] = data;
			$scope.data[profile.id].profile = profile;

			$scope.brushing.timeMax = Math.max($scope.brushing.timeMax, data.info.duration);

			$scope._selectProfile_withData(profile);

			$scope.waitingDataCounter--;
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
	/* Constructor - Finish							*/
	/************************************************/
	// Restore
	$scope.restoreSelectedProfiles();
}]);