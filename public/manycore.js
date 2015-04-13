var app = angular.module('manycoreDashboard', ['ui.router', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
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
		.state('detail', {
			url: '/detail/{cat:[b-y]{1,2}}/{ids}',
			templateUrl: '/detail/detail.view.html',
			controller: 'DetailController',
			resolve: {
				selected: ['$stateParams', 'profiles', function($stateParams, profiles) {
					return profiles.gets($stateParams.ids);
				}]
			}
		});
		/*
		.state('detail.tg', { templateUrl: '/detail/tg/', views: {	} })
		.state('detail.sy', { templateUrl: '/detail/sy/', views: {	} })
		.state('detail.ds', { templateUrl: '/detail/ds/', views: {	} })
		.state('detail.lb', { templateUrl: '/detail/lb/', views: {	} })
		.state('detail.dl', { templateUrl: '/detail/dl/', views: {	} })
		.state('detail.rs', { templateUrl: '/detail/rs/', views: {	} })
		.state('detail.io', { templateUrl: '/detail/io/', views: {	} });
		*/
	
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