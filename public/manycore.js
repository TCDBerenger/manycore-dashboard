var app = angular.module('manycoreDashboard', ['ui.router', 'ui.bootstrap']); // , 'ngCookies'

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('welcome', {
			url: '/welcome',
			templateUrl: '/welcome/welcome.view.html',
			controller: 'WelcomeController'
		})
		.state('dashboard', {
			url: '/dashboard/{ids}',
			templateUrl: '/dashboard/dashboard.view.html',
			controller: 'DashboardController',
			resolve: {
				profilesPromise: ['profileService', function(profileService){
					return profileService.getAll();
				}]
			}
		})
		.state('raw', {
			url: '/raw/{ids}',
			templateUrl: '/raw/raw.view.html',
			controller: 'RawController',
			controllerAs: 'dc',
			resolve: {
				selectedProfiles: ['$stateParams', 'profileService', function($stateParams, profileService) {
					return profileService.gets($stateParams.ids);
				}]
			}
		})
		.state('detail', {
			url: '/detail/{cat:[b-y]{1,2}}/{ids}',
			templateUrl: '/details/detail.view.html',
			controller: 'DetailController',
			controllerAs: 'dc',
			resolve: {
				selectedProfiles: ['$stateParams', 'profileService', function($stateParams, profileService) {
					return profileService.gets($stateParams.ids);
				}]/*,
				dataProfiles: ['$stateParams', 'detailService', function($stateParams, detailService) {
					return detailService.gets($stateParams.cat, $stateParams.ids);
				}]*/
			}
		})
		.state('admin', {
			url: '/admin',
			templateUrl: '/admin/admin.view.html',
			controller: 'AdminController'
		})
		.state('settings', {
			url: '/settings',
			templateUrl: '/settings/settings.view.html',
			controller: 'SettingsController'
		});
	
	$urlRouterProvider.when('/xp/{opts}/{path:.*}', ['$match', '$rootScope', '$timeout', function ($match, $rootScope, $timeout) {
		$timeout(function() {
			$rootScope.xpActivate($match.opts.split('-'));
		});
		return $match.path;
	}]);
	$urlRouterProvider.otherwise('welcome');
}]);


/**********************************************************/
/*														  */
/* XP environment										  */
/*														  */
/**********************************************************/
app.value('xp', {
	isRunning:		false,
	isCapturing:	false,
	options: {
		feedback:	false,
	},
	width:			null,
	heatmap:		[],
});


