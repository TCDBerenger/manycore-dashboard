app.controller('DetailController', ['$scope', '$rootScope', '$window', '$stateParams', '$http', 'selectedProfiles', 'categories', 'widgets', function($scope, $rootScope, $window, $stateParams, $http, selectedProfiles, categories, widgets) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	var tag =		$stateParams.cat;
	var ids =		$stateParams.ids.split('-');
	var profiles =	selectedProfiles;
	var waiting =	true;

	// Check already data
	var dataToRetreive = [];
	profiles.forEach(function(profile) {
		if (! profile.data.hasOwnProperty(tag)) {
			dataToRetreive.push(profile.id);
		}
	});

	// Something to retreive ?
	// Looking for profile data
	if (dataToRetreive.length != 0) {
		retreiveData(dataToRetreive);
	} else {
		postReceiption();
	}


	// Setting for layout and visual/graphics elements
	var layout = {
		colXS: { graph: 7, data: 5 },
		colSM: { graph: 8, data: 4 },
		colMD: { graph: 9, data: 3 },
		colLG: { graph: 9, data: 3 }
	};



	
	/************************************************/
	/* Network - retreive data						*/
	/************************************************/
	/**
	 * Retreive - data
	 */
	function retreiveData(dataToRetreive) {

		$http.get('/service/details/'+ tag + '/' + dataToRetreive.join('-')).success(function(data) {
			profiles.forEach(function(profile) {
				profile.currentData = data[profile.id];
				profile.data[tag] = data[profile.id];
			});
			postReceiption();
		});
		
	}
	/**
	 * Retreive - populate
	 */
	function postReceiption() {
		oldDataCompatibility();

		$scope.selection = {
			begin: 0,
			end: (profiles.length > 1) ? Math.max(profiles[0].data[tag].info.duration, profiles[1].data[tag].info.duration) : profiles[0].data[tag].info.duration
		}

		waiting =	false;
	}
	
	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	/**
	 * Waiting - is waiting some data
	 */
	function isWaiting() {
		return waiting;
	};

	/**
	 * Mouse - over
	 */
	function mouseOver(event, r) {
		var x = event.clientX - r.container.getBoundingClientRect().x - r.layout.profile.x;
		$scope.$broadcast('xEvent', (x < 0 || x > r.layout.profile.width) ? NaN : x);
	};

	/**
	 * Mouse - leave
	 */
	function mouseLeave(event) {
		$scope.$broadcast('xEvent', NaN);
	};
	
	/**
	 * Version - is too old
	 */
	$scope.isOutofVersion = function(widget) {
		return widget.v > profiles[0].version || widget.v > profiles[1].version;
	};
	
	/**
	 * Version - is new enough
	 */
	$scope.isUpToVersion = function(widget) {
		return widget.v <= profiles[0].version && (profiles.length == 1 || widget.v <= profiles[1].version);
	};


	/************************************************/
	/* Generator - Graphical						*/
	/************************************************/
	/**
	 * Generator - setting
	 */
	function createSettings(widget) {
		var settings = { version: 0 };

		if (widget.deck != null && widget.deck.settings != null)
			widget.deck.settings.forEach(function(setting) {
				settings["_" + setting.property] = setting.value;

				settings.__defineGetter__(setting.property, function () {
					return settings["_" + setting.property];
				});

				settings.__defineSetter__(setting.property, function (val) {
					if (settings["_" + setting.property] != val) {
						try {
							settings["_" + setting.property] = JSON.parse(val);
						} catch(e) {
							settings["_" + setting.property] = val;
						};
						settings.version++;
					}
				});
			});

		widget.settings = settings;
	};



	
	/************************************************/
	/* Scope - post treatment						*/
	/************************************************/
	/**
	 * Global binds
	 */
	angular.element($window).on('resize', function() {
		$scope.$apply();
	});

	/**
	 * Start session from here?
	 *	-> Dispatch selected profiles
	 */
	$rootScope.saveSelectedIDs(ids);

	/**
	 * Populate
	 */
	$scope.widgets = widgets;
	$scope.ids = ids;
	$scope.profiles = profiles;
	$scope.isWaiting = isWaiting;
	$scope.createSettings = createSettings;
	$scope.layout = layout;
	$scope.meta = categories[tag];
	$scope.mouseOver = mouseOver;
	$scope.mouseLeave = mouseLeave;

	/**
	 * Old compatibilty
	 */
	function oldDataCompatibility() {
		$scope.data = {
			c: {
				timeMin: 0,
				duration: 0
			}
		};
		profiles.forEach(function(profile) {
			$scope.data[profile.id] = profile.data[tag];
			$scope.data.c.duration = Math.max($scope.data.c.duration, profile.data[tag].info.duration);
		});
	}



	//
	//
	//		OLD
	//
	//
	/*
	// Metadata - Copy params data
	$scope.meta.ids = $stateParams.ids;	

	// Metadata - Copy detail data
	var category = categories[tag];
	for (var attr in category) {
		if (category.hasOwnProperty(attr)) {
			$scope.meta[attr] = category[attr];
		}
	};
	
	// Details
	$scope.profiles = selectedProfiles;
	$scope.ids = [];
	$scope.data = dataProfiles;

	// Populate ids
	$scope.profiles.forEach(function(profile) {
		$scope.ids.push(profile.id);
	});
	*/
}]);