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
	
	$urlRouterProvider.otherwise('welcome');
}]);


/**********************************************************/
/*														  */
/* Root scope enhancement								  */
/*														  */
/**********************************************************/
app.run(function($rootScope) {
	/**
	 * Handlers - states
	 */
	var initialContentClasses = document.getElementById('content').className;
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) { 
		document.getElementById('content').className = initialContentClasses + ' ' + toState.name;
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
});

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