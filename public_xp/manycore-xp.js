var xpapp = angular.module('manycoreXP', ['ui.router', 'ui.bootstrap']); // , 'gist', 'mcq', 'ngAnimate'

xpapp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('index',			{ url:'/index',			templateUrl: 'templates/introduction.html'})
		.state('about-code',	{ url:'/about-code',	templateUrl: 'survey/tpl/help-code.html'})
		.state('about-tool',	{ url:'/about-tool',	templateUrl: 'survey/tpl/help-tool.html'})
		.state('eval-code',		{ url:'/eval-code',		templateUrl: 'survey/tpl/eval-code.html'})
		.state('eval-tool',		{ url:'/eval-tool',		templateUrl: 'survey/tpl/eval-tool.html'})
		.state('thankyou',		{ url:'/thankyou',		templateUrl: 'survey/tpl/thankyou.html'});
	
	$urlRouterProvider.otherwise('index');
}]);


/**********************************************************/
/*														  */
/* Root scope enhancement								  */
/*														  */
/**********************************************************/
xpapp.run(function($rootScope) {
	$rootScope.isXPset = false;
	$rootScope.xp = {
		id:			NaN,
		version:	NaN,
		group:		NaN,
		step:		NaN,
	};
	$rootScope.thread = null;
	
	/**
	 * Init the xp
	 */
	$rootScope.initXP = function(thread) {
		// Thread
		$rootScope.thread = thread;
	
		// ID
		
		// Version
		
		// Group
		var groupNumber = localStorage.getItem('group');
		if (groupNumber == null) {
			groupNumber = Math.floor(Math.random() * 4)
			localStorage.setItem('group', groupNumber);
		}
		$rootScope.xp.group = groupNumber;
		
		// Step
		$rootScope.xp.step = NaN;
		
		console.log('XP', $rootScope.xp);
	}
	
	// TO REMOVE -- put in the right place (state where to choose the xp)
	$rootScope.initXP();
});


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
