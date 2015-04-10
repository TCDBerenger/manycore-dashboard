var app = angular.module('manycoreDashboard', ['ui.router', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('dashboard', {
			url: '/dashboard',
			views: {
				'@': {
					templateUrl: '/dashboard/dashboard.view.html',
					controller: 'DashboardController'
				},
				'sidebar': {
					templateUrl: '/sidebar/sidebar.view.html',
					controller: 'SidebarController'
				}},
			resolve: {
				promise: ['profiles', function(profiles){
					return profiles.getAll();
				}]}
			})
		.state('detail', {
			url: '/detail/{cat:[b-y]{1,2}}/{ids}',
			views: {
				'@': {
					templateUrl: '/detail/detail.view.html',
					controller: 'DetailController'
				},
				'sidebar': {
					templateUrl: '/sidebar/sidebar.view.html',
					controller: 'SidebarController'
				}},
			resolve: {
				selected: ['$stateParams', 'profiles', function($stateParams, profiles) {
					return profiles.gets($stateParams.ids);
				}]
			}
		});
	
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

app.run(function($rootScope) {
    $rootScope.selectedProfiles = [];
});

app.filter('iif', [function () {
   return function(input, trueValue, falseValue) {
        return input ? trueValue : falseValue;
   };
}]);