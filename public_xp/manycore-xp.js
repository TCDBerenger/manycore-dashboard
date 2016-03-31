var xpapp = angular.module('manycoreXP', ['ngSanitize', 'ui.router', 'ui.bootstrap']); // , 'gist', 'mcq', 'ngAnimate'

/************************************************/
/* UI States									*/
/************************************************/
xpapp.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', function($stateProvider, $urlRouterProvider, $controllerProvider) {
	$stateProvider
		.state('error', {		url:'/error',				controller: 'PageController', templateUrl: 'page/common/error.html'})
		.state('intro', {		url:'/intro',				controller: 'PageController', templateUrl: 'page/common/introduction.html'})
		.state('thankyou', {	url:'/thankyou',			controller: 'PageController', templateUrl: 'page/common/thankyou.html'})
		.state('page', {		url:'/page/{xp}/{step}',
			controllerProvider: function($stateParams) {
				var controllerName = 'XP' + $stateParams.xp + 'Controller';
				return $controllerProvider.has(controllerName) ? controllerName : 'PageController';
			},
			templateUrl: function ($stateParams) {
				return 'page/xp-' + $stateParams.xp + '/step-' + $stateParams.step + '.html';
			}
	 	})
		
		.state('about-tool', {	url:'/about-tool',	templateUrl: 'survey/tpl/help-tool.html'})
		.state('eval-code', {	url:'/eval-code',	templateUrl: 'survey/tpl/eval-code.html'})
		.state('eval-tool', {	url:'/eval-tool',	templateUrl: 'survey/tpl/eval-tool.html'})
		
		.state('xp', {			url: '/xp/{id}' });
	$urlRouterProvider.otherwise('error');
	
	// TO DELETE
	$urlRouterProvider.otherwise('/xp/99');
}]);


/************************************************/
/* Root scope enhancement						*/
/************************************************/
xpapp.run(['$rootScope', '$state', '$http', 'threads', function($rootScope, $state, $http, threads) { // $location 
	/** 
	 * Flags
	 */
	$rootScope.isXPset = false;
	
	/**
	 * XP
	 */
	$rootScope.xp = {
		id:			NaN,
		user:		NaN,
		group:		NaN,
		step:		NaN,
	};
	
	/**
	 * Current thread
	 */
	$rootScope.thread = null;
	
	/**
	 * Current step
	 */
	$rootScope.step = null;
	
	/**
	 * Network
	 */
	$rootScope.network = {
		hasErrors:	false,
		errors:		[],
	}
	
	/**
	 * Init the xp
	 */
	$rootScope.initXP = function(thread) {
		// Thread
		$rootScope.thread = thread;
	
		// ID
		$rootScope.xp.id = thread.id;
		
		// User
		var userID = localStorage.getItem('user');
		if (userID == null) {
			var hash = new jsSHA("SHA-256", "TEXT");
			hash.update("ManyCore Experiment" + Math.random());
			userID = hash.getHash("HEX").substr(0, 8);
			localStorage.setItem('user', userID);
		}
		$rootScope.xp.user = userID;
		
		// Group
		if ($rootScope.thread.groups > 1) {
			var groupNumber = localStorage.getItem('group' + $rootScope.thread.id);
			if (groupNumber == null) {
				// We don't directly use Math.rand to be sure to have a uniform distribution
				var currentMax = 0;
				var currentRand;
				for (var id = $rootScope.thread.groups; id > 0; id--) {
					currentRand = Math.random();
					if (currentRand > currentMax) {
						currentMax = currentRand;
						groupNumber = id;
					}
				}
				localStorage.setItem('group' + $rootScope.thread.id, groupNumber);
			}
			$rootScope.xp.group = groupNumber;
		} else {
			$rootScope.xp.group = 1;
		}
		
		// Activate XP
		$rootScope.xp.step = -1;
		$rootScope.isXPset = true;
		
		console.log('XP', $rootScope.xp);
	}
	
	/**
	 * UI State control
	 */
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
		// Page Error
		if (toState.name == 'error') {
			// Continue, do nothing
		}
		
		// Page XP - Select the experiment (if exists)
		else if (toState.name == 'xp') {
			if (threads[toParams.id]) {
				// Init XP
				$rootScope.initXP(threads[toParams.id]);
				
				// Start XP
				event.preventDefault();
				$rootScope.actionNext();
			} else {
				// Error
				event.preventDefault();
				$rootScope.actionNext();
			}
		}
		
		// All other pages - Experiment
		else {
			
			// Experiment not selected
			if (! $rootScope.isXPset) {
				event.preventDefault();
//				$state.go('error');			TO UNCOMMENT
				$state.go('xp', {id: 99});	//		TO DELETE
			}
			
			// Next page
			else {
				// Collect page change
				$rootScope.actionWrite({
					type: 'change',
					page_from: fromState.name,
//					page_fromParams: fromParams,
					page_to: toState.name,
//					page_toParams: toParams,
				});
			}
		}
		
    });
	
	/**
	 * Action - Next page
	 */
	$rootScope.actionNext = function() {
		var currentStep = ($rootScope.xp.step >= 0) ? $rootScope.thread.steps[$rootScope.xp.step] : null;
		var nextStep = $rootScope.thread.steps[$rootScope.xp.step + 1];
		
		// Collect data
		if (currentStep) {
			$rootScope.actionWrite({
				type:		'page',
				user_group:	$rootScope.xp.group,
				data_form:	$rootScope.step.form,
			});
		}
		
		// Go to next page
		$rootScope.step = nextStep;
		$rootScope.xp.step = nextStep.id;
		if (nextStep.state)
			$state.go(nextStep.state);
		else
			$state.go('page', {xp: $rootScope.thread.id, step: nextStep.id});
	}
	
	/**
	 * Action - Collect
	 */
	$rootScope.actionWrite = function(payload) {
		sentData = {
			type:		null, // to be overwritten but set in first position for an easy treatment
			date:		new Date(),
			xp_id:		$rootScope.xp.id,
			step_id:	$rootScope.xp.step,
			user_id:	$rootScope.xp.user,
		}
		for (var attr in payload) sentData[attr] = payload[attr];
		console.debug('Collecting', sentData, payload);
		
		$http.post('/service/collect', sentData)
			.then(function successCallback(response) {
				console.debug('Collect: OK', response.status, response.statusText);
			}, function errorCallback(response) {
				$rootScope.network.hasErrors = true;
				$rootScope.network.errors.push(response);
				console.error('Collect: KO', response.status, response.statusText);
			});	
	}
}]);

/************************************************/
/* Filters										*/
/************************************************/

/************************************************/
/* Directives									*/
/************************************************/
