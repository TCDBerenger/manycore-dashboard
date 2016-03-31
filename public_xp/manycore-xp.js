var xpapp = angular.module('manycoreXP', ['ui.router', 'ui.bootstrap']); // , 'gist', 'mcq', 'ngAnimate'

xpapp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('error', {		url:'/error',		controller: 'PageController', templateUrl: 'page/common/error.html'})
		.state('intro', {		url:'/intro',		controller: 'PageController', templateUrl: 'page/common/introduction.html'})
		.state('thankyou', {	url:'/thankyou',	controller: 'PageController', templateUrl: 'page/common/thankyou.html'})
		
		.state('about-code', {	url:'/about-code',	templateUrl: 'survey/tpl/help-code.html'})
		.state('about-tool', {	url:'/about-tool',	templateUrl: 'survey/tpl/help-tool.html'})
		.state('eval-code', {	url:'/eval-code',	templateUrl: 'survey/tpl/eval-code.html'})
		.state('eval-tool', {	url:'/eval-tool',	templateUrl: 'survey/tpl/eval-tool.html'})
		
		.state('xp', {			url: '/xp/{id}' });
	$urlRouterProvider.otherwise('error');
	
	// TO DELETE
	$urlRouterProvider.otherwise('/xp/99');
}]);

/************************************************/
/* Functions - Utils							*/
/************************************************/
/**
 * Validate number
 */
function normalInteger(value) {
	return (value < 100 && value > 0 && value == ~~value) ? value : 0; 
}

/************************************************/
/* Experiment thread data						*/
/************************************************/
xpapp.factory('threads', function() {
	var looseThreads = [
		{
			id: 99, version: 1,
			title: 'Test',
			steps: [
				// init a form:					form:m { ... }
				// display next in sidebar:		nextInSidebar: true
			]
		},
	];
	

	// ID treatment
	var threads = [];
	looseThreads.forEach(function (thread) {
		thread.steps.unshift({label: 'introduction', state: 'intro', form: {}});
		thread.steps.push({label: 'the end', state: 'thankyou'});
		thread.steps.forEach(function(step, index) { step.id = index; });
		threads[thread.id] = thread;
	});
	
	return threads;
});



/**********************************************************/
/*														  */
/* Root scope enhancement								  */
/*														  */
/**********************************************************/
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
		version:	NaN,
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
	
		// ID and version
		$rootScope.xp.id = thread.id;
		$rootScope.xp.version = thread.version;
		
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
		var groupNumber = localStorage.getItem('group');
		if (groupNumber == null) {
			groupNumber = Math.floor(Math.random() * 4)
			localStorage.setItem('group', groupNumber);
		}
		$rootScope.xp.group = groupNumber;
		
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
					to: toState.name,
//					toParams: toParams,
					from: fromState.name,
//					fromParams: fromParams,
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
				type: 'page',
				form: $rootScope.thread.form,
			});
		}
		
		// Go to next page
		$rootScope.step = nextStep;
		$rootScope.xp.step = nextStep.id;
		$state.go(nextStep.state);
	}
	
	/**
	 * Action - Collect
	 */
	$rootScope.actionWrite = function(data) {
		var sentData = JSON.parse(JSON.stringify($rootScope.xp));
		for (var attr in data && data[attr]) if (data.hasOwnProperty(attr)) sentData[attr] = data[attr];
		sentData.date = new Date();
		
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


/**********************************************************/
/*														  */
/* Global filters										  */
/*														  */
/**********************************************************/



/**********************************************************/
/*														  */
/* Global directives									  */
/*														  */
/**********************************************************/
