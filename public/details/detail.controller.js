/* global angular */

// Time handling constants
const TIME_NONE = 0;
const TIME_PROFILE = 10;
const TIME_CUSTOM = 20;

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
		//if (! profile.data.hasOwnProperty(tag)) {
			dataToRetreive.push(profile.id);
		//}
	});

	// Something to retreive ?
	// Looking for profile data
	//if (dataToRetreive.length != 0) {
		retreiveData(dataToRetreive);
	//} else {
	//	postReceiption();
	//}


	// Setting for layout and visual/graphics elements
	var layout = {
		colXS: { graph: 7, data: 5 },
		colSM: { graph: 8, data: 4 },
		colMD: { graph: 9, data: 3 },
		colLG: { graph: 9, data: 3 }
	};
	
	
	// Axis common list
	var axisTime = { b: '↣', c: '#000;', t: 'Time', d: 'time line, scale in seconds, from -b- s to -e- s' }; // ⇛ ➨ ➽ 


	
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
			profile.raw = profile.data[tag].raw;
		});
		
		
		//
		//	Selection
		//
		$scope.selection = {
			begin: 0,
			end: (profiles.length > 1) ? Math.max(profiles[0].data[tag].info.duration, profiles[1].data[tag].info.duration) : profiles[0].data[tag].info.duration,
			step: [profiles[0].data[tag].info.timeStep, (profiles.length > 1) ? profiles[1].data[tag].info.timeStep : null]
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
	 * Capability - can
	 */
	$scope.isCapable = function(profile) {
		if (profile) {
			return profile.currentData.info.capability[this.widget.c];
		} else {
			return profiles[0].currentData.info.capability[this.widget.c] && (profiles.length == 1 || profiles[1].currentData.info.capability[this.widget.c]);
		}
	};
	
	/**
	 * Capability - cannot
	 */
	$scope.isNotCapable = function(profile) {
		if (profile) {
			return ! profile.currentData.info.capability[this.widget.c];
		} else {
			return ! (profiles[0].currentData.info.capability[this.widget.c] && (profiles.length == 1 || profiles[1].currentData.info.capability[this.widget.c]));
		}
	};


	/************************************************/
	/* Generator - Graphical						*/
	/************************************************/
	/**
	 * Generator - checking set value (conform or not)
	 */
	var checkSettingValue = function(t, value) {
		if (t && t == 'positive') {
			return isFinite(value) && value > 0;
		} else {
			return true;
		}
	}
	
	/**
	 * Generator - setting
	 */
	function initWidget(widget) {
		// Create settings
		var settings = { version: 0 };
		var data = [null, null];
		var dataPercent = [null, null];
		
		// Set properties
		widget.settings = settings;
		widget.data = data;
		widget.dataPercent = dataPercent;
		widget.getStatStepTimes = function() { return getStatStepTimes(widget); };

		// Populate
		if (widget.deck != null) {
			// Mlans mode
			if (widget.deck.plans) {
				settings._plan = 0;

				settings.__defineGetter__('plan', function () {
					return settings._plan;
				});

				settings.__defineSetter__('plan', function (val) {
					if (settings._plan != +val) {
						settings._plan = +val;
						settings.version++;
						settings.lastChangeProperty = 'plan';
					}
				});
			}
			
			// Populate settings
			if (widget.deck.settings != null) {
				widget.deck.settings.forEach(function(setting) {
					// Compute value by profile (array case)
					if ('psource' in setting) {
						setting.value = [];
						profiles.forEach(function(profile) {
							setting.value.push(setting.psource(profile))
						});
					}
					
					// Cache initial value
					settings["_" + setting.property] = setting.value;
					
					// Set accessors
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
							if (setting.property == 'timeGroup') populateWidgetData(widget);
							if (checkSettingValue(setting.check, settings["_" + setting.property])) {
								settings.version++;
								settings.lastChangeProperty = setting.property;
							}
						}
					});
					
					// Set additional accessors (array case)
					if (Array.isArray(setting.value)) {
						var setter = function(index, val) {
							if (settings["_" + setting.property][index] != val) {
								try {
									settings["_" + setting.property][index] = JSON.parse(val);
								} catch(e) {
									settings["_" + setting.property][index] = val;
								};
								
								if (checkSettingValue(setting.check, settings["_" + setting.property][index])) {
									settings.version++;
									settings.lastChangeProperty = setting.property;
								}
							}
						}
						setting.value.forEach(function(value, index) {
							settings.__defineGetter__(setting.property + index, function () { return settings["_" + setting.property][index]; });
							settings.__defineSetter__(setting.property + index, function (val) { setter(index, val); });
						}, this);
					}
				});
			}
			
			// Populate data
			if (widget.deck.handling.time == TIME_PROFILE) {
				data[0] = profiles[0].raw.amount;
				dataPercent[0] = profiles[0].raw.amountPercent;
				if (profiles.length > 1) {
					data[1] = profiles[1].raw.amount;
					dataPercent[1] = profiles[1].raw.amountPercent;
				}
			} else if (widget.deck.handling.time == TIME_CUSTOM) {
				populateWidgetData(widget);
			}
		}
	};
	
	/**
	 * Widget - data population
	 */
	function populateWidgetData(widget) {
		var timeGroup = widget.settings._timeGroup;
		var deck = widget.deck.handling.v || [];
		var source, frameID, end, frames, attr;
		
		// Loop by profile
		for (var p = 0; p < profiles.length; p++) {
			// Compute data
			end = Math.min($scope.selection.end, profiles[p].data[tag].info.duration);
			
			// Clear data
			frames = [];
			
			// Fill data
			for (var t = $scope.selection.begin; t < end; t += timeGroup) {
				frames.push({});
			}
			
			// Count data
			for (var v = deck.length; v--; ) {
				attr = deck[v].attr;
				
				source = profiles[p].raw.events[deck[v].attr];
				for (var r = source.length; r--; ) {
					frameID = Math.floor(source[r] / timeGroup);
					frames[frameID][attr] = 1 + (frames[frameID][attr] || 0);
				}
			}
			
			// Poputale
			widget.data[p] = frames;
		}
	}


	/************************************************/
	/* Generator - Stats							*/
	/************************************************/
	var statsIndex = 0;
	var statsCache = [];
	function createStats(widget) {
		var stats = {
			version: 0,
			//time: widget.deck.data.timeHandling,
			getStatStepTimes: widget.getStatStepTimes,
			table: document.getElementsByClassName('table-legend')[statsIndex],
			tableLabel: null, // document.getElementsByClassName('table-legend-label')[statsIndex]
			deck: widget.deck.data,
			data: widget.data,
			dataPercent: widget.dataPercent,
			focusable: isStatHandleFocus(widget),
			focusLabel: 'under cursor',
			mode: $scope.statMode,
			valuesMax: [],
			values1: [[], []],
			values2: [[], []],
			valuesStack: [[], []]
		};
		
		// Save cache
		statsCache.push(stats);
		widget.stats = stats;
		statsIndex++;
		
		// Update stat values
		updateStats(stats);
		
		return stats;
	}

	function updateStats(stats, positions) {
		// Stats mode (is stats or is focus)
		var isStats = ! positions || positions.isOut;
		var steps = stats.getStatStepTimes();
		
		// Compute data
		var tIndex, facet, value1, value2, maxValue, profile;
		for (var index = 0; index < profiles.length; index++) {
			maxValue = 0;
			profile = profiles[index];
			stats.valuesStack[index][0] = 0;
			tIndex = (! isStats) ? positions['i' + steps[index]] : null;
			for (var f = 0; f < stats.deck.length; f++) {
				facet = stats.deck[f];
				// Values
				value1 = (isStats) ? profile.raw.stats[facet.attr] : (stats.data[index][tIndex]) ? (stats.data[index][tIndex][facet.attr] || 0) : null;
				value2 = (isStats) ? profile.raw.statsPercent[facet.attr] : (stats.dataPercent[index] && stats.dataPercent[index][tIndex]) ? (stats.dataPercent[index][tIndex][facet.attr] || 0) : null;
				stats.values1[index][f] = (value1 != undefined) ? (facet.unity) ? value1 + '\u00A0' + facet.unity : value1 : null;
				stats.values2[index][f] = (value2 != undefined) ? value2 + '\u00A0%' : null;
				// From TO
				maxValue += value1;
				stats.valuesStack[index][f + 1] = maxValue;
			}
			stats.valuesMax[index] = maxValue;
		}
		
		// Change stats "under cursor" to custom time frame
		if (! isStats) {
			if (steps[1] && steps[0] != steps[1]) {
				stats.focusLabel = positions['f' + steps[0]] + ' ms ➜ ' + (positions['f' + steps[0]] + steps[0]) + ' ms / ' + positions['f' + steps[1]] + ' ms ➜ ' + (positions['f' + steps[1]] + steps[1]) + ' ms';
			} else {
				stats.focusLabel = positions['f' + steps[0]] + ' ms ➜ ' + (positions['f' + steps[0]] + steps[0]) + ' ms';
			}
		}
		
		stats.version++;
	}
	
	function isStatHandleFocus(widget) {
		return widget.deck.handling.time == TIME_PROFILE || widget.deck.handling.time == TIME_CUSTOM;
	}
	
	function getStatStepTimes(widget) {
		if (widget.deck.handling.time == TIME_PROFILE) {
			return $scope.selection.step;
		} else if (widget.deck.handling.time == TIME_CUSTOM) {
			return [widget.settings._timeGroup, widget.settings._timeGroup];
		} else {
			return [null, null];
		}
	}
	
	
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
		var rect = r.container.getBoundingClientRect();
		var x = event.clientX - (rect.x || rect.left) - r.layout.profile.x;
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
	function focusMovePin(id, y, v, label) {
		// Create cache runtime
		if ('undefined' === typeof pinElements[id]) {
			pinElements[id] = document.getElementById(id);
			if (pinElements[id]) {
				if (pinElements[id].querySelectorAll('.pin-value').length > 0)
					pinValueElements[id] = pinElements[id].querySelectorAll('.pin-value')[0];
			}
		}
		// Move (or hide) pin
		if (isNaN(y) || (isFinite(v) && v < 1)) {
			if (pinElements[id]) pinElements[id].style.opacity = 0;
		} else {
			if (y && pinElements[id]) {
				pinElements[id].style.opacity = 1;
				pinElements[id].style.top = y + 'px';
			}
			if (v && pinValueElements[id])	pinValueElements[id].innerHTML = label;
		}
	}

	/**
	 * Focus - global handle
	 */
	//var legendTableList;
	function focusHandle(relativeX, x, maxX) {
		var positions = { isOut: isNaN(relativeX) };
		var stats;
		var needToUpdateStats;
		
		// Check new state
		// NO CHANGE: always on stats mode
		if ((! $scope.focusPosition || $scope.focusPosition.isOut) && positions.isOut) {
			return;
		}
		// NEW MODE: stats
		else if (positions.isOut) {
			// Hide Focus ruler
			$scope.ruler.style.display = 'none';
			
			// Update stats
			for (var s = 0; s < statsCache.length; s++) {
				stats = statsCache[s];
				if (stats.focusable) {
					stats.table.classList.remove('table-focus');
					updateStats(stats, positions);
				}
			}
				
		}
		// NEW MODE: focus
		else {
			needToUpdateStats = ! $scope.focusPosition;
			
			// Compute position
			positions.x = relativeX;
			positions.t = Math.round(relativeX * ($scope.selection.end - $scope.selection.begin) / maxX + $scope.selection.begin);
			
			// Update Focus ruler
			$scope.ruler.style.display = 'initial';
			$scope.ruler.style.left = x + 'px';
			$scope.stamps[0].innerHTML = positions.t + ' ms';
			$scope.stamps[1].innerHTML = positions.t + ' ms';
			
			// Compute position index - Step time specific (by settings)
			var steps;
			for (var s = 0; s < statsCache.length; s++) {
				steps = statsCache[s].getStatStepTimes()
				if (addStepPosition(positions, steps[0])) needToUpdateStats = needToUpdateStats || positions['i' + steps[0]] != $scope.focusPosition['i' + steps[0]];
				if (addStepPosition(positions, steps[1])) needToUpdateStats = needToUpdateStats || positions['i' + steps[1]] != $scope.focusPosition['i' + steps[0]];
			}
			
			// Update stats
			if (needToUpdateStats) {
				for (var s = 0; s < statsCache.length; s++) {
					stats = statsCache[s];
					if (stats.focusable) {
						stats.table.classList.add('table-focus');
						updateStats(stats, positions);
					}
				}
			}
		}
		
		// Post treatment (common to all states)
		$scope.hasFocus = ! positions.isOut;
		$scope.focusPosition = positions;
		$scope.$broadcast('xEvent', positions);
		
		// Launch events to update UI
		$scope.$apply();
	}
	
	function addStepPosition(positions, step) {
		if (positions.isOut) {
			positions['i' + step] = null;
			positions['f' + step] = null;
			return true;
		} else if (! positions['i' + step] && step > 0) {
			positions['i' + step] = Math.floor(positions.t / step);
			positions['f' + step] = Math.floor(positions.t / step) * step;
			return true;
		}
		return false;
	}

	/**
	 * Focus - rules handle
	 */
	var ruleElements = {};
	var ruleValueElements = {};
	function focusRuleHandle(id, y, v, label) {
		if ('undefined' === typeof ruleElements[id]) {
			ruleElements[id] = document.getElementById(id);
			if (ruleElements[id]) {
				ruleValueElements[id] = ruleElements[id].querySelectorAll('.rule-value')[0];
			}
		}
		if (isNaN(y) || v < 1) {
			if (ruleElements[id])		ruleElements[id].style.opacity = 0;
		} else {
			if (ruleElements[id]) {
				ruleElements[id].style.top = y + 'px';
				ruleElements[id].style.opacity = 1;
			}
			if (ruleValueElements[id])	ruleValueElements[id].innerHTML = label;
		}
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
	$scope.hasFocus = false;						// updated by focusHandle
	$scope.focusPosition = null;					// updated by focusHandle
//	$scope.focusX = null;							// updated by focusHandle
//	$scope.focusT = null;							// updated by focusHandle
	$scope.focusRuleHandle = focusRuleHandle;
	$scope.focusInitPins = focusInitPins;
	$scope.focusMovePin = focusMovePin;
}]);