/**********************************************************/
/*														  */
/* Root scope enhancement								  */
/*														  */
/**********************************************************/
app.run(['$rootScope', '$state', '$location', '$window', '$document', '$timeout', 'xp', function($rootScope, $state, $location, $window, $document, $timeout, xp) {
	/**
	 * Handlers - states
	 */
	var mainContainerElement = document.getElementById('content');
	var mainContainerInitialClasses = mainContainerElement.className;
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
		// CSS automation
		mainContainerElement.className = mainContainerInitialClasses + ' ' + toState.name;
		// XP Heatmap
		if (xp.isRunning) $rootScope.xpSuspend();
	});
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		// XP Heatmap
		if (xp.isRunning) $timeout(function () { $rootScope.xpReactivate(); });
	});
	
	/**
	 * Selected profiles
	 */
	$rootScope.selectedIDs = [];

	/**
	 * Join
	 */
	$rootScope.encodeSelectedProfile = function encodeSelectedProfile() {
		return $rootScope.selectedIDs.join("-");
	};
	
	/**
	 * Save profiles
	 */
	$rootScope.saveSelectedProfiles = function saveSelectedProfiles(profiles) {
		// Empty array
		$rootScope.selectedIDs.splice(0, $rootScope.selectedIDs.length);

		// Add id
		profiles.forEach(function(profile) {
			$rootScope.selectedIDs.push(profile.id);
		})
	};
	
	/**
	 * Save ids
	 */
	$rootScope.saveSelectedIDs = function saveSelectedIDs(ids) {
		// Empty array
		$rootScope.selectedIDs.splice(0, $rootScope.selectedIDs.length);

		// Add id
		ids.forEach(function(id) {
			$rootScope.selectedIDs.push(id);
		})
	};
	
	/**
	 * Has ids
	 */
	$rootScope.hasSelectedProfile = function hasSelectedProfile() {
		return $rootScope.selectedIDs.length > 0;
	};
	
	/**
	 * Invert ids
	 */
	$rootScope.invert = function invert() {
		return $rootScope.selectedIDs.reverse();
	};
	
	/**
	 * Clear ids
	 */
	$rootScope.clear = function clear() {
		return $rootScope.selectedIDs.splice(0, $rootScope.selectedIDs.length);
	};
	
	/**
	 * Handle state changes
	 */
	$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
		if (to.name == "welcome") {
			$rootScope.clear();
		}
	});
	
	/**
	 * XP - Activation
	 */
	$rootScope.xpActivate = function(options) {
		// Vars
		xp.isRunning = true;
		options.forEach(function(option) { if (option in xp.options) xp.options[option] = true; });
		
		// Expose XP
		$window.xp = xp;
		
		// Heatmap
		xp.isCapturing = false;
		xp.width = Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
		
		// Heatmap feedback (option)
		if (xp.options.feedback) {
			$rootScope.xpCanvas = angular.element('<canvas id="xpHeatmap"></canvas>');
			$rootScope.xpCanvas.css({
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: '100%',
				zIndex: '-1',
				border: '4px solid #00526E'
			});
			
			$document.find('body').eq(0).append($rootScope.xpCanvas);
			$rootScope.xpHeatmapRender = simpleheat("xpHeatmap");
			$rootScope.xpHeatmapRender.max(10);
			$rootScope.xpHeatmapRender.radius(25, 15);
			$rootScope.xpHeatmapRenderRequest = null;
			$rootScope.xpCanvas.remove();
		}
		
		// Heatmap resize handling
		angular.element($window).bind('resize', function() {
			if (xp.isCapturing) {
				var currentCapture = xp.heatmap[xp.heatmap.length - 1];
				if (currentCapture.h != Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight) ||
					currentCapture.w != Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth)) {
					$rootScope.xpReactivate();
				}
			}
		});
		
		// Capturing
		document.onmousemove = $rootScope.xpCapturingMove;
		document.onclick = $rootScope.xpCapturingClick;
	};
	
	/**
	 * XP - Before changing page, suspend heatmap
	 */
	$rootScope.xpSuspend = function() {
		// Suspend capturing
		xp.isCapturing = false;
		
		// Heatmap feedback (option)
		if (xp.options.feedback) {
			$rootScope.xpCanvas.css({ height: '0px' });
			$rootScope.xpCanvas.remove();
			$rootScope.xpHeatmapRender.clear();
		}
	};
	
	/**
	 * XP - After changing page, reactivate heatmap
	 */
	$rootScope.xpReactivate = function() {
		// Temporarily suspend capturing
		if (xp.isCapturing) {
			$rootScope.xpSuspend();
		}
		
		// Heatmap feedback (option)
		if (xp.options.feedback)  {
			$document.find('body').eq(0).append($rootScope.xpCanvas);
			var maxHeight = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight);
			var maxWidth = Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
			$rootScope.xpCanvas.css({ height: maxHeight + 'px' });
		}
		
		// Reset capturing lists
		// for new page or new screen size
		$rootScope.hmHover = [];
		$rootScope.hmClick = [];
		xp.heatmap.push({ u: $location.path(), h: maxHeight, w: maxWidth, o: $rootScope.hmHover, c: $rootScope.hmClick });
		
		// Activate capturing
		xp.isCapturing = true;
	};
	
	/**
	 * XP - Capturing
	 */
	$rootScope.xpCapturingMove = function(event) {
		if (xp.isCapturing && event.clientX >= 0 && event.clientX >= 0) {
			$rootScope.hmHover.push([event.clientX, event.clientY]);
			/*
			if (! $rootScope.hmHover[event.clientX])				$rootScope.hmHover[event.clientX] = [];
			if ($rootScope.hmHover[event.clientX][event.clientY])	$rootScope.hmHover[event.clientX][event.clientY]++;
			else												$rootScope.hmHover[event.clientX][event.clientY] = 1;
			*/
			
			// Heatmap feedback (option)
			if (xp.options.feedback) {
				$rootScope.xpHeatmapRender.add([event.clientX, event.clientY, 1]);
				$rootScope.xpHeatmapRenderRequest = $rootScope.xpHeatmapRenderRequest || window.requestAnimationFrame($rootScope.xpHeatmapRenderDraw);
			}
		}
	};
	$rootScope.xpCapturingClick = function(event) {
		if (xp.isCapturing && event.clientX >= 0 && event.clientX >= 0) {
			$rootScope.hmClick.push([event.clientX, event.clientY]);
			/*
			if (! $rootScope.hmClick[event.clientX])				$rootScope.hmClick[event.clientX] = [];
			if ($rootScope.hmClick[event.clientX][event.clientY])	$rootScope.hmClick[event.clientX][event.clientY]++;
			else												$rootScope.hmClick[event.clientX][event.clientY] = 1;
			*/
		}
	};
	
	/**
	 * XP - Heatmap render drawing
	 */
	$rootScope.xpHeatmapRenderDraw = function() {
		$rootScope.xpHeatmapRender.draw();
		$rootScope.xpHeatmapRenderRequest = null;
	};
}]);

