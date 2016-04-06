var xpapp = angular.module('manycoreXP', ['ngSanitize', 'ui.router', 'ui.bootstrap']); // , 'gist', 'mcq', 'ngAnimate'

/************************************************/
/* UI States									*/
/************************************************/
xpapp.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', function($stateProvider, $urlRouterProvider, $controllerProvider) {
	$stateProvider
		.state('error', {		url:'/error',									  templateUrl: 'page/common/error.html'})
		.state('consent', {		url:'/consent',		controller: 'PageController', templateUrl: 'page/common/consent.html'})
		.state('user', {		url:'/user',		controller: 'PageController', templateUrl: 'page/common/user.html'})
		.state('thankyou', {	url:'/thankyou',								  templateUrl: 'page/common/thankyou.html'})
		.state('toolall', {		url:'/toolall',		controller: 'ToolController', templateUrl: 'page/common/tool-all.html'})
		.state('toolpage', {	url:'/toolpage',	controller: 'ToolController', templateUrl: 'page/common/tool-page.html'})
		.state('page', {		url:'/page/{xp}/{step}',
			controllerProvider: function($stateParams) {
				var controllerName = 'XP' + $stateParams.xp + 'Controller';
				return $controllerProvider.has(controllerName) ? controllerName : 'PageController';
			},
			templateUrl: function ($stateParams) {
				return 'page/xp-' + $stateParams.xp + '/step-' + $stateParams.step + '.html';
			}
	 	});
	
	// XP init
	$urlRouterProvider.when('/xp/{id:[0-9]{1,2}}', ['$match', '$rootScope', '$timeout', 'threads', function ($match, $rootScope, $timeout, threads) {
		$timeout(function() {
			$rootScope.initXP(threads[$match.id]);
			$rootScope.actionNext();
		});
		return true;
	}]);
	
	// Default path
	$urlRouterProvider.otherwise('error');
	
	// TO DELETE
	$urlRouterProvider.otherwise('/xp/1');
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
		// Prerequites
		if (! thread) $rootScope.actionError();
		
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
		
		// Save current state
		localStorage.setItem('currentXP', thread.id);
		console.log('XP', $rootScope.xp);
	}
	
	/**
	 * Clear the xp
	 */
	$rootScope.clearXP = function(thread) {
		localStorage.removeItem('user');
		localStorage.removeItem('group' + $rootScope.thread.id);
		localStorage.removeItem('currentXP');
		localStorage.removeItem('currentStep');
	}
	
	/**
	 * UI State control
	 */
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
		// Redirect to error if no xp is set
		if (toState.name != 'error' && ! $rootScope.isXPset) {
			if (localStorage.getItem('currentXP') && threads[localStorage.getItem('currentXP')] && threads[localStorage.getItem('currentXP')].steps[localStorage.getItem('currentStep')]) {
				$rootScope.initXP(threads[localStorage.getItem('currentXP')]);
				$rootScope.actionNext(localStorage.getItem('currentStep'));
			} else {
				event.preventDefault();
				$state.go('error');
			}
		}
    });
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		// Collect page change
		if ($rootScope.isXPset) {
			$rootScope.actionWrite({
				type: 'change',
				page_from: fromState.name,
//				page_fromParams: fromParams,
				page_to: toState.name,
//				page_toParams: toParams,
			});
		}
		
		if (toState.name == 'thankyou') {
			$rootScope.clearXP();
		}
	});
	
	/**
	 * Action - Error page
	 */
	$rootScope.actionError = function() {
		$state.go('error');
	}
	
	/**
	 * Action - Next page
	 */
	$rootScope.actionNext = function(stepID) {
		var currentStep = ($rootScope.xp.step >= 0) ? $rootScope.thread.steps[$rootScope.xp.step] : null;
		var nextStep = $rootScope.thread.steps[stepID || $rootScope.xp.step + 1];
		
		// Collect data
		if (currentStep) {
			var frameXP = (currentStep.mousetrack) ? document.getElementById("toolFrame").contentWindow.xp : null;
			$rootScope.actionWrite({
				type:		'page',
				user_group:	$rootScope.xp.group,
				data_form:	$rootScope.step.form,
				data_track: (currentStep.mousetrack && frameXP) ? frameXP.heatmap : null,
			});
		}
		
		// Go to next page
		$rootScope.step = nextStep;
		$rootScope.xp.step = nextStep.id;
		if (nextStep.state)
			$state.go(nextStep.state);
		else
			$state.go('page', {xp: $rootScope.thread.id, step: nextStep.pageID});
		
		// Save current state
		localStorage.setItem('currentStep', nextStep.id);
	}
	
	/**
	 * Action - Collect
	 */
	$rootScope.actionWrite = function(payload) {
		var sentData = {
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
