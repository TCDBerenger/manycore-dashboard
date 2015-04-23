var app = angular.module('manycoreDashboard', ['ui.router', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('dashboard', {
			url: '/dashboard',
			templateUrl: '/dashboard/dashboard.view.html',
			controller: 'DashboardController',
			resolve: {
				profilesPromise: ['profileService', function(profileService){
					return profileService.getAll();
				}]
			}
		})
		.state('detail', {
			url: '/detail/{cat:[b-y]{1,2}}/{ids}',
			templateUrl: '/details/detail.view.html',
			controller: 'DetailController',
			resolve: {
				selectedProfiles: ['$stateParams', 'profileService', function($stateParams, profileService) {
					return profileService.gets($stateParams.ids);
				}],
				dataProfiles: ['$stateParams', 'detailService', function($stateParams, detailService) {
					return detailService.gets($stateParams.cat, $stateParams.ids);
				}]
			}
		});/*
		.state('detail.tg', { templateUrl: '/detail/tg/', views: {	} })
		.state('detail.sy', { templateUrl: '/detail/sy/', views: {	} })
		.state('detail.ds', { templateUrl: '/detail/ds/', views: {	} })
		.state('detail.lb', { templateUrl: '/detail/lb/', views: {	} })
		.state('detail.dl', { templateUrl: '/detail/dl/', views: {	} })
		.state('detail.rs', { templateUrl: '/detail/rs/', views: {	} })
		.state('detail.io', { templateUrl: '/detail/io/', views: {	} });*/
	
	$urlRouterProvider.otherwise('dashboard');
}]);

/*
		.state('dashboard', {
			url: '/dashboard',
			templateUrl: '/dashboard/dashboard.view.html',
			controller: 'DashboardController',
			resolve: {
				promise: ['profiles', function(profiles){
					return profiles.getAll();
				}]
			}
		})
*/


/**********************************************************/
/*														  */
/* Root scope enhancement								  */
/*														  */
/**********************************************************/
app.run(function($rootScope) {
	/**
	 * Selected profiles
	 */
	$rootScope.selectedIDs = [];
    //$rootScope.selectedProfiles = [];

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
});

app.filter('iif', [function () {
   return function(input, trueValue, falseValue) {
        return input ? trueValue : falseValue;
   };
}]);
