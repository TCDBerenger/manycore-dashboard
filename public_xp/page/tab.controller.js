xpapp.controller('TabController', ['$controller', '$scope', '$rootScope', '$state', function($controller, $scope, $rootScope, $state) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	$controller('PageController', { $scope: $scope, $rootScope: $rootScope });
	
	switch ($state.current.name) {
		case 'consent':		initConsent();		break;
	}
	
	
	/************************************************/
	/* Constructor - Data							*/
	/************************************************/
	// Common tabs
	$scope.tabIndex = 0;
	
	
	/************************************************/
	/* Consent										*/
	/************************************************/
	function initConsent() {
		// Tabs
		$scope.tabIndex = 0;
		$scope.tabs = [
			{ l: 'Information',	t: 'Information' },
			{ l: 'Consent',		t: 'Consent' },
		];
	};
}]);