app.filter('iif', [function () {
   return function(input, trueValue, falseValue) {
        return input ? trueValue : falseValue;
   };
}]);

app.filter('reverse', function() {
	return function(items) {
		return items ? items.slice().reverse() : items;
	};
});

app.filter('range', function() {
	return function(val, range) {
		range = parseInt(range);
		for (var i = range - 1; i >= 0; i--) {
			val.push(i);
		};
		return val;
	};
});

app.filter('cell', function() {
	return function(val, length, cols) {
		var range = Math.ceil(parseInt(length) / parseInt(cols));
		for (var i = range - 1; i >= 0; i--) {
			val.push(i);
		};
		return val;
	};
});

app.filter('enabled', function() {
	return function(items) {
		var results = [];
		items.forEach(function(item) { if ((item.enabled || ! ('enabled' in item)) && ! item.disabled) results.push(item) });
		return results;
	};
});

app.filter('notin', function() {
	return function(items, excluded) {
		var results = [];
		items.forEach(function(item) { if (excluded.indexOf(item) < 0) results.push(item) });
		return results;
	};
});

app.filter('v3', function() {
	return function(items) {
		var results = [];
		items.forEach(function(item) { if (item.version == 3) results.push(item) })
		return results;
	};
});
app.filter('v4', function() {
	return function(items) {
		var results = [];
		items.forEach(function(item) { if (item.version == 4) results.push(item) })
		return results;
	};
});
app.filter('v4atleast', function() {
	return function(items) {
		var results = [];
		items.forEach(function(item) { if (item.version >= 4) results.push(item) })
		return results;
	};
});
app.filter('v5', function() {
	return function(items) {
		var results = [];
		items.forEach(function(item) { if (item.version == 5) results.push(item) })
		return results;
	};
});
app.filter('v5atleast', function() {
	return function(items) {
		var results = [];
		items.forEach(function(item) { if (item.version >= 5) results.push(item) })
		return results;
	};
});

app.directive('proxyLinkDirective', ['$parse', '$injector', '$compile', function ($parse, $injector, $compile) {
	return {
		restrict: 'E',
		link: function (scope, element, attrs, controller) {
			if (attrs.graph != null && $injector.has(attrs.graph + 'Directive')) {
				$injector.get(attrs.graph + 'Directive')[0].link(scope, element, attrs, controller);
			}
		}
	}
}]);