/* global app */
/* global angular */
app.controller('DashboardController', ['$scope', '$rootScope', '$window', '$stateParams', '$http', '$sce', 'profileService', 'categories' , function($scope, $rootScope, $window, $stateParams, $http, $sce, profileService, categories) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	$scope.profiles = profileService.all;
	$scope.selectedProfiles = [];
	$scope.howWaiting = 0;
	var waitingProfiles = [];

	// Details
	$scope.commonCategory = categories.common;
	$scope.categories = categories.all;

	// References
	var ids = $stateParams.ids.split('-')
		.map(function(value) { return +value; })
		.filter(function(value) { return value === parseInt(value, 10) && value > 0 && value < 9999; })
		.slice(0, 2);
	
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
	
	// Steps
	$scope.stepTooltipAnalyse = $sce.trustAsHtml(
		'<span class="text-success">green</span> for working well,<br />' +
		'<span class="text-primary">blue</span> for improvement,<br />' +
		'<span class="text-danger">red</span>, <span class="text-warning">yellow</span> and <span class="text-muted">all other colours</span> for possible problem'
	);
	
	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	/**
	 * Layout - main col
	 */
	$scope.mainColSize = function() {
		return 12 - Math.ceil(($scope.selectedProfiles.length + Math.min(1, $scope.howWaiting)) * 2.5);
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
		return ($scope.selectedProfiles.length + $scope.howWaiting) < 2;
	};

	/**
	 * Profile - has a specified profile
	 */
	$scope.hasProfile = function(pindex) {
		return $scope.selectedProfiles.length > pindex;
	};

	/**
	 * Profile - has at least one selected
	 */
	$scope.hasProfiles = function() {
		return $scope.selectedProfiles.length > 0;
	};

	/**
	 * Profile - has a half selection
	 */
	$scope.has1Profile = function() {
		return $scope.selectedProfiles.length == 1;
	};

	/**
	 * Profile - has a complete selection
	 */
	$scope.has2Profiles = function() {
		return $scope.selectedProfiles.length == 2;
	};

	/**
	 * Profile - loading a specific profile
	 */
	$scope.waitProfile = function(pindex) {
		return ($scope.selectedProfiles.length + $scope.howWaiting) == pindex + 1 && $scope.howWaiting > 0;
	};

	/**
	 * Profile - will add or has already a specific profile
	 */
	$scope.willProfile = function(pindex) {
		return ($scope.selectedProfiles.length + $scope.howWaiting) > pindex;
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
		return $scope.howWaiting > 0;
	};
	
	/**
	 * Profile - is selected
	 */
	$scope.isSelected = function(profile) {
		return $scope.selectedProfiles.indexOf(profile) >= 0 || waitingProfiles.indexOf(profile) >= 0;
	};
	

	/**
	 * Wizard - step 1
	 */
	$scope.isStep1 = function() {
		return $scope.selectedProfiles.length + $scope.howWaiting == 0;
	};

	/**
	 * Wizard - step 1 compare
	 */
	$scope.isStep1Compare = function() {
		return $scope.selectedProfiles.length + $scope.howWaiting == 1;
	};
	
	/**
	 * Wizard - step 2
	 */
	$scope.isStepAnalyse = function() {
		return $scope.selectedProfiles.length > 0;
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

	
	/**
	 * Tooltip - follow
	 */
	/*
	var tooltipCache = [];
	$scope.categoryTooltipMouseMoveHandler = function(event, index) {
		if (! tooltipCache[index])
			tooltipCache[index] = document.getElementById('div-tooltip-' + index);
		
		tooltipCache[index].style.left = event.pageX + 'px';
        tooltipCache[index].style.top = event.pageY + 'px';
	};
	*/
	
	/************************************************/
	/* Graphical - Help selection					*/
	/************************************************/
	/**
	 * UI - Category hovered
	 */
	$scope.selectCategory = function(category) {
		$scope.hoveredCategory = category;
	}
	
	/**
	 * UI - Category leaved
	 */
	$scope.unselectCategory = function() {
		$scope.hoveredCategory = null;
	}
	/**
	 * UI - Strip hovered
	 */
	$scope.selectStrip = function(strip) {
		$scope.hoveredStrip = strip;
	}
	
	/**
	 * UI - Strip leaved
	 */
	$scope.unselectStrip = function() {
		$scope.hoveredStrip = null;
	}
	
	

	/************************************************/
	/* Functions - Handle data						*/
	/************************************************/
	
	/**
	 * Get
	 */
	$scope.iProfile = function() {
		return $scope.selectedProfiles[this.pindex];
	};
	

	/************************************************/
	/* Functions - Select data						*/
	/************************************************/
	
	/**
	 * Select
	 */
	$scope.selectProfile = function(profile) {
		// Download data for graphs
		if (profile.data.hasOwnProperty('dash')) {
			_selectProfile_withData(profile);
		} else {
			downloadData(profile);
		}
	};
	function _selectProfile_withData(profile) {
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
		
		// Save new selection
		$rootScope.saveSelectedProfiles($scope.selectedProfiles);
	};
	
	/**
	 * Unselect all
	 */
	$scope.unselectAllProfiles = function() {
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
	$scope.restoreProfiles = function() {
		// Select ids
		var selectedIDs;
		if (ids && ids.length > 0) {
			selectedIDs = ids;
			$rootScope.clear();
		} else {
			selectedIDs = $rootScope.selectedIDs.slice(0);
		}

		// For each profile
		if (selectedIDs && selectedIDs.length > 0) {
			$scope.profiles.forEach(function(profile, index, array) {
				selectedIDs.forEach(function(id) {
					// If profile was selected in a previous session
					if (profile.id == id) {
						// Select this profile
						$scope.selectProfile(profile);
					}
				})
			});
		}
	};
	
	
	/************************************************/
	/* Functions - Remote data						*/
	/************************************************/

	/**
	 * Load
	 */
	function downloadData(profile) {
		waitingProfiles.push(profile);
		$scope.howWaiting++;

		$http.get('/service/dash/'+ profile.id).success(function(data) {
			profile.data.dash = data;

			$scope.brushing.timeMax = Math.max($scope.brushing.timeMax, data.info.duration);

			_selectProfile_withData(profile);

			waitingProfiles.splice(waitingProfiles.indexOf(profile), 1);
			$scope.howWaiting--;
		});
	};

	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Restore
	$scope.restoreProfiles();

	/**
	 * Populate
	 */
	$scope.hoveredCategory = null; // populated by the view
	$scope.hoveredStrip = null; // populated by the view
}]);