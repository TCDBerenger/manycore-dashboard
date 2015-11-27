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
	
	
	// Axis common list
	var axisTime = { b: '⇛', c: '#000;', t: '[X] Time', d: 'time line in horizontal with scale in seconds, from -b- s to -e- s' }; // ⇛ ➨ ➽ 


	
	/************************************************/
	/* Network - retreive data						*/
	/************************************************/
	/**
	 * Retreive - data
	 */
	function retreiveData(dataToRetreive) {

		$http.get('/service/details/'+ tag + '/' + dataToRetreive.join('-')).success(function(data) {
			profiles.forEach(function(profile) {
				profile.data[tag] = data[profile.id];
			});
			postReceiption();
		});
		
	}
	/**
	 * Retreive - populate
	 */
	function postReceiption() {
		//
		//	Data
		//
		profiles.forEach(function(profile) {
			profile.currentData = profile.data[tag];
		});
		
		
		//
		//	Selection
		//
		$scope.selection = {
			begin: 0,
			end: (profiles.length > 1) ? Math.max(profiles[0].data[tag].info.duration, profiles[1].data[tag].info.duration) : profiles[0].data[tag].info.duration
		}
		
		
		//
		//	Axis
		//
		// clear
		$scope.axisList.splice(0, $scope.axisList.length);
		
		// customize
		var aTime = JSON.parse(JSON.stringify(axisTime));
		aTime.d = aTime.d
			.replace("-b-", Math.round($scope.selection.begin / 100) / 10)
			.replace("-e-", Math.round($scope.selection.end / 100) / 10);
		
		// populate
		$scope.axisList.push(aTime);

		
		//
		//	Finish to wait
		//
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
	 * Version - is too old
	 */
	$scope.isOutofVersion = function(widget) {
		return widget.v > profiles[0].version || (profiles[1] && widget.v > profiles[1].version);
	};
	
	/**
	 * Version - is new enough
	 */
	$scope.isUpToVersion = function(widget) {
		return widget.v <= profiles[0].version && (profiles.length == 1 || widget.v <= profiles[1].version);
	};
	
	
	/************************************************/
	/* Functions - Focus on mouse					*/
	/************************************************/
	/**
	 * Document - init focus
	 */
	function initRuler() {
		$scope.ruler = document.getElementById('ruler');
		$scope.aRuler = angular.element($scope.ruler);
		$scope.stamps = $scope.ruler.querySelectorAll('.label');
		
		var pl = profiles.length;
		categories[tag].widgets.forEach(function(widget, iw) {
			if (widget.deck && widget.deck.focus) {
				widget.deck.focus.forEach(function(facet) {
					$scope.rules.push({ id: 'rule-' + iw + '-0-' + facet.attr, f: facet });
					if (pl > 1) $scope.rules.push({ id: 'rule-' + iw + '-1-' + facet.attr, f: facet });
				}, this);
			}
		}, this);
    };
	
	/**
	 * Mouse - over
	 */
	function mouseOver(event, r) {
		var x = event.clientX - r.container.getBoundingClientRect().x - r.layout.profile.x;
		var maxX = r.layout.profile.width;
		focusHandle((x < 0 || x > maxX) ? NaN : x, event.clientX, maxX);
	};

	/**
	 * Mouse - leave
	 */
	function mouseLeave(event) {
		focusHandle(NaN);
	};

	/**
	 * Focus - init pins (labels)
	 */
	//var tmpid = 1;
	function focusInitPins(valuedPins) {
		$scope.valuedPins.push.apply($scope.valuedPins, valuedPins);
	}

	/**
	 * Focus - move pin (labels)
	 */
	var pinElements = {};
	var pinValueElements = {};
	function focusMovePin(id, y, v) {
		// Create cache runtime
		if ('undefined' === typeof pinElements[id]) {
			pinElements[id] = document.getElementById(id);
			if (pinElements[id]) {
				if (pinElements[id].querySelectorAll('.pin-value').length > 0)
					pinValueElements[id] = pinElements[id].querySelectorAll('.pin-value')[0];
			}
		}
		// Move (or hide) pin
		if (isNaN(y)) {
			if (pinElements[id]) pinElements[id].style.opacity = 0;
		} else {
			if (y && pinElements[id]) {
				pinElements[id].style.opacity = 1;
				pinElements[id].style.top = y + 'px';
			}
			if (v && pinValueElements[id])	pinValueElements[id].innerHTML = v;
		}
	}

	/**
	 * Focus - global handle
	 */
	var legendTableList;
	function focusHandle(relativeX, x, maxX) {
		if (isNaN(relativeX)) {
			$scope.ruler.style.display = 'none';
			
			// Loose focus
			if ($scope.hasFocus) {
				for (var k = 0; k < legendTableList.length; k++) {
					legendTableList[k].classList.remove('table-focus');
				}
				$scope.hasFocus = false;
			}
		} else {
			$scope.ruler.style.display = 'initial';
			$scope.ruler.style.left = x + 'px';
			
			var label = Math.round(relativeX * ($scope.selection.end - $scope.selection.begin) / maxX + $scope.selection.begin) + ' ms';
			
			$scope.stamps[0].innerHTML = label;
			$scope.stamps[1].innerHTML = label;
			
			// Gain focus
			if (! $scope.hasFocus) {
				legendTableList = document.getElementsByClassName('table-legend');
				for (var k = 0; k < legendTableList.length; k++) {
					legendTableList[k].classList.add('table-focus');
				}
				$scope.hasFocus = true;
			}
		}
		
		$scope.$broadcast('xEvent', relativeX);
	}

	/**
	 * Focus - rules handle
	 */
	var ruleElements = {};
	var ruleValueElements = {};
	function focusRuleHandle(id, y, v) {
		if ('undefined' === typeof ruleElements[id]) {
			ruleElements[id] = document.getElementById(id);
			if (ruleElements[id]) {
				ruleValueElements[id] = ruleElements[id].querySelectorAll('.rule-value')[0];
			}
		}
		if (isNaN(y)) {
			if (ruleElements[id])		ruleElements[id].style.opacity = 0;
		} else {
			if (ruleElements[id]) {
				ruleElements[id].style.top = y + 'px';
				ruleElements[id].style.opacity = 1;
			}
			if (ruleValueElements[id])	ruleValueElements[id].innerHTML = v;
		}
	};


	/************************************************/
	/* Generator - Graphical						*/
	/************************************************/
	/**
	 * Generator - setting
	 */
	function initWidget(widget) {
		// Create settings
		var settings = { version: 0 };

		if (widget.deck != null) {
			// Modes
			if (widget.deck.modes) {
				widget.mode = widget.deck.modes[0].id;
			}
			
			// Populate settings
			if (widget.deck.settings != null) {
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
			}
		}
		
		// Populate
		widget.settings = settings;
	};


	/************************************************/
	/* Generator - Stats							*/
	/************************************************/
	function createStats(widget) {
		// Prerequite (to remove when finished)
		if (! widget.deck || ! widget.deck.data)
			return (profiles.length == 1) ? { values: [[0]], sums: [0], maxSum: 0 } : { values: [[0], [0]], sums: [0, 0], maxSum: 0 };
		
		var sums = (profiles.length == 1) ? [0] : [0, 0];
		var values = (profiles.length == 1) ? [[]] : [[], []];
		
		var value;
		profiles.forEach(function(profile, index) {
			widget.deck.data.forEach(function(facet) {
				value = Math.round(profile.currentData.stats[facet.cat][facet.attr]);
				values[index].push({
					previous: sums[index],
					value: value,
					label1: (facet.unity) ? value + '\u00A0' + facet.unity : value
				});
				sums[index] += value;
			});
		});
		
		if (widget.deck.data.length == 1) {
			for (var p = 0; p < profiles.length; p++) {
				values[p][0].label2 = '<todo>';
			}
			
		} else {
			for (var p = 0; p < profiles.length; p++) {
				for (var f = 0; f < widget.deck.data.length; f++) {
					values[p][f].label2 = Math.round(100 * values[p][f].value / sums[p]) + '\u00A0%';
				}
			}
		}
		
		return {
			mode: $scope.statMode,
			values: values,
			sums: sums,
			maxSum: Math.max.apply(this, sums)
		}
	}


	
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
	$scope.initWidget = initWidget;
	$scope.layout = layout;
	$scope.meta = categories[tag];
	$scope.mouseOver = mouseOver;
	$scope.mouseLeave = mouseLeave;
	$scope.createStats = createStats;
	$scope.axisList = []; // poputaled in postReceiption()
	$scope.statMode = 'units';
	$scope.initRuler = initRuler;
	$scope.rules = []; // poputaled in initRuler()
	$scope.valuedPins = []; // poputaled in focusInitPins()
	//$scope.focusRulesHandle = focusRulesHandle;
	$scope.hasFocus = false;
	$scope.focusRuleHandle = focusRuleHandle;
	$scope.focusInitPins = focusInitPins;
	$scope.focusMovePin = focusMovePin;
}]);