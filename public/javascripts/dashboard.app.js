var app = angular.module('manycoreDashboard', ['ui.router', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('dashboard', {
			url: '/dashboard',
			templateUrl: '/dashboard.html',
			controller: 'DashboardController',
			resolve: {
				promise: ['profiles', function(profiles){
					return profiles.getAll();
				}]
			}
		})
		.state('detail', {
			url: '/detail/{cat:[b-y]{1,2}}/{ids}',
			templateUrl: '/detail.html',
			controller: 'DetailController',
			resolve: {
				selected: ['$stateParams', 'profiles', function($stateParams, profiles) {
					return profiles.gets($stateParams.ids);
				}]
			}
		});
	
	$urlRouterProvider.otherwise('dashboard');
}]);

app.run(function($rootScope) {
    $rootScope.selectedProfiles = [];
});

app.factory('widgets', [function(){
	var output = {};
	
	output.cacheInvalid		= {id: 'cache-invalid',		title: 'Cache line invalidation',	subtitle:''};
	output.cacheMisses		= {id: 'cache-misses',		title: 'Cache misses',				subtitle:''};
	output.coreInactivity	= {id: 'core-inactivity',	title: 'Core inactivity',			subtitle:''};
	output.syncCosts		= {id: 'sync-costs',		title: 'Synchronisation costs',		subtitle:''};
	output.threadPaths		= {id: 'thread-paths',		title: 'Thread paths',				subtitle:'Sequential vs. Parallel'};
	output.threadChains		= {id: 'thread-chains',		title: 'Thread chains',				subtitle:'Data dependencies and critical routes'};
	output.threadRunning	= {id: 'thread-running',	title: 'Thread running lifetime',	subtitle:''};
	output.threadLocks		= {id: 'thread-locks',		title: 'Thread lock lifetime',		subtitle:''};
	output.threadDivergence	= {id: 'thread-divergence',	title: 'Thread divergence',			subtitle:''};
	output.threadMigrations	= {id: 'thread-migrations',	title: 'Thread migrations',			subtitle:''};
	output.threadSwitchs	= {id: 'thread-switchs',	title: 'Thread switches',			subtitle:''};
	
	return output;
}]);

app.factory('details', ['widgets', function(widgets){
	var output = [
		{
			cat: 'tg', label: 'Task granularity', icon: 'tasks',
			widgets: [widgets.threadSwitchs, widgets.threadMigrations, widgets.threadRunning, widgets.threadDivergence]
		},
		{
			cat: 'sy', label: 'Synchronisation', icon: 'cutlery',
			widgets: [widgets.syncCosts, widgets.threadLocks]
		},
		{
			cat: 'ds', label: 'Data sharing', icon: 'share-alt',
			widgets: [widgets.syncCosts, widgets.cacheInvalid, widgets.cacheMisses]
		},
		{
			cat: 'lb', label: 'Load balancing', icon: 'code-fork',
			widgets: [widgets.coreInactivity, widgets.syncCosts, widgets.threadMigrations, widgets.threadDivergence, widgets.threadPaths, widgets.threadChains]
		},
		{
			cat: 'dl', label: 'Data locality', icon: 'location-arrow',
			widgets: [widgets.cacheMisses]
		},
		{
			cat: 'rs', label: 'Resource sharing', icon: 'exchange',
			widgets: []
		},
		{
			cat: 'io', label: 'Input/Output', icon: 'plug',
			widgets: []
		}
	]
	
	return output;
}]);

app.factory('profiles', ['$http', function($http) {
	var output = {
		all: [],
		map: {}
	};
	
	output.reindexation = function() {
		output.map = {};
		
		output.all.forEach(function(profile, index, array) {
			output.map[profile.id] = index;
		});
	}
	
	output.getAll = function() {
		return $http.get('/profiles').success(function(data) {
			angular.copy(data, output.all);
			output.reindexation();
		});
	};
	
	output.gets = function(ids) {
		return $http.get('/profiles/' + ids).then(function(res){
			var selected = [];
			
			angular.copy(res.data, selected);
			/*
			selected.forEach(function(profile) {
				output.all[output.map[profile.id]] = profile;
			});
			*/
			return selected;
		});
	};
	
	return output;
}]);

app.filter('iif', [function () {
   return function(input, trueValue, falseValue) {
        return input ? trueValue : falseValue;
   };
}